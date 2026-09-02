/**
 * Server Actions de PEDIDOS (FASE 6 · migración 0007).
 *
 * · Solo uso SERVIDOR (use server). Usa obtenerClienteServicioSupabase().
 * · La creación valida, calcula precios y persiste TODO en el servidor; nunca
 *   se confía en precios/totales enviados por el cliente.
 * · Estado inicial: 'recibido'. El numero_pedido (KP-XXXXXX) lo genera el
 *   trigger de Supabase (ver migración 0007).
 * · Checkout, WhatsApp, Resend y cambios de estado: pasos posteriores.
 */

"use server";

import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type {
  ClienteRow,
  MetodoPago,
  PedidoRow,
} from "@/lib/supabase/tipos-db";
import {
  calcularPrecioEfectivo,
  mapearPromocion,
  type PromocionVigente,
} from "@/lib/catalogo/promociones";
import { construirResolutorCategorias } from "@/lib/catalogo/adaptadores";
import {
  esZonaDeCobertura,
  tarifaDomicilioPara,
} from "@/lib/config/domicilio";
import type { PedidoConRelaciones } from "@/lib/pedidos/consultas";
import { construirHtmlConfirmacionPedido } from "@/lib/resend/plantilla-confirmacion";
import { enviarCorreo } from "@/lib/resend/servicio";

/** Datos de identificación/contacto del comprador (checkout como invitado). */
export interface DatosClientePedido {
  nombre: string;
  telefono: string;
  email?: string;
}

/** Dirección de entrega del pedido (también se guarda como snapshot del cliente). */
export interface DireccionEntrega {
  direccion: string;
  barrio?: string;
  ciudad: string;
  departamento?: string;
  notas?: string;
}

/** Ítem del carrito: solo se envía la variante y su cantidad; el producto se
 *  deriva del servidor desde la variante (el cliente nunca envía precios). */
export interface ItemPedidoEntrada {
  varianteId: string;
  cantidad: number;
}

export interface CrearPedidoEntrada {
  cliente: DatosClientePedido;
  direccionEntrega: DireccionEntrega;
  items: ItemPedidoEntrada[];
  metodoPago: MetodoPago;
}

/**
 * Resultado de crearPedido(). Por diseño seguimos la convención del resto de
 * las Server Actions del proyecto (ver las acciones del panel admin): los
 * errores esperables se DEVUELVEN como dato ({ ok:false, error }) y NO se lanzan.
 * Lanzar un Error desde una Server Action hace que, en producción, React lo
 * exponga al cliente como "Minified React error #441" (mensaje omitido por
 * seguridad), impidiendo mostrar el detalle real al usuario.
 */
export type ResultadoCrearPedido =
  | { ok: true; pedido: PedidoConRelaciones }
  | { ok: false; error: string };

/** Ítem recalculado en servidor a partir de las filas reales de catálogo. */
interface ItemRecalculado {
  productoId: string;
  varianteId: string;
  nombreProducto: string;
  nombreVariante: string;
  precioUnitario: number;
  cantidad: number;
  subtotalLinea: number;
}

function lanzarError(mensaje: string): never {
  throw new Error(`[pedidos:crearPedido] ${mensaje}`);
}

/** Valida un teléfono básico (formato libre pero no vacío y coherente). */
function telefonoValido(telefono: string): boolean {
  return /^[0-9+\-\s()]{7,20}$/.test(telefono.trim());
}

function validarEntrada(entrada: CrearPedidoEntrada): void {
  const c = entrada.cliente;
  const d = entrada.direccionEntrega;

  if (!c.nombre || !c.nombre.trim()) lanzarError("El nombre del cliente es obligatorio.");
  if (!telefonoValido(c.telefono)) lanzarError("El teléfono del cliente no es válido.");
  if (!esZonaDeCobertura(d.ciudad.trim())) {
    lanzarError("La zona seleccionada no tiene servicio de domicilio.");
  }
  if (!d.direccion || !d.direccion.trim()) lanzarError("La dirección es obligatoria.");

  if (!entrada.items || entrada.items.length === 0) {
    lanzarError("El pedido debe incluir al menos un producto.");
  }
  for (const item of entrada.items) {
    if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      lanzarError("La cantidad de cada producto debe ser un entero mayor a cero.");
    }
    if (!item.varianteId) {
      lanzarError("Cada ítem debe indicar la variante.");
    }
  }
}

/** Promociones vigentes para resolver el precio efectivo de cada variante. */
async function obtenerPromocionesVigentesServidor(): Promise<PromocionVigente[]> {
  const supabase = obtenerClienteServicioSupabase();
  const ahora = new Date().toISOString();
  const { data, error } = await supabase
    .from("promociones")
    .select("*")
    .eq("activo", true)
    .lte("fecha_inicio", ahora)
    .gte("fecha_fin", ahora);
  if (error) lanzarError(`obtenerPromocionesVigentes: ${error.message}`);
  return (data ?? []).map(mapearPromocion);
}

async function construirResolutor(): Promise<(id: string, slug: string) => boolean> {
  const supabase = obtenerClienteServicioSupabase();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, slug, parent_id");
  if (error) lanzarError(`construirResolutor: ${error.message}`);
  return construirResolutorCategorias(data ?? []);
}

/**
 * Recalcula los ítems en servidor a partir de las variantes reales del
 * catálogo. Aplica la misma lógica de precio efectivo que la tienda
 * (mejor promo vigente y descuento_porcentaje, sin acumulación). Valida que
 * producto/variante estén activos y que haya stock suficiente.
 */
async function recalcularItems(
  items: ItemPedidoEntrada[]
): Promise<{ items: ItemRecalculado[]; subtotal: number }> {
  const supabase = obtenerClienteServicioSupabase();
  const idsVariantes = [...new Set(items.map((i) => i.varianteId))];

  const { data, error } = await supabase
    .from("variantes_producto")
    .select(
      `
      id,
      producto_id,
      nombre,
      precio,
      descuento_porcentaje,
      stock,
      activo,
      productos(id, nombre, marca_id, activo, es_prueba, categorias(slug))
    `
    )
    .in("id", idsVariantes);
  if (error) lanzarError(`recalcularItems: ${error.message}`);
  if (!data) lanzarError("No se pudieron cargar las variantes del pedido.");

  const variantes = data as unknown as Array<{
    id: string;
    producto_id: string;
    nombre: string;
    precio: number;
    descuento_porcentaje: number | null;
    stock: number;
    activo: boolean;
    productos: {
      id: string;
      nombre: string;
      marca_id: string;
      activo: boolean;
      es_prueba: boolean;
      categorias: { slug?: string } | null;
    } | null;
  }>;

  const porVariante = new Map(variantes.map((v) => [v.id, v]));
  const [promos, resolutor] = await Promise.all([
    obtenerPromocionesVigentesServidor(),
    construirResolutor(),
  ]);

  const recalculados: ItemRecalculado[] = [];
  let subtotal = 0;

  for (const item of items) {
    const variante = porVariante.get(item.varianteId);
    if (!variante) lanzarError(`La variante ${item.varianteId} no existe.`);
    if (!variante.activo) lanzarError(`La variante "${variante.nombre}" no está disponible.`);

    const producto = variante.productos;
    if (!producto) lanzarError("La variante no tiene producto asociado.");
    if (!producto.activo || producto.es_prueba) {
      lanzarError(`El producto "${producto.nombre}" no está disponible.`);
    }
    if (variante.stock < item.cantidad) {
      lanzarError(`Stock insuficiente para "${producto.nombre}" (${variante.nombre}).`);
    }

    // Misma lógica de precio efectivo que la tienda (adaptadores.ts):
    // mejor promo vigente, sin acumulación, y descuento_porcentaje directo;
    // se cobra el menor de ambos, con piso 0.
    const resuelto = calcularPrecioEfectivo(
      { varianteId: variante.id, precioLista: variante.precio },
      { productoId: producto.id, marcaId: producto.marca_id, categoriaSlug: producto.categorias?.slug ?? "" },
      promos,
      resolutor
    );

    const precioDescuento =
      variante.descuento_porcentaje != null && variante.descuento_porcentaje > 0
        ? Math.round(variante.precio * (1 - variante.descuento_porcentaje / 100))
        : variante.precio;

    const precioUnitario = Math.min(resuelto.precioEfectivo, precioDescuento);
    const subtotalLinea = precioUnitario * item.cantidad;
    subtotal += subtotalLinea;

    recalculados.push({
      productoId: producto.id,
      varianteId: variante.id,
      nombreProducto: producto.nombre,
      nombreVariante: variante.nombre,
      precioUnitario,
      cantidad: item.cantidad,
      subtotalLinea,
    });
  }

  return { items: recalculados, subtotal };
}

/**
 * Rollback best-effort: como supabase-js no admite transacciones multi-tabla
 * nativas, si un paso de persistencia falla se intentan eliminar en orden
 * inverso (detalles → pedido → cliente) para no dejar pedidos incompletos.
 */
async function revertirPersistencia(
  idCliente: string | null,
  idPedido: string | null
): Promise<void> {  const supabase = obtenerClienteServicioSupabase();
  try {
    if (idPedido) {
      await supabase.from("detalles_pedido").delete().eq("pedido_id", idPedido);
      await supabase.from("pedidos").delete().eq("id", idPedido);
    }
    if (idCliente) {
      await supabase.from("clientes").delete().eq("id", idCliente);
    }
  } catch {
    // Rollback best-effort: no propagar; el error original ya se lanzará.
  }
}

export async function crearPedido(
  entrada: CrearPedidoEntrada
): Promise<ResultadoCrearPedido> {
  try {
    const pedido = await ejecutarCrearPedido(entrada);
    return { ok: true, pedido };
  } catch (e) {
    const mensaje =
      e instanceof Error ? e.message : "No se pudo crear el pedido. Inténtalo de nuevo.";
    return { ok: false, error: mensaje };
  }
}

/**
 * Núcleo de creación de pedido: persiste y devuelve el pedido completo.
 * Lanza Error en cualquier fallo (validación, stock, BD, etc.); el export
 * público crearPedido() convierte esos errores en un resultado { ok:false }.
 */
async function ejecutarCrearPedido(
  entrada: CrearPedidoEntrada
): Promise<PedidoConRelaciones> {
  validarEntrada(entrada);
  const supabase = obtenerClienteServicioSupabase();

  const { items, subtotal } = await recalcularItems(entrada.items);
  // El servidor es la única fuente de verdad del domicilio: ignora cualquier
  // costoEnvio enviado por el navegador y lo recalcula desde el subtotal real
  // y la ciudad/zona recibida (config central lib/config/domicilio.ts).
  const costoEnvio = tarifaDomicilioPara(subtotal, entrada.direccionEntrega.ciudad.trim());
  const total = subtotal + costoEnvio;

  let idCliente: string | null = null;
  let idPedido: string | null = null;

  try {
    // 1) Cliente (snapshot propio; checkout como invitado). Se conserva la
    //    dirección de entrega como último dato conocido del cliente.
    const clienteData: Partial<ClienteRow> = {
      nombre: entrada.cliente.nombre.trim(),
      telefono: entrada.cliente.telefono.trim(),
      email: entrada.cliente.email?.trim() || null,
      direccion: entrada.direccionEntrega.direccion.trim(),
      barrio: entrada.direccionEntrega.barrio?.trim() || null,
      ciudad: entrada.direccionEntrega.ciudad.trim(),
      departamento: entrada.direccionEntrega.departamento?.trim() || null,
      notas: entrada.direccionEntrega.notas?.trim() || null,
    };
    const { data: cliente, error: errorCliente } = await supabase
      .from("clientes")
      .insert(clienteData)
      .select()
      .single();
    if (errorCliente || !cliente) {
      lanzarError(`Error al crear el cliente: ${errorCliente?.message ?? "sin datos"}`);
    }
    idCliente = (cliente as ClienteRow).id;

    // 2) Pedido. numero_pedido lo genera el trigger; estado inicial 'recibido'.
    //    estado_pago/payment_id/preference_id se omiten: la BD los asigna
    //    (default 'pendiente' / NULL) al no participar aún del pago.
    const pedidoData: Omit<
      PedidoRow,
      | "id"
      | "numero_pedido"
      | "estado"
      | "estado_pago"
      | "payment_id"
      | "preference_id"
      | "nota_interna"
      | "created_at"
      | "updated_at"
    > = {
      cliente_id: idCliente,
      metodo_pago: entrada.metodoPago,
      subtotal,
      costo_envio: costoEnvio,
      descuento_total: 0,
      total,
      direccion: entrada.direccionEntrega.direccion.trim(),
      barrio: entrada.direccionEntrega.barrio?.trim() || null,
      ciudad: entrada.direccionEntrega.ciudad.trim(),
      departamento: entrada.direccionEntrega.departamento?.trim() || null,
      notas: entrada.direccionEntrega.notas?.trim() || null,
    };
    const { data: pedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert(pedidoData)
      .select()
      .single();
    if (errorPedido || !pedido) {
      lanzarError(`Error al crear el pedido: ${errorPedido?.message ?? "sin datos"}`);
    }
    idPedido = (pedido as PedidoRow).id;

    // 3) Detalles (snapshots de producto, variante y precio al momento).
    const detallesData = items.map((item) => ({
      pedido_id: idPedido!,
      producto_id: item.productoId,
      variante_id: item.varianteId,
      nombre_producto: item.nombreProducto,
      nombre_variante: item.nombreVariante,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      subtotal_linea: item.subtotalLinea,
    }));
    const { error: errorDetalles } = await supabase
      .from("detalles_pedido")
      .insert(detallesData);
    if (errorDetalles) {
      lanzarError(`Error al crear los detalles del pedido: ${errorDetalles.message}`);
    }
  } catch (e) {
    await revertirPersistencia(idCliente, idPedido);
    throw e;
  }

  // Releer el pedido completo para devolver cliente + detalle tipados.
  const supabaseLee = obtenerClienteServicioSupabase();
  const { data, error } = await supabaseLee
    .from("pedidos")
    .select(`*, clientes(*), detalles_pedido(*)`)
    .eq("id", idPedido!)
    .single();
  if (error) lanzarError(`Error al releer el pedido: ${error.message}`);
  if (!data) lanzarError("El pedido se creó pero no pudo releerse.");

  const { clientes, detalles_pedido, ...pedidoRow } = data;
  const pedidoCompleto: PedidoConRelaciones = {
    pedido: pedidoRow as unknown as PedidoRow,
    cliente: clientes as ClienteRow,
    detalles: detalles_pedido,
  };

  await enviarConfirmacionPorCorreo(pedidoCompleto);

  return pedidoCompleto;
}

/**
 * Envía el correo de confirmación de pedido si el cliente tiene email.
 * Best-effort: si Resend falla (o falta config) el pedido ya quedó creado y
 * NUNCA se propaga el error; solo se registra en el log del servidor.
 */
async function enviarConfirmacionPorCorreo(
  pedidoCompleto: PedidoConRelaciones
): Promise<void> {
  const email = pedidoCompleto.cliente.email?.trim();
  if (!email) return;

  try {
    const resultado = await enviarCorreo({
      to: email,
      subject: `Pedido ${pedidoCompleto.pedido.numero_pedido} confirmado — Kewee Mascotas`,
      html: construirHtmlConfirmacionPedido(pedidoCompleto),
    });
    if (!resultado.ok) {
      console.error(
        `[pedidos] No se pudo enviar el correo de confirmación (pedido ${pedidoCompleto.pedido.numero_pedido}): ${resultado.error}`
      );
    }
  } catch (e) {
    console.error(
      `[pedidos] Error al enviar el correo de confirmación (pedido ${pedidoCompleto.pedido.numero_pedido}):`,
      e
    );
  }
}
