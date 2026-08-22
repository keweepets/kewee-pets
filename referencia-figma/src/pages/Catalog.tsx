import { useState } from 'react';
import { Product, CartItem, Navigate } from '../types';
import ProductCard from '../components/ProductCard';
import { brands } from '../data';

interface Props {
  products: Product[];
  category: string;
  navigate: Navigate;
  addToCart: (item: CartItem) => void;
}

const categories = ['Todos', 'Perros', 'Gatos', 'Accesorios'];
const sortOptions = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A–Z' },
];

export default function Catalog({ products, category: initialCategory, navigate, addToCart }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory && initialCategory !== 'ofertas' ? initialCategory : ''
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [onlyOffers, setOnlyOffers] = useState(initialCategory === 'ofertas');
  const [sort, setSort] = useState('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleBrand = (name: string) =>
    setSelectedBrands(prev => prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]);

  const filtered = products.filter(p => {
    if (!p.active) return false;
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
    if (onlyOffers && !p.tags.includes('oferta')) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const ap = a.variants[0]?.price ?? 0;
    const bp = b.variants[0]?.price ?? 0;
    if (sort === 'price-asc') return ap - bp;
    if (sort === 'price-desc') return bp - ap;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const title =
    selectedCategory === 'perros' ? 'Productos para Perros' :
    selectedCategory === 'gatos' ? 'Productos para Gatos' :
    selectedCategory === 'accesorios' ? 'Accesorios' :
    onlyOffers ? 'Promociones' : 'Todos los productos';

  const Filters = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Categoría</h3>
        <div className="space-y-1">
          {[{ label: 'Todos', value: '' }, { label: 'Perros', value: 'perros' }, { label: 'Gatos', value: 'gatos' }, { label: 'Accesorios', value: 'accesorios' }].map(c => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === c.value ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Marca</h3>
        <div className="space-y-2">
          {brands.map(b => (
            <label key={b.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.name)}
                onChange={() => toggleBrand(b.name)}
                className="rounded accent-green-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-dark">{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Offers */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Filtros</h3>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={onlyOffers}
            onChange={() => setOnlyOffers(!onlyOffers)}
            className="rounded accent-green-500"
          />
          <span className="text-sm text-gray-700 group-hover:text-dark">Solo en oferta</span>
        </label>
      </div>

      {/* Reset */}
      {(selectedCategory || selectedBrands.length > 0 || onlyOffers) && (
        <button
          onClick={() => { setSelectedCategory(''); setSelectedBrands([]); setOnlyOffers(false); }}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={() => navigate('home')} className="hover:text-green-600">Inicio</button>
        <span>/</span>
        <span className="text-dark font-medium">{title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-dark">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{sorted.length} productos encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-green-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtrar
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-full text-sm text-gray-700 bg-white focus:outline-none focus:border-green-400 cursor-pointer"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Mobile filters panel */}
      {filtersOpen && (
        <div className="md:hidden bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
          <Filters />
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden md:block w-52 shrink-0">
          <div className="sticky top-20 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <Filters />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <h3 className="text-xl font-black text-dark mb-2">¡Ups! No encontramos lo que buscas.</h3>
              <p className="text-gray-500 mb-6">Intenta con otros filtros o explora todos nuestros productos.</p>
              <button
                onClick={() => { setSelectedCategory(''); setSelectedBrands([]); setOnlyOffers(false); }}
                className="px-6 py-2.5 bg-green-500 text-white font-bold rounded-full hover:bg-green-600"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sorted.map(p => (
                <ProductCard key={p.id} product={p} navigate={navigate} addToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
