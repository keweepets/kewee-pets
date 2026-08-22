import { useState } from 'react';
import { Product, Navigate } from '../../types';
import { formatPrice } from '../../data';

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  navigate: Navigate;
  createMode?: boolean;
}

export default function AdminProducts({ products, setProducts, navigate, createMode }: Props) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(createMode ?? false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '', brand: '', category: 'perros', subcategory: 'Alimento seco',
    shortDesc: '', description: '', price: '', stock: '', sku: '',
  });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const deleteProduct = (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCreate = () => {
    if (!newProduct.name || !newProduct.brand) return;
    const id = `prod-${Date.now()}`;
    const product: Product = {
      id,
      slug: newProduct.name.toLowerCase().replace(/\s+/g, '-'),
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      subcategory: newProduct.subcategory,
      description: newProduct.description,
      shortDesc: newProduct.shortDesc,
      images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop'],
      variants: [{
        id: 'v1',
        name: 'Estándar',
        price: parseInt(newProduct.price) || 0,
        sku: newProduct.sku || `SKU-${id}`,
        stock: parseInt(newProduct.stock) || 0,
      }],
      tags: [],
      active: true,
      featured: false,
      bestSeller: false,
    };
    setProducts(prev => [product, ...prev]);
    setShowCreate(false);
    setNewProduct({ name: '', brand: '', category: 'perros', subcategory: 'Alimento seco', shortDesc: '', description: '', price: '', stock: '', sku: '' });
  };

  const Form = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <h2 className="font-black text-dark text-lg mb-5">{editingId ? 'Editar producto' : 'Crear producto'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Nombre del producto *', key: 'name', placeholder: 'Royal Canin Medium Adult' },
          { label: 'Marca *', key: 'brand', placeholder: 'Royal Canin' },
          { label: 'Descripción corta', key: 'shortDesc', placeholder: 'Nutrición para razas medianas' },
          { label: 'Precio base (COP)', key: 'price', placeholder: '95000', type: 'number' },
          { label: 'SKU', key: 'sku', placeholder: 'RC-MED-001' },
          { label: 'Stock inicial', key: 'stock', placeholder: '10', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-dark mb-1.5">{f.label}</label>
            <input
              type={f.type ?? 'text'}
              value={(newProduct as Record<string, string>)[f.key]}
              onChange={e => setNewProduct(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-dark mb-1.5">Categoría</label>
          <select
            value={newProduct.category}
            onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
          >
            <option value="perros">Perros</option>
            <option value="gatos">Gatos</option>
            <option value="accesorios">Accesorios</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-dark mb-1.5">Descripción completa</label>
          <textarea
            value={newProduct.description}
            onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
            placeholder="Descripción detallada del producto..."
            rows={3}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleCreate}
          className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
        >
          Guardar producto
        </button>
        <button
          onClick={() => { setShowCreate(false); setEditingId(null); }}
          className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-dark">Productos</h2>
          <p className="text-sm text-gray-500">{products.length} productos registrados</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
        >
          <span>+</span> Crear producto
        </button>
      </div>

      {showCreate && <Form />}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o marca..."
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Producto</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Marca</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Variantes</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-10 w-10 rounded-xl object-cover bg-gray-100 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-dark text-sm">{p.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.brand}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">
                      {p.variants.length} {p.variants.length === 1 ? 'variante' : 'variantes'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs font-medium ${
                      p.variants.some(v => v.stock === 0) ? 'text-red-500' :
                      p.variants.some(v => v.stock <= 3) ? 'text-amber-500' : 'text-green-600'
                    }`}>
                      {p.variants.reduce((s, v) => s + v.stock, 0)} uds
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setShowCreate(true); setEditingId(p.id); }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 text-xs"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => toggleActive(p.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-amber-500 text-xs"
                        title={p.active ? 'Desactivar' : 'Activar'}
                      >
                        {p.active ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 text-xs"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <p className="font-medium">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
