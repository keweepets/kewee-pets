import { useState } from 'react';
import { Order, Navigate } from '../../types';
import { formatPrice } from '../../data';

interface Props {
  orders: Order[];
  orderId: string;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  navigate: Navigate;
}

const statuses: Order['status'][] = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado'];
const statusLabels: Record<Order['status'], string> = {
  pendiente: 'Pendiente', confirmado: 'Confirmado', preparando: 'Preparando',
  enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado',
};
const statusColors: Record<Order['status'], string> = {
  pendiente: 'bg-amber-100 text-amber-700', confirmado: 'bg-blue-100 text-blue-700',
  preparando: 'bg-purple-100 text-purple-700', enviado: 'bg-indigo-100 text-indigo-700',
  entregado: 'bg-green-100 text-green-700', cancelado: 'bg-gray-100 text-gray-500',
};

export default function AdminOrderDetail({ orders, orderId, setOrders, navigate }: Props) {
  const order = orders.find(o => o.id === orderId);
  const [editDiscount, setEditDiscount] = useState(false);
  const [discountVal, setDiscountVal] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountReason, setDiscountReason] = useState('');

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pedido no encontrado</p>
        <button onClick={() => navigate('admin-orders')} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm">
          Volver a pedidos
        </button>
      </div>
    );
  }

  const updateStatus = (status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o));
  };

  const applyDiscount = () => {
    const val = parseFloat(discountVal);
    if (!val) return;
    const discountAmount = discountType === 'percent'
      ? Math.round(order.subtotal * val / 100)
      : val;
    setOrders(prev => prev.map(o => o.id === order.id
      ? { ...o, discount: discountAmount, discountReason, total: o.subtotal - discountAmount + o.shipping }
      : o
    ));
    setEditDiscount(false);
  };

  const buildWhatsApp = () => {
    const msg = `Hola ${order.customer.firstName}! Tu pedido ${order.orderNumber} está listo. Total: ${formatPrice(order.total)}. ¿Confirmamos la entrega?`;
    return `https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('admin-orders')}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-dark mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a pedidos
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-dark">{order.orderNumber}</h2>
          <p className="text-sm text-gray-400">{order.date} · {order.customer.firstName} {order.customer.lastName}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={buildWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 font-bold rounded-xl text-sm hover:bg-green-100 transition-colors"
          >
            💬 WhatsApp al cliente
          </a>
          <select
            value={order.status}
            onChange={e => updateStatus(e.target.value as Order['status'])}
            className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-green-400 bg-white"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-black text-dark mb-4">Productos</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img src={item.image} alt={item.productName} className="h-12 w-12 rounded-xl object-cover bg-gray-50" />
                  <div className="flex-1">
                    <p className="font-semibold text-dark text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.variantName} · x{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-dark text-sm">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-400">{formatPrice(item.price)} c/u</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span className="flex items-center gap-2">
                    Descuento
                    {order.discountReason && (
                      <span className="text-xs text-gray-400 font-normal">({order.discountReason})</span>
                    )}
                  </span>
                  <span className="font-semibold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Envío</span>
                <span className="font-semibold">{order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-black text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Discount edit */}
            {!editDiscount ? (
              <button
                onClick={() => setEditDiscount(true)}
                className="mt-4 text-sm text-green-600 font-semibold hover:text-green-700"
              >
                + Aplicar descuento manual
              </button>
            ) : (
              <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-dark">Descuento manual</h4>
                <div className="flex gap-2">
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as 'percent' | 'fixed')}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                  >
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Valor fijo ($)</option>
                  </select>
                  <input
                    type="number"
                    value={discountVal}
                    onChange={e => setDiscountVal(e.target.value)}
                    placeholder={discountType === 'percent' ? '10' : '15000'}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <input
                  type="text"
                  value={discountReason}
                  onChange={e => setDiscountReason(e.target.value)}
                  placeholder="Motivo del descuento (ej: acordado por WhatsApp)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
                />
                <div className="flex gap-2">
                  <button onClick={applyDiscount} className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg text-sm hover:bg-green-600">
                    Aplicar
                  </button>
                  <button onClick={() => setEditDiscount(false)} className="px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-lg text-sm hover:border-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status history */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-black text-dark mb-4">Estado del pedido</h3>
            <div className="flex items-center gap-1.5">
              {(['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado'] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-1.5 flex-1">
                  {i > 0 && <div className={`h-0.5 flex-1 ${
                    statuses.indexOf(order.status) > i - 1 ? 'bg-green-400' : 'bg-gray-200'
                  }`} />}
                  <div
                    onClick={() => updateStatus(s)}
                    className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-black cursor-pointer transition-all ${
                      s === order.status ? 'border-green-500 bg-green-500 text-white' :
                      statuses.indexOf(order.status) > statuses.indexOf(s) ? 'border-green-400 bg-green-50 text-green-600' :
                      'border-gray-200 bg-white text-gray-400'
                    }`}
                    title={statusLabels[s]}
                  >
                    {statuses.indexOf(order.status) > statuses.indexOf(s) ? '✓' : i + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {(['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado'] as const).map(s => (
                <span key={s} className={`text-[10px] font-medium ${s === order.status ? 'text-green-600' : 'text-gray-400'}`}>
                  {statusLabels[s]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-black text-dark mb-4">Cliente</h3>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-dark">{order.customer.firstName} {order.customer.lastName}</p>
              <a href={`tel:${order.customer.phone}`} className="text-green-600 font-medium hover:underline block">{order.customer.phone}</a>
              <a href={`mailto:${order.customer.email}`} className="text-gray-500 hover:underline block truncate">{order.customer.email}</a>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-1">
              <p className="font-bold text-dark">Dirección de entrega</p>
              <p className="text-gray-600">{order.customer.address}</p>
              <p className="text-gray-600">{order.customer.neighborhood}, {order.customer.city}</p>
              <p className="text-gray-500">{order.customer.department}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-black text-dark mb-4">Detalles</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Canal</dt>
                <dd className="font-bold">
                  {order.channel === 'whatsapp' ? '💬 WhatsApp' : order.channel === 'manual' ? '📝 Manual' : '🛒 Online'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Pago</dt>
                <dd className="font-bold">
                  {order.paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Contraentrega'}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-500">Estado</dt>
                <dd>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fecha</dt>
                <dd className="font-medium">{order.date}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
