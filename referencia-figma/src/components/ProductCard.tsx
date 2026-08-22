import { useState } from 'react';
import { Product, CartItem } from '../types';
import { formatPrice } from '../data';
import { Navigate } from '../types';

interface Props {
  product: Product;
  navigate: Navigate;
  addToCart: (item: CartItem) => void;
}

const tagConfig: Record<string, { label: string; color: string }> = {
  'mas-vendido': { label: 'Más vendido', color: 'bg-green-500 text-white' },
  'oferta': { label: 'Oferta', color: 'bg-orange-500 text-white' },
  'nuevo': { label: 'Nuevo', color: 'bg-blue-500 text-white' },
};

export default function ProductCard({ product, navigate, addToCart }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0];
  const discount = selectedVariant?.originalPrice
    ? Math.round((1 - selectedVariant.price / selectedVariant.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedVariant) return;
    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      brand: product.brand,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      quantity: 1,
      image: product.images[0],
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const primaryTag = product.tags[0];

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden group cursor-pointer transition-all duration-200 flex flex-col"
      onClick={() => navigate('product', { slug: product.slug })}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Tags */}
        {primaryTag && tagConfig[primaryTag] && (
          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-bold ${tagConfig[primaryTag].color}`}>
            {tagConfig[primaryTag].label}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
            -{discount}%
          </span>
        )}
        {selectedVariant && selectedVariant.stock <= 3 && selectedVariant.stock > 0 && (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Últimas {selectedVariant.stock}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        {/* Brand + name */}
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">{product.brand}</p>
          <h3 className="text-sm font-bold text-dark leading-snug mt-0.5 line-clamp-2">{product.name}</h3>
        </div>

        {/* Variants */}
        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
            {product.variants.map(v => (
              <button
                key={v.id}
                onClick={e => { e.stopPropagation(); setSelectedVariantId(v.id); }}
                className={`px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
                  v.id === selectedVariantId
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-green-400'
                } ${v.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={v.stock === 0}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-base font-black text-dark">{formatPrice(selectedVariant?.price ?? 0)}</span>
          {selectedVariant?.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(selectedVariant.originalPrice)}</span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          className={`w-full py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            added
              ? 'bg-green-100 text-green-700'
              : selectedVariant?.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white active:scale-95'
          }`}
        >
          {added ? '¡Agregado! ✓' : selectedVariant?.stock === 0 ? 'Agotado' : '¡Lo quiero!'}
        </button>
      </div>
    </div>
  );
}
