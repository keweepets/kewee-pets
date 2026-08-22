import { useState } from 'react';
import { Product, CartItem, Navigate } from '../types';
import { formatPrice } from '../data';
import ProductCard from '../components/ProductCard';

interface Props {
  products: Product[];
  slug: string;
  navigate: Navigate;
  addToCart: (item: CartItem) => void;
}

export default function ProductDetail({ products, slug, navigate, addToCart }: Props) {
  const product = products.find(p => p.slug === slug);

  const [selectedVariantId, setSelectedVariantId] = useState(product?.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-dark">Producto no encontrado</h2>
        <button onClick={() => navigate('catalog')} className="mt-4 px-6 py-2.5 bg-green-500 text-white font-bold rounded-full">
          Ver catálogo
        </button>
      </div>
    );
  }

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0];
  const discount = selectedVariant?.originalPrice
    ? Math.round((1 - selectedVariant.price / selectedVariant.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      brand: product.brand,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      quantity,
      image: product.images[0],
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('checkout');
  };

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <button onClick={() => navigate('home')} className="hover:text-green-600">Inicio</button>
        <span>/</span>
        <button
          onClick={() => navigate('catalog', { category: product.category })}
          className="hover:text-green-600 capitalize"
        >
          {product.category}
        </button>
        <span>/</span>
        <span className="text-dark font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="rounded-3xl overflow-hidden bg-gray-50 aspect-square mb-3">
            <img
              src={product.images[imgIdx] ?? product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === imgIdx ? 'border-green-500' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Brand + tags */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{product.brand}</span>
            {product.tags.includes('mas-vendido') && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Más vendido</span>
            )}
            {product.tags.includes('nuevo') && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Nuevo</span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-dark mb-2">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-6">{product.shortDesc}</p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-dark">{formatPrice(selectedVariant?.price ?? 0)}</span>
            {selectedVariant?.originalPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(selectedVariant.originalPrice)}</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-bold rounded-full">-{discount}%</span>
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mb-6">
              <p className="text-sm font-bold text-dark mb-2">
                {product.subcategory === 'Collares' ? 'Talla' : 'Peso'}: <span className="text-green-600">{selectedVariant?.name}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    disabled={v.stock === 0}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      v.id === selectedVariantId
                        ? 'bg-green-500 border-green-500 text-white shadow-sm'
                        : v.stock === 0
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 text-dark hover:border-green-400 hover:text-green-600'
                    }`}
                  >
                    {v.name}
                    {v.stock <= 3 && v.stock > 0 && (
                      <span className="ml-1.5 text-amber-500">({v.stock})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            {selectedVariant && selectedVariant.stock > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-green-600 font-medium">
                  {selectedVariant.stock > 5 ? 'Disponible' : `Solo ${selectedVariant.stock} disponibles`}
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-red-500 font-medium">Agotado</span>
              </>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-bold text-dark mb-2">Cantidad</p>
            <div className="inline-flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-lg leading-none transition-colors"
              >
                −
              </button>
              <span className="px-5 py-2.5 font-bold text-dark text-base min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(selectedVariant?.stock ?? 1, q + 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-lg leading-none transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-base transition-all active:scale-95 ${
                added
                  ? 'bg-green-100 text-green-700'
                  : selectedVariant?.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {added ? '¡Agregado al carrito! ✓' : 'Agregar al carrito'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="flex-1 py-3.5 rounded-2xl font-bold text-base border-2 border-green-500 text-green-600 hover:bg-green-50 transition-all active:scale-95 disabled:opacity-40"
            >
              Comprar ahora
            </button>
          </div>

          {/* Shipping info */}
          <div className="bg-green-50 rounded-2xl p-4 space-y-2">
            {[
              { icon: '🚚', text: 'Envío a toda Colombia' },
              { icon: '📱', text: 'Contraentrega en Medellín por WhatsApp' },
              { icon: '🔒', text: 'Pago seguro con Mercado Pago' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2.5 text-sm text-gray-700">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-black text-dark mb-4">Descripción</h2>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Información del producto</h3>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Marca</dt>
              <dd className="font-semibold text-dark">{product.brand}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Categoría</dt>
              <dd className="font-semibold text-dark capitalize">{product.category}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">SKU</dt>
              <dd className="font-semibold text-dark">{selectedVariant?.sku}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Disponibilidad</dt>
              <dd className={`font-semibold ${selectedVariant?.stock ? 'text-green-600' : 'text-red-500'}`}>
                {selectedVariant?.stock ? 'En stock' : 'Agotado'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-2xl font-black text-dark mb-6">También puede gustarle</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} navigate={navigate} addToCart={addToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
