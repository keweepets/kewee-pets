import { CartItem, Navigate } from '../types';
import { formatPrice } from '../data';

interface Props {
  cart: CartItem[];
  navigate: Navigate;
  updateQty: (productId: string, variantId: string, qty: number) => void;
  removeItem: (productId: string, variantId: string) => void;
}

export default function CartPage({ cart, navigate, updateQty, removeItem }: Props) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 150000 ? 0 : 8000;
  const total = subtotal + shipping;

  const buildWhatsAppMessage = () => {
    const lines = cart.map(i => `• ${i.productName} (${i.variantName}) x${i.quantity} — ${formatPrice(i.price * i.quantity)}`);
    const msg = `Hola Kewee Mascotas! Quisiera hacer un pedido:\n\n${lines.join('\n')}\n\nSubtotal: ${formatPrice(subtotal)}\n\nQuedo atento a confirmar los detalles.`;
    return `https://wa.me/573001234567?text=${encodeURIComponent(msg)}`;
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-black text-dark mb-3">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">¡Descubre productos increíbles para tu mascota!</p>
        <button
          onClick={() => navigate('catalog')}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors"
        >
          Explorar productos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={() => navigate('home')} className="hover:text-green-600">Inicio</button>
        <span>/</span>
        <span className="text-dark font-medium">Carrito</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-black text-dark mb-8">Tu carrito ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {cart.map(item => (
            <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <img
                src={item.image}
                alt={item.productName}
                className="h-20 w-20 rounded-xl object-cover bg-gray-50 shrink-0 cursor-pointer"
                onClick={() => navigate('product', { slug: item.slug })}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-600 uppercase">{item.brand}</p>
                <h3
                  className="font-bold text-dark text-sm leading-snug cursor-pointer hover:text-green-600 transition-colors line-clamp-2"
                  onClick={() => navigate('product', { slug: item.slug })}
                >
                  {item.productName}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>
                <div className="flex items-center justify-between mt-3 gap-3">
                  {/* Qty control */}
                  <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 text-sm font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-bold text-dark">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-dark">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => navigate('catalog')}
            className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 mt-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Seguir comprando
          </button>
        </div>

        {/* Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-gray-50 rounded-3xl p-6 sticky top-24">
            <h2 className="text-lg font-black text-dark mb-5">Resumen del pedido</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Envío</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                  ¡Envío gratis por compras mayores a $150.000!
                </p>
              )}
              {shipping > 0 && (
                <p className="text-xs text-gray-400">
                  Envío gratis en compras mayores a $150.000 (faltan {formatPrice(150000 - subtotal)})
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-dark">Total</span>
                <span className="text-xl font-black text-dark">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('checkout')}
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-base transition-all hover:shadow-md active:scale-95 mb-3"
            >
              Finalizar compra
            </button>

            <div className="relative flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">o</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <a
              href={buildWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-500 text-green-600 font-bold rounded-2xl hover:bg-green-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Comprar por WhatsApp
            </a>

            <p className="text-xs text-gray-400 text-center mt-4 leading-snug">
              Contraentrega en Medellín únicamente por WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
