import { useState } from 'react';
import { Order, Navigate } from '../../types';
import { formatPrice } from '../../data';

interface Props {
  orders: Order[];
  navigate: Navigate;
}

const statusConfig: Record<Order['status'], { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  preparando: { label: 'Preparando', color: 'bg-purple-100 text-purple-700' },
  enviado: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-700' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500' },
};

export default function AdminOrders({ orders, navigate }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (channelFilter && o.channel !== channelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.firstName.toLowerCase().includes(q) ||
        o.customer.lastName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-dark">Pedidos</h2>
          <p className="text-sm text-gray-500">{orders.length} pedidos en total</p>
        </div>
        <button
          onClick={() => navigate('admin-create-order')}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
        >
          <span>+</span> Crear pedido
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por número o cliente..."
          className="flex-1 min-w-40 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
        >
          <option value="">Todos los estados</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={channelFilter}
          onChange={e => setChannelFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
        >
          <option value="">Todos los canales</option>
          <option value="tienda">Tienda online</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Pedido</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Canal</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Pago</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Total</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Ver</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr
                  key={o.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate('admin-order-detail', { orderId: o.id })}
                >
                  <td className="px-4 py-3">
                    <p className="font-bold text-dark">{o.orderNumber}</p>
                    <p className="text-xs text-gray-400">{o.date}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="font-medium text-dark">{o.customer.firstName} {o.customer.lastName}</p>
                    <p className="text-xs text-gray-400">{o.customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      o.channel === 'whatsapp' ? 'bg-green-100 text-green-700' :
                      o.channel === 'manual' ? 'bg-gray-100 text-gray-600' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {o.channel === 'whatsapp' ? '💬 WhatsApp' : o.channel === 'manual' ? '📝 Manual' : '🛒 Online'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">
                    {o.paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Contraentrega'}
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <p className="font-black text-dark">{formatPrice(o.total)}</p>
                    {o.discount > 0 && (
                      <p className="text-xs text-red-400">-{formatPrice(o.discount)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusConfig[o.status].color}`}>
                      {statusConfig[o.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <p className="font-medium">No se encontraron pedidos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
