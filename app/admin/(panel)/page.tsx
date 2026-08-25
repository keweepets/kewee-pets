export default function PaginaResumenAdmin() {
  return (
    <section className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-2xl font-black text-dark">Resumen</h1>
        <p className="mt-1 text-muted">
          Estado general del panel y de la tienda.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
            Autenticación
          </h2>
          <p className="mt-2 font-display text-xl font-black text-dark">
            Sesión admin operativa ✓
          </p>
          <p className="mt-1 text-sm text-muted">
            Estás viendo esta página porque Supabase Auth validó tu cuenta y tu
            correo está en la allowlist del panel.
          </p>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
            Gestión de catálogo
          </h2>
          <p className="mt-2 font-display text-xl font-black text-dark">
            Próximamente
          </p>
          <p className="mt-1 text-sm text-muted">
            Productos, variantes, imágenes y promociones se activan en las
            siguientes subfases (6B en adelante).
          </p>
        </article>
      </div>
    </section>
  );
}
