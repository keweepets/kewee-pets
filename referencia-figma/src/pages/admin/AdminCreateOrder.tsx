import { useState } from 'react';
import { Product, Order, CartItem, Navigate } from '../../types';
import { formatPrice } from '../../data';

interface Props {
  products: Product[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  navigate: Navigate;
}

export default function AdminCreateOrder({ products, orders, setOrders, navigate }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [channel, setChannel] = useState<Order['channel']>('whatsapp');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('contraentrega');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountVal, setDiscountVal] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [customer, setCustomer] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', neighborhood: '', city: 'Medellín', department: 'Antioquia',
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [qty, setQty] = useState(1);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmt = discountVal
    ? discountType === 'percent'
      ? Math.round(subtotal * parseFloat(discountVal) / 100)
      : parseFloat(discountVal)
    : 0;
  const shipping = subtotal > 150000 ? 0 : 8000;
  const total = subtotal - discountAmt + shipping;

  const addItem = () => {
    const prod = products.find(p => p.id === selectedProduct);
    const variant = prod?.variants.find(v => v.id === selectedVariant);
    if (!prod || !variant) return;
    const existing = items.find(i => i.productId === prod.id && i.variantId === variant.id);
    if (existing) {
      setItems(prev => prev.map(i =>
        i.productId === prod.id && i.variantId === variant.id
          ? { ...i, quantity: i.quantity + qty }
          : i
      ));
    } else {
      setItems(prev => [...prev, {
        productId: prod.id, variantId: variant.id,
        productName: prod.name, brand: prod.brand,
        variantName: variant.name, price: variant.price,
        quantity: qty, image: prod.images[0], slug: prod.slug,
      }]);
    }
    setSelectedProduct('');
    setSelectedVariant('');
    setQty(1);
  };

  const removeItem = (productId: string, variantId: string) =>
    setItems(prev => prev.filter(i => !(i.productId === productId && i.variantId === variantId)));

  const handleSave = () => {
    if (items.length === 0) { alert('Agrega al menos un producto.'); return; }
    if (!customer.firstName || !customer.phone) { alert('Nombre y teléfono son requeridos.'); return; }
    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `KW-2024-${String(orders.length + 6).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customer,
      items,
      subtotal,
      discount: discountAmt,
      discountReason: discountReason || undefined,
      shipping,
      total,
      paymentMethod,
      channel,
      status: 'pendiente',
    };
    setOrders(prev => [order, ...prev]);
    navigate('admin-orders');
  };

  const prod = products.find(p => p.id === selectedProduct);

  return (
    <div>
      <button
        onClick={() => navigate('admin-orders')}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-dark mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a pedidos
      </button>

      <h2 className="text-xl font-black text-dark mb-6">Crear pedido manual</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Products */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-black text-dark mb-4">Agregar productos</h3>
            <div className="flex flex-wrap gap-3 mb-3">
              <select
                value={selectedProduct}
                onChange={e => { setSelectedProduct(e.target.value); setSelectedVariant(''); }}
                className="flex-1 min-w-40 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
              >
                <option value="">Seleccionar producto...</option>
                {products.filter(p => p.active).map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>
                ))}
              </select>
              {prod && (
                <select
                  value={selectedVariant}
                  onChange={e => setSelectedVariant(e.target.value)}
                  className="min-w-32 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
                >
                  <option value="">Variante...</option>
                  {prod.variants.map(v => (
                    <option key={v.id} value={v.id}>{v.name} — {formatPrice(v.price)}</option>
                  ))}
                </select>
              )}
              <input
                type="number"
                value={qty}
                min={1}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 text-center"
              />
              <button
                onClick={addItem}
                disabled={!selectedProduct || !selectedVariant}
                className="px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-sm transition-colors"
              >
                Agregar
              </button>
            </div>

            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img src={item.image} alt={item.productName} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.variantName} · x{item.quantity}</p>
                    </div>
                    <span className="font-bold text-dark text-sm">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-red-300 hover:text-red-500 ml-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Ningún producto agregado aún</p>
            )}
          </div>

          {/* Client */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-black text-dark mb-4">Datos del cliente</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nombre *', key: 'firstName', placeholder: 'Juan' },
                { label: 'Apellido', key: 'lastName', placeholder: 'García' },
                { label: 'Teléfono *', key: 'phone', placeholder: '+57 300...' },
                { label: 'Correo', key: 'email', placeholder: 'juan@email.com' },
                { label: 'Dirección', key: 'address', placeholder: 'Calle 45 #23-12' },
                { label: 'Barrio', key: 'neighborhood', placeholder: 'El Poblado' },
                { label: 'Ciudad', key: 'city', placeholder: 'Medellín' },
              ].map(f => (
                <div key={f.key} className={f.key === 'address' || f.key === 'phone' ? 'col-span-2 sm:col-span-1' : ''}>
                  <label className="block text-xs font-semibold text-dark mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={(customer as Record<string, string>)[f.key]}
                    onChange={e => setCustomer(c => ({ ...c, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Channel + Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-black text-dark mb-4">Canal y pago</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">Canal de venta</label>
                <select
                  value={channel}
                  onChange={e => setChannel(e.target.value as Order['channel'])}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="manual">Venta manual</option>
                  <option value="tienda">Tienda online</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">Método de pago</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as Order['paymentMethod'])}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
                >
                  <option value="contraentrega">Contraentrega</option>
                  <option value="mercadopago">Mercado Pago</option>
                </select>
              </div>
            </div>

            {/* Discount */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-xs font-semibold text-dark mb-2">Descuento (opcional)</label>
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as 'percent' | 'fixed')}
                  className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none"
                >
                  <option value="percent">%</option>
                  <option value="fixed">$ fijo</option>
                </select>
                <input
                  type="number"
                  value={discountVal}
                  onChange={e => setDiscountVal(e.target.value)}
                  placeholder={discountType === 'percent' ? '10' : '15000'}
                  className="w-24 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
                <input
                  type="text"
                  value={discountReason}
                  onChange={e => setDiscountReason(e.target.value)}
                  placeholder="Motivo del descuento..."
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <h3 className="font-black text-dark mb-4">Resumen del pedido</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Descuento ({discountType === 'percent' ? `${discountVal}%` : 'fijo'})</span>
                  <span className="font-semibold">-{formatPrice(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Envío</span>
                <span className="font-semibold">{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-black text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
            >
              Guardar pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
