"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import Boton from "@/components/ui/boton";
import CampoTexto from "@/components/ui/campo-texto";
import { crearProducto } from "../acciones";
import { subirImagenProducto } from "../imagenes-acciones";
import type { CrearProductoEntrada } from "../acciones";
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

interface VarianteForm {
  clave: string;
  precio: string;
  precioAnterior: string;
  stock: string;
  tipoVariante: TipoVariante;
  valor: string;
  unidad: string;
  descuentoPorcentaje: string;
}

export interface FormularioProductoProps {
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

// Tipos cuyo "valor" viene de un selector cerrado (no de un campo libre).
// En estos casos el selector escribe en `valor` y `unidad` queda vacía.
const TIPOS_VALOR_EN_SELECT: Record<TipoVariante, boolean> = {
  unico: false,
  peso: false,
  talla: true,
  tamano: true,
  cantidad: false,
  volumen: false,
  presentacion: false,
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

export default function FormularioProducto({
  categorias,
  marcas,
}: FormularioProductoProps) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [categoriaId, setCategoriaId] = useState("");
  const [marcaId, setMarcaId] = useState("");
  const [descripcionCorta, setDescripcionCorta] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [esDestacado, setEsDestacado] = useState(false);
  const [esMasVendido, setEsMasVendido] = useState(false);
  const [esPrueba, setEsPrueba] = useState(false);
  const [activo, setActivo] = useState(true);
  const [variantes, setVariantes] = useState<VarianteForm[]>([varianteVacia()]);
  const [archivosImagen, setArchivosImagen] = useState<File[]>([]);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

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

  // ── Variantes ──────────────────────────────────────────────────────────

  const agregarVariante = useCallback(() => {
    setVariantes((prev) => [...prev, varianteVacia()]);
  }, []);

  const eliminarVariante = useCallback((clave: string) => {
    setVariantes((prev) => (prev.length <= 1 ? prev : prev.filter((v) => v.clave !== clave)));
  }, []);

  const actualizarVariante = useCallback(
    (clave: string, campo: keyof Omit<VarianteForm, "clave">, valor: string) => {
      setVariantes((prev) =>
        prev.map((v) => {
          if (v.clave !== clave) return v;
          const actualizada = { ...v, [campo]: valor };
          if (campo === "tipoVariante") {
            const tipo = valor as TipoVariante;
            actualizada.valor = "";
            // Para tipos con selector de valor cerrado, la unidad no aplica.
            actualizada.unidad = TIPOS_VALOR_EN_SELECT[tipo]
              ? ""
              : OPCIONES_UNIDAD[tipo]?.[0] ?? "";
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

  // ── Imágenes ──────────────────────────────────────────────────────────

  const agregarImagenes = useCallback((nuevos: FileList | null) => {
    if (!nuevos) return;
    const lista = Array.from(nuevos).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024
    );
    setArchivosImagen((prev) => [...prev, ...lista]);
  }, []);

  const eliminarImagenPendiente = useCallback((indice: number) => {
    setArchivosImagen((prev) => prev.filter((_, i) => i !== indice));
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────

  const enviar = useCallback(
    async (evento: React.FormEvent<HTMLFormElement>) => {
      evento.preventDefault();
      setError(null);
      setEnviando(true);

      const entrada: CrearProductoEntrada = {
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
          nombre: generarNombreVariante(v.tipoVariante, v.valor, v.unidad),
          precio: Number(v.precio) || 0,
          precioAnterior: v.precioAnterior ? Number(v.precioAnterior) : undefined,
          stock: Number(v.stock) || 0,
          orden: i,
          tipoVariante: v.tipoVariante,
          valor: v.valor.trim() || undefined,
          unidad: TIPOS_VALOR_EN_SELECT[v.tipoVariante]
            ? undefined
            : v.unidad.trim() || undefined,
          descuentoPorcentaje: v.descuentoPorcentaje
            ? Number(v.descuentoPorcentaje)
            : undefined,
        })),
      };

      const resultado = await crearProducto(entrada);

      if (!resultado.ok) {
        setError(resultado.error);
        setEnviando(false);
        return;
      }

      // Subir imágenes pendientes si las hay
      if (archivosImagen.length > 0 && resultado.id) {
        setSubiendoImagen(true);
        for (const archivo of archivosImagen) {
          await subirImagenProducto(resultado.id, archivo);
        }
        setSubiendoImagen(false);
      }

      router.push("/admin/productos");
    },
    [nombre, slug, categoriaId, marcaId, descripcion, descripcionCorta, esDestacado, esMasVendido, esPrueba, activo, variantes, archivosImagen, router]
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
          maxLength={100}
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
          maxLength={200}
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
            maxLength={5000}
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
                Este producto nunca aparecerá en la tienda pública. Úsalo para
                probar el formulario, el carrito o cualquier funcionalidad sin
                afectar el catálogo visible.
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
            const valorEnSelect = TIPOS_VALOR_EN_SELECT[variante.tipoVariante];
            const opcionesUnidad = OPCIONES_UNIDAD[variante.tipoVariante];
            const opcionesValor = valorEnSelect ? opcionesUnidad : [];
            const precioFinal = preciosFinales[variante.clave] ?? 0;
            const tieneDescuento =
              Number(variante.descuentoPorcentaje) > 0;
            const nombreGenerado = generarNombreVariante(
              variante.tipoVariante,
              variante.valor,
              variante.unidad
            );

            return (
              <div
                key={variante.clave}
                className="relative rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Variante {indice + 1}
                    <span className="ml-2 normal-case tracking-normal text-dark">
                      {nombreGenerado}
                    </span>
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
                  {mostrarValor && valorEnSelect && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-dark">
                        {variante.tipoVariante === "talla"
                          ? "Talla"
                          : "Tamaño"}
                      </label>
                      <select
                        value={variante.valor}
                        onChange={(e) =>
                          actualizarVariante(
                            variante.clave,
                            "valor",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
                      >
                        <option value="">
                          {variante.tipoVariante === "talla"
                            ? "Seleccionar talla"
                            : "Seleccionar tamaño"}
                        </option>
                        {opcionesValor.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {mostrarValor && !valorEnSelect && (
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
                        Se generará al guardar
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
          Selecciona imágenes del producto (JPEG, PNG o WebP, máximo 5 MB c/u).
          La primera imagen será la principal.
        </p>

        <div>
          <label
            htmlFor="imagenes-producto"
            className="mb-1.5 block text-sm font-semibold text-dark"
          >
            Seleccionar imágenes
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

        {archivosImagen.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {archivosImagen.map((archivo, i) => (
              <div
                key={`${archivo.name}-${i}`}
                className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(archivo)}
                  alt={archivo.name}
                  className="h-full w-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Principal
                  </span>
                )}
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
        )}
      </fieldset>

      {/* ── Acciones ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Boton type="submit" radio="xl" disabled={enviando || subiendoImagen}>
          {subiendoImagen
            ? "Subiendo imágenes..."
            : enviando
              ? "Creando..."
              : "Crear producto"}
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
