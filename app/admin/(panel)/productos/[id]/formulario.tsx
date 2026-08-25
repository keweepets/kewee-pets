"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import Boton from "@/components/ui/boton";
import CampoTexto from "@/components/ui/campo-texto";
import { editarProducto } from "../acciones";
import { subirImagenProducto, eliminarImagen, establecerPrincipal } from "../imagenes-acciones";
import type { EditarProductoEntrada } from "../acciones";
import type { TipoVariante } from "@/lib/supabase/tipos-db";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface CategoriaOption {
  id: string;
  nombre: string;
  slug: string;
}

interface MarcaOption {
  id: string;
  nombre: string;
}

interface VarianteExistente {
  id: string;
  nombre: string;
  precio: number;
  precio_anterior: number | null;
  stock: number;
  sku: string | null;
  activo: boolean;
  tipo_variante: TipoVariante;
  valor: string | null;
  unidad: string | null;
  descuento_porcentaje: number | null;
  orden: number;
}

interface ImagenExistente {
  id: string;
  url: string;
  alt: string;
  orden: number;
  activo: boolean;
}

interface VarianteForm {
  clave: string;
  idExistente?: string;
  precio: string;
  precioAnterior: string;
  stock: string;
  tipoVariante: TipoVariante;
  valor: string;
  unidad: string;
  descuentoPorcentaje: string;
  skuExistente: string | null;
}

export interface FormularioEditarProductoProps {
  productoId: string;
  nombre: string;
  slug: string;
  categoriaId: string;
  marcaId: string;
  descripcion: string;
  descripcionCorta: string;
  esDestacado: boolean;
  esMasVendido: boolean;
  esPrueba: boolean;
  activo: boolean;
  variantes: VarianteExistente[];
  imagenes: ImagenExistente[];
  categorias: CategoriaOption[];
  marcas: MarcaOption[];
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const TIPOS_VARIANTE: { valor: TipoVariante; etiqueta: string }[] = [
  { valor: "unico", etiqueta: "Único" },
  { valor: "peso", etiqueta: "Peso" },
  { valor: "talla", etiqueta: "Talla" },
  { valor: "tamano", etiqueta: "Tamaño" },
  { valor: "cantidad", etiqueta: "Cantidad" },
  { valor: "volumen", etiqueta: "Volumen" },
  { valor: "presentacion", etiqueta: "Presentación" },
];

const OPCIONES_UNIDAD: Record<TipoVariante, string[]> = {
  unico: [],
  peso: ["mg", "g", "kg", "lb"],
  talla: ["XS", "S", "M", "L", "XL", "XXL"],
  tamano: ["pequeño", "mediano", "grande"],
  cantidad: ["unidad", "par", "docena"],
  volumen: ["ml", "l"],
  presentacion: ["unidad", "paquete", "caja"],
};

const PLACEHOLDER_VALOR: Record<TipoVariante, string> = {
  unico: "",
  peso: "ej. 15",
  talla: "ej. S",
  tamano: "ej. mediano",
  cantidad: "ej. 12",
  volumen: "ej. 500",
  presentacion: "ej. 3",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let contadorClaves = 0;
function generarClave(): string {
  return `var-${++contadorClaves}-${Date.now()}`;
}

function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function varianteVacia(): VarianteForm {
  return {
    clave: generarClave(),
    precio: "",
    precioAnterior: "",
    stock: "0",
    tipoVariante: "unico",
    valor: "",
    unidad: "",
    descuentoPorcentaje: "",
    skuExistente: null,
  };
}

function varianteDesdeDb(v: VarianteExistente): VarianteForm {
  return {
    clave: v.id,
    idExistente: v.id,
    precio: String(v.precio),
    precioAnterior: v.precio_anterior != null ? String(v.precio_anterior) : "",
    stock: String(v.stock),
    tipoVariante: v.tipo_variante,
    valor: v.valor ?? "",
    unidad: v.unidad ?? "",
    descuentoPorcentaje:
      v.descuento_porcentaje != null ? String(v.descuento_porcentaje) : "",
    skuExistente: v.sku,
  };
}

function formatearCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function generarNombreVariante(
  tipo: TipoVariante,
  valor: string,
  unidad: string
): string {
  const v = valor.trim();
  const u = unidad.trim();
  if (tipo === "unico") return "Único";
  if (tipo === "talla") return `Talla ${v || "?"}`;
  if (tipo === "tamano") return v ? v.charAt(0).toUpperCase() + v.slice(1) : "?";
  if (!v) return "?";
  return u ? `${v} ${u}` : v;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function FormularioEditarProducto({
  productoId,
  nombre: nombreInicial,
  slug: slugInicial,
  categoriaId: categoriaInicial,
  marcaId: marcaInicial,
  descripcion: descInicial,
  descripcionCorta: descCortaInicial,
  esDestacado: destacadoInicial,
  esMasVendido: masVendidoInicial,
  esPrueba: pruebaInicial,
  activo: activoInicial,
  variantes: variantesDb,
  imagenes: imagenesIniciales,
  categorias,
  marcas,
}: FormularioEditarProductoProps) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(nombreInicial);
  const [slug, setSlug] = useState(slugInicial);
  const [slugManual, setSlugManual] = useState(true);
  const [categoriaId, setCategoriaId] = useState(categoriaInicial);
  const [marcaId, setMarcaId] = useState(marcaInicial);
  const [descripcionCorta, setDescripcionCorta] = useState(descCortaInicial);
  const [descripcion, setDescripcion] = useState(descInicial);
  const [esDestacado, setEsDestacado] = useState(destacadoInicial);
  const [esMasVendido, setEsMasVendido] = useState(masVendidoInicial);
  const [esPrueba, setEsPrueba] = useState(pruebaInicial);
  const [activo, setActivo] = useState(activoInicial);
  const [variantes, setVariantes] = useState<VarianteForm[]>(() =>
    variantesDb.length > 0 ? variantesDb.map(varianteDesdeDb) : [varianteVacia()]
  );
  const [imagenes, setImagenes] = useState<ImagenExistente[]>(imagenesIniciales);
  const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [eliminandoImagen, setEliminandoImagen] = useState<string | null>(null);

  const cambiarNombre = useCallback(
    (valor: string) => {
      setNombre(valor);
      if (!slugManual) {
        setSlug(generarSlug(valor));
      }
    },
    [slugManual]
  );

  const cambiarSlug = useCallback((valor: string) => {
    setSlugManual(true);
    setSlug(valor);
  }, []);

  // ── Imágenes ──────────────────────────────────────────────────────────

  const agregarImagenes = useCallback((nuevos: FileList | null) => {
    if (!nuevos) return;
    const lista = Array.from(nuevos).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024
    );
    setArchivosNuevos((prev) => [...prev, ...lista]);
  }, []);

  const eliminarImagenPendiente = useCallback((indice: number) => {
    setArchivosNuevos((prev) => prev.filter((_, i) => i !== indice));
  }, []);

  const manejarEliminarExistente = useCallback(async (imagenId: string) => {
    setEliminandoImagen(imagenId);
    const resultado = await eliminarImagen(imagenId);
    if (resultado.ok) {
      setImagenes((prev) => prev.filter((img) => img.id !== imagenId));
    } else {
      setError(resultado.error ?? "Error al eliminar imagen");
    }
    setEliminandoImagen(null);
  }, []);

  const manejarEstablecerPrincipal = useCallback(async (imagenId: string) => {
    const resultado = await establecerPrincipal(imagenId);
    if (resultado.ok) {
      setImagenes((prev) =>
        prev.map((img) => ({
          ...img,
          orden: img.id === imagenId ? 0 : img.orden + 1,
        })).sort((a, b) => a.orden - b.orden)
      );
    } else {
      setError(resultado.error ?? "Error al establecer principal");
    }
  }, []);

  // ── Variantes ──────────────────────────────────────────────────────────

  const agregarVariante = useCallback(() => {
    setVariantes((prev) => [...prev, varianteVacia()]);
  }, []);

  const eliminarVariante = useCallback((clave: string) => {
    setVariantes((prev) => (prev.length <= 1 ? prev : prev.filter((v) => v.clave !== clave)));
  }, []);

  const actualizarVariante = useCallback(
    (clave: string, campo: keyof Omit<VarianteForm, "clave" | "idExistente" | "skuExistente">, valor: string) => {
      setVariantes((prev) =>
        prev.map((v) => {
          if (v.clave !== clave) return v;
          const actualizada = { ...v, [campo]: valor };
          if (campo === "tipoVariante") {
            actualizada.valor = "";
            actualizada.unidad = OPCIONES_UNIDAD[valor as TipoVariante]?.[0] ?? "";
          }
          return actualizada;
        })
      );
    },
    []
  );

  // ── Precio final calculado por variante ────────────────────────────────

  const preciosFinales = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const v of variantes) {
      const base = Number(v.precio) || 0;
      const desc = Number(v.descuentoPorcentaje) || 0;
      mapa[v.clave] = desc > 0 ? Math.round(base * (1 - desc / 100)) : base;
    }
    return mapa;
  }, [variantes]);

  // ── Submit ─────────────────────────────────────────────────────────────

  const enviar = useCallback(
    async (evento: React.FormEvent<HTMLFormElement>) => {
      evento.preventDefault();
      setError(null);
      setEnviando(true);

      const entrada: EditarProductoEntrada = {
        id: productoId,
        nombre: nombre.trim(),
        slug: slug.trim() || undefined,
        categoriaId,
        marcaId,
        descripcion: descripcion.trim(),
        descripcionCorta: descripcionCorta.trim(),
        esDestacado,
        esMasVendido,
        esPrueba,
        activo,
        variantes: variantes.map((v, i) => ({
          id: v.idExistente,
          nombre: generarNombreVariante(v.tipoVariante, v.valor, v.unidad),
          precio: Number(v.precio) || 0,
          precioAnterior: v.precioAnterior ? Number(v.precioAnterior) : undefined,
          stock: Number(v.stock) || 0,
          orden: i,
          activo: true,
          tipoVariante: v.tipoVariante,
          valor: v.valor.trim() || undefined,
          unidad: v.unidad.trim() || undefined,
          descuentoPorcentaje: v.descuentoPorcentaje
            ? Number(v.descuentoPorcentaje)
            : undefined,
        })),
      };

      const resultado = await editarProducto(entrada);

      if (!resultado.ok) {
        setError(resultado.error);
        setEnviando(false);
        return;
      }

      // Subir imágenes nuevas si las hay
      if (archivosNuevos.length > 0) {
        setSubiendoImagen(true);
        for (const archivo of archivosNuevos) {
          await subirImagenProducto(productoId, archivo);
        }
        setSubiendoImagen(false);
      }

      router.push("/admin/productos");
    },
    [productoId, nombre, slug, categoriaId, marcaId, descripcion, descripcionCorta, esDestacado, esMasVendido, esPrueba, activo, variantes, archivosNuevos, router]
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <form onSubmit={enviar} className="flex flex-col gap-8">
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
        >
          {error}
        </p>
      )}

      {/* ── Información básica ─────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5">
        <legend className="text-sm font-black uppercase tracking-widest text-muted">
          Información básica
        </legend>

        <CampoTexto
          label="Nombre del producto"
          name="nombre"
          value={nombre}
          onChange={(e) => cambiarNombre(e.target.value)}
          placeholder="Collar antipulgas para perro"
          required
        />

        <CampoTexto
          label="Slug"
          name="slug"
          value={slug}
          onChange={(e) => cambiarSlug(e.target.value)}
          placeholder="collar-antipulgas-perro"
          ayuda="Se genera automáticamente desde el nombre. Edita si lo necesitas."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="categoriaId"
              className="mb-1.5 block text-sm font-semibold text-dark"
            >
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="marcaId"
              className="mb-1.5 block text-sm font-semibold text-dark"
            >
              Marca
            </label>
            <select
              id="marcaId"
              name="marcaId"
              value={marcaId}
              onChange={(e) => setMarcaId(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
            >
              <option value="">Seleccionar marca</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <CampoTexto
          label="Descripción corta"
          name="descripcionCorta"
          value={descripcionCorta}
          onChange={(e) => setDescripcionCorta(e.target.value)}
          placeholder="Protección completa contra pulgas y garrapatas"
        />

        <div>
          <label
            htmlFor="descripcion"
            className="mb-1.5 block text-sm font-semibold text-dark"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            placeholder="Descripción detallada del producto..."
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          />
        </div>
      </fieldset>

      {/* ── Opciones ───────────────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5">
        <legend className="text-sm font-black uppercase tracking-widest text-muted">
          Opciones
        </legend>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-dark">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-green-500"
            />
            Activo
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-dark">
            <input
              type="checkbox"
              checked={esDestacado}
              onChange={(e) => setEsDestacado(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-green-500"
            />
            Destacado
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-dark">
            <input
              type="checkbox"
              checked={esMasVendido}
              onChange={(e) => setEsMasVendido(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-green-500"
            />
            Más vendido
          </label>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={esPrueba}
              onChange={(e) => setEsPrueba(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-amber-500"
            />
            <div>
              <span className="text-sm font-semibold text-dark">
                Producto de prueba
              </span>
              <p className="mt-0.5 text-xs text-muted">
                Este producto nunca aparecerá en la tienda pública.
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      {/* ── Variantes ──────────────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5">
        <legend className="text-sm font-black uppercase tracking-widest text-muted">
          Variantes
        </legend>

        <p className="text-xs text-muted">
          Todo producto debe tener al menos una variante. Usa &quot;Único&quot; si
          no aplica diferenciación por peso, talla, etc.
        </p>

        <div className="flex flex-col gap-4">
          {variantes.map((variante, indice) => {
            const mostrarValor = variante.tipoVariante !== "unico";
            const opcionesUnidad = OPCIONES_UNIDAD[variante.tipoVariante];
            const precioFinal = preciosFinales[variante.clave] ?? 0;
            const tieneDescuento =
              Number(variante.descuentoPorcentaje) > 0;
            const nombreGenerado = generarNombreVariante(
              variante.tipoVariante,
              variante.valor,
              variante.unidad
            );
            const esExistente = !!variante.idExistente;

            return (
              <div
                key={variante.clave}
                className={`relative rounded-xl border p-4 ${
                  esExistente
                    ? "border-blue-100 bg-blue-50/30"
                    : "border-gray-100 bg-gray-50/50"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Variante {indice + 1}
                    <span className="ml-2 normal-case tracking-normal text-dark">
                      {nombreGenerado}
                    </span>
                    {esExistente && (
                      <span className="ml-2 text-xs text-blue-400">(existente)</span>
                    )}
                  </span>

                  {variantes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarVariante(variante.clave)}
                      className="text-xs font-bold text-red-400 transition-colors hover:text-red-600"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {/* Fila 1: Tipo de variante */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-dark">
                      Tipo de variante
                    </label>
                    <select
                      value={variante.tipoVariante}
                      onChange={(e) =>
                        actualizarVariante(
                          variante.clave,
                          "tipoVariante",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
                    >
                      {TIPOS_VARIANTE.map((t) => (
                        <option key={t.valor} value={t.valor}>
                          {t.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fila 2: Valor + Unidad (solo si tipo ≠ Único) */}
                  {mostrarValor && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <CampoTexto
                        label="Valor"
                        value={variante.valor}
                        onChange={(e) =>
                          actualizarVariante(
                            variante.clave,
                            "valor",
                            e.target.value
                          )
                        }
                        placeholder={PLACEHOLDER_VALOR[variante.tipoVariante]}
                      />

                      {opcionesUnidad.length > 0 && (
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-dark">
                            Unidad
                          </label>
                          <select
                            value={variante.unidad}
                            onChange={(e) =>
                              actualizarVariante(
                                variante.clave,
                                "unidad",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
                          >
                            {opcionesUnidad.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fila 3: Precio + Descuento + Precio final */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <CampoTexto
                      label="Precio base (COP)"
                      type="number"
                      min="0"
                      step="1"
                      value={variante.precio}
                      onChange={(e) =>
                        actualizarVariante(
                          variante.clave,
                          "precio",
                          e.target.value
                        )
                      }
                      placeholder="45000"
                      required
                    />

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-dark">
                        Descuento (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={variante.descuentoPorcentaje}
                          onChange={(e) =>
                            actualizarVariante(
                              variante.clave,
                              "descuentoPorcentaje",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 pr-8 text-sm transition-colors focus:border-green-400 focus:outline-none"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          %
                        </span>
                      </div>
                    </div>

                    <CampoTexto
                      label="Precio anterior (COP)"
                      type="number"
                      min="0"
                      step="1"
                      value={variante.precioAnterior}
                      onChange={(e) =>
                        actualizarVariante(
                          variante.clave,
                          "precioAnterior",
                          e.target.value
                        )
                      }
                      placeholder="55000"
                      ayuda="Opcional. Se muestra tachado."
                    />
                  </div>

                  {/* Fila 4: Stock + SKU + Precio final */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <CampoTexto
                      label="Stock"
                      type="number"
                      min="0"
                      step="1"
                      value={variante.stock}
                      onChange={(e) =>
                        actualizarVariante(
                          variante.clave,
                          "stock",
                          e.target.value
                        )
                      }
                      placeholder="100"
                      required
                    />

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-dark">
                        SKU
                      </label>
                      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-400">
                        {variante.skuExistente ?? "Se generará al guardar"}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-dark">
                        Precio final
                      </label>
                      <div
                        className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold ${
                          tieneDescuento
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-100 text-dark"
                        }`}
                      >
                        {formatearCOP(precioFinal)}
                        {tieneDescuento && (
                          <span className="ml-2 text-xs font-normal text-green-500">
                            -{variante.descuentoPorcentaje}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Boton
          type="button"
          variante="contorno"
          radio="xl"
          onClick={agregarVariante}
        >
          + Agregar variante
        </Boton>
      </fieldset>

      {/* ── Imágenes ──────────────────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5">
        <legend className="text-sm font-black uppercase tracking-widest text-muted">
          Imágenes
        </legend>

        <p className="text-xs text-muted">
          Imágenes del producto (JPEG, PNG o WebP, máximo 5 MB c/u).
        </p>

        {/* Imágenes existentes */}
        {imagenes.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {imagenes.map((img) => (
              <div
                key={img.id}
                className="group relative h-28 w-28 overflow-hidden rounded-xl border border-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-full w-full object-cover"
                />
                {img.orden === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Principal
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 bg-black/40 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {img.orden !== 0 && (
                    <button
                      type="button"
                      disabled={eliminandoImagen === img.id}
                      onClick={() => manejarEstablecerPrincipal(img.id)}
                      className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-dark transition-colors hover:bg-white"
                    >
                      Principal
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={eliminandoImagen === img.id}
                    onClick={() => manejarEliminarExistente(img.id)}
                    className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                  >
                    {eliminandoImagen === img.id ? "..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {imagenes.length === 0 && (
          <p className="text-xs text-muted">Este producto no tiene imágenes todavía.</p>
        )}

        {/* Agregar nuevas imágenes */}
        <div>
          <label
            htmlFor="imagenes-producto"
            className="mb-1.5 block text-sm font-semibold text-dark"
          >
            Agregar imágenes
          </label>
          <input
            id="imagenes-producto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => agregarImagenes(e.target.files)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-1 file:text-sm file:font-bold file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        {/* Preview de imágenes nuevas pendientes */}
        {archivosNuevos.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-dark">
              Nuevas imágenes ({archivosNuevos.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {archivosNuevos.map((archivo, i) => (
                <div
                  key={`${archivo.name}-${i}`}
                  className="group relative h-24 w-24 overflow-hidden rounded-xl border border-blue-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(archivo)}
                    alt={archivo.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => eliminarImagenPendiente(i)}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      {/* ── Acciones ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Boton type="submit" radio="xl" disabled={enviando || subiendoImagen}>
          {subiendoImagen
            ? "Subiendo imágenes..."
            : enviando
              ? "Guardando..."
              : "Guardar cambios"}
        </Boton>
        <Boton
          type="button"
          variante="fantasma"
          radio="xl"
          disabled={enviando || subiendoImagen}
          onClick={() => router.push("/admin/productos")}
        >
          Cancelar
        </Boton>
      </div>
    </form>
  );
}
