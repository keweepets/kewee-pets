import type { Metadata } from "next";
import Link from "next/link";
import CardProducto from "@/components/productos/card-producto";
import {
  listarCategorias,
  listarMarcas,
  listarProductos,
} from "@/lib/catalogo/consultas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explora el catálogo de productos para mascotas de KEWEE MASCOTAS: alimentos, accesorios y ofertas.",
};

const LIMITE_POR_PAGINA = 12;

type ParamsCatalogo = Record<string, string | string[] | undefined>;

function primerValor(valor: string | string[] | undefined): string | undefined {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return v?.trim() ? v.trim() : undefined;
}

function construirHref(filtros: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor) params.set(clave, valor);
  }
  const qs = params.toString();
  return qs ? `/catalogo?${qs}` : "/catalogo";
}

interface ResumenCategoria {
  id: string;
  nombre: string;
  slug: string;
}

function ChipFiltro({
  href,
  activo,
  children,
}: {
  href: string;
  activo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${
        activo
          ? "bg-green-500 border-green-500 text-white"
          : "bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
      }`}
    >
      {children}
    </Link>
  );
}

function PanelMensaje({
  emoji,
  titulo,
  descripcion,
}: {
  emoji: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center bg-white rounded-2xl border border-gray-100">
      <span className="text-5xl" aria-hidden="true">
        {emoji}
      </span>
      <h2 className="text-xl font-black text-dark font-display">{titulo}</h2>
      <p className="max-w-md text-muted">{descripcion}</p>
    </div>
  );
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<ParamsCatalogo>;
}) {
  const sp = await searchParams;
  const categoriaSlug = primerValor(sp.categoria);
  const busqueda = primerValor(sp.q);
  const soloOfertas = primerValor(sp.ofertas) === "1";
  const marcaId = primerValor(sp.marca);
  const paginaActual = Math.max(Number(primerValor(sp.pagina) ?? "1") || 1, 1);

  let resultado: Awaited<ReturnType<typeof listarProductos>>;
  let categorias: ResumenCategoria[];
  let marcas: Awaited<ReturnType<typeof listarMarcas>>;

  try {
    [resultado, categorias, marcas] = await Promise.all([
      listarProductos({
        categoriaSlug,
        busqueda,
        soloOfertas,
        marcaId,
        limite: LIMITE_POR_PAGINA,
        pagina: paginaActual,
      }),
      listarCategorias(),
      listarMarcas(),
    ]);
  } catch (error) {
    console.error("[catalogo] Error consultando Supabase:", error);
    return (
      <div className="px-6 py-16">
        <PanelMensaje
          emoji="⚠️"
          titulo="No pudimos cargar el catálogo"
          descripcion="Ocurrió un problema al consultar los productos. Por favor intenta de nuevo en unos minutos."
        />
      </div>
    );
  }

  const hayFiltros = Boolean(categoriaSlug || busqueda || soloOfertas || marcaId);
  const totalPaginas = Math.max(Math.ceil(resultado.total / resultado.limite), 1);

  const filtrosBase = { q: busqueda, marca: marcaId };
  const filtrosConOfertas = { ...filtrosBase, ofertas: soloOfertas ? "1" : undefined };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
      {/* Encabezado */}
      <header className="mb-6">
        <h1 className="text-3xl font-black font-display text-dark">Catálogo</h1>
        <p className="text-muted mt-1">
          {resultado.total === 0
            ? "Muy pronto: nuevos productos para tu mascota."
            : `${resultado.total} ${resultado.total === 1 ? "producto" : "productos"}${
                soloOfertas ? " en oferta" : ""
              }`}
        </p>
      </header>

      {/* Filtros */}
      <section aria-label="Filtros del catálogo" className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <ChipFiltro href={construirHref({ ...filtrosBase })} activo={!categoriaSlug}>
            Todas
          </ChipFiltro>

          {categorias.map((cat) => (
            <ChipFiltro
              key={cat.id}
              href={construirHref({ ...filtrosBase, categoria: cat.slug })}
              activo={categoriaSlug === cat.slug}
            >
              {cat.nombre}
            </ChipFiltro>
          ))}

          <ChipFiltro
            href={construirHref({
              ...filtrosBase,
              ...(categoriaSlug ? { categoria: categoriaSlug } : {}),
              ofertas: soloOfertas ? undefined : "1",
            })}
            activo={soloOfertas}
          >
            🔥 Ofertas
          </ChipFiltro>
        </div>

        {/* Búsqueda (form GET nativo, sin JS) */}
        <form
          action="/catalogo"
          method="get"
          className="flex flex-col sm:flex-row gap-2 sm:items-center"
        >
          {categoriaSlug && <input type="hidden" name="categoria" value={categoriaSlug} />}
          {soloOfertas && <input type="hidden" name="ofertas" value="1" />}
          <input
            type="search"
            name="q"
            defaultValue={busqueda ?? ""}
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            className="w-full sm:max-w-xs px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-dark placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
          {marcas.length > 0 && (
            <select
              name="marca"
              defaultValue={marcaId ?? ""}
              aria-label="Filtrar por marca"
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:border-green-500"
            >
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors w-fit"
          >
            Buscar
          </button>
          {hayFiltros && (
            <Link
              href="/catalogo"
              className="text-sm font-semibold text-muted hover:text-green-600 transition-colors w-fit"
            >
              Limpiar filtros ✕
            </Link>
          )}
        </form>
      </section>

      {/* Resultados */}
      {resultado.productos.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resultado.productos.map((producto) => (
              <CardProducto key={producto.id} producto={producto} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <nav
              aria-label="Paginación del catálogo"
              className="mt-8 flex items-center justify-center gap-4"
            >
              {paginaActual > 1 ? (
                <Link
                  href={construirHref({
                    ...filtrosConOfertas,
                    ...(categoriaSlug ? { categoria: categoriaSlug } : {}),
                    pagina: String(paginaActual - 1),
                  })}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
                >
                  ← Anterior
                </Link>
              ) : null}

              <span className="text-sm font-semibold text-muted">
                Página {paginaActual} de {totalPaginas}
              </span>

              {paginaActual < totalPaginas ? (
                <Link
                  href={construirHref({
                    ...filtrosConOfertas,
                    ...(categoriaSlug ? { categoria: categoriaSlug } : {}),
                    pagina: String(paginaActual + 1),
                  })}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
                >
                  Siguiente →
                </Link>
              ) : null}
            </nav>
          )}
        </>
      ) : (
        <PanelMensaje
          emoji={hayFiltros ? "🔍" : "🐾"}
          titulo={
            hayFiltros ? "No encontramos productos" : "El catálogo está en preparación"
          }
          descripcion={
            hayFiltros
              ? "Prueba con otros términos o quita algunos filtros para ver más resultados."
              : "Estamos cargando los mejores productos para tu mascota. Vuelve muy pronto."
          }
        />
      )}
    </div>
  );
}
