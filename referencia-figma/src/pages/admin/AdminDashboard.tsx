import { Order, Product, Navigate } from '../../types';
import { formatPrice } from '../../data';

interface Props {
  orders: Order[];
  products: Product[];
  navigate: Navigate;
}

export default function AdminDashboard({ orders, products, navigate }: Props) {
  const totalSales = orders.filter(o => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === 'pendiente').length;
  const onlineOrders = orders.filter(o => o.channel === 'tienda').length;
  const whatsappOrders = orders.filter(o => o.channel === 'whatsapp' || o.channel === 'manual').length;
  const lowStock = products.filter(p => p.variants.some(v => v.stock > 0 && v.stock <= 3)).length;
  const outOfStock = products.filter(p => p.variants.every(v => v.stock === 0)).length;

  const stats = [
    { label: 'Ventas del mes', value: formatPrice(totalSales), icon: '💰', color: 'bg-green-50 text-green-700', detail: `${orders.length} pedidos` },
    { label: 'Pedidos pendientes', value: String(pending), icon: '⏳', color: 'bg-amber-50 text-amber-700', detail: 'Requieren atención' },
    { label: 'Inventario bajo', value: String(lowStock), icon: '⚠️', color: 'bg-orange-50 text-orange-700', detail: '≤3 unidades' },
    { label: 'Productos agotados', value: String(outOfStock), icon: '❌', color: 'bg-red-50 text-red-700', detail: 'Sin stock' },
  ];

  const statusConfig: Record<Order['status'], { label: string; color: string }> = {
    pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
    confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
    preparando: { label: 'Preparando', color: 'bg-purple-100 text-purple-700' },
    enviado: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-700' },
    entregado: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
    cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-600' },
  };

  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color.split(' ')[0]}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-xs font-medium ${s.color.split(' ')[1]} opacity-60`}>{s.detail}</span>
            </div>
            <p className="text-2xl font-black text-dark">{s.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-dark">Pedidos recientes</h2>
            <button
              onClick={() => navigate('admin-orders')}
              className="text-sm text-green-600 font-semibold hover:text-green-700"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {recent.map(o => (
              <div
                key={o.id}
                onClick={() => navigate('admin-order-detail', { orderId: o.id })}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                  o.channel === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {o.channel === 'whatsapp' ? '💬' : '🛒'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">{o.customer.firstName} {o.customer.lastName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-dark">{formatPrice(o.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[o.status].color}`}>
                    {statusConfig[o.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel breakdown */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-black text-dark mb-4">Ventas por canal</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-600">Tienda online</span>
                  <span className="font-bold">{onlineOrders}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(onlineOrders / orders.length) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-600">WhatsApp / Manual</span>
                  <span className="font-bold">{whatsappOrders}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${(whatsappOrders / orders.length) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-black text-dark mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('admin-create-order')}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-green-50 hover:bg-green-100 rounded-xl text-sm font-semibold text-green-700 transition-colors text-left"
              >
                <span>+</span> Crear pedido manual
              </button>
              <button
                onClick={() => navigate('admin-create-product')}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-semibold text-blue-700 transition-colors text-left"
              >
                <span>+</span> Crear producto
              </button>
              <button
                onClick={() => navigate('admin-orders')}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl text-sm font-semibold text-amber-700 transition-colors text-left"
              >
                <span>⏳</span> Ver pendientes ({pending})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
