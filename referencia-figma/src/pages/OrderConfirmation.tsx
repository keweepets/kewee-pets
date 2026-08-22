import { Order, Navigate } from '../types';
import { formatPrice } from '../data';

interface Props {
  orders: Order[];
  orderId: string;
  navigate: Navigate;
}

const statusLabels: Record<Order['status'], string> = {
  pendiente: 'Pendiente', confirmado: 'Confirmado', preparando: 'Preparando',
  enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado',
};

export default function OrderConfirmation({ orders, orderId, navigate }: Props) {
  const order = orders.find(o => o.id === orderId) ?? orders[0];

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">No se encontró el pedido.</p>
        <button onClick={() => navigate('home')} className="mt-4 px-6 py-2.5 bg-green-500 text-white font-bold rounded-full">
          Ir al inicio
        </button>
      </div>
    );
  }

  const isWhatsApp = order.paymentMethod === 'contraentrega' || order.channel === 'whatsapp';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-dark mb-2">¡Pedido recibido!</h1>
        <p className="text-gray-500">
          {isWhatsApp
            ? 'Tu solicitud fue enviada por WhatsApp. Nuestro equipo confirmará tu pedido pronto.'
            : 'Hemos recibido tu pedido. Recibirás una confirmación por correo electrónico.'
          }
        </p>
      </div>

      {/* Order card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Número de pedido</p>
            <p className="text-xl font-black text-dark">{order.orderNumber}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
            order.status === 'pendiente' ? 'bg-amber-100 text-amber-700' :
            order.status === 'confirmado' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'
          }`}>
            {statusLabels[order.status]}
          </span>
        </div>

        {/* Status bar */}
        {!isWhatsApp && (
          <div className="flex items-center gap-1 mb-6">
            {(['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`h-2 rounded-full flex-1 ${
                  ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado'].indexOf(order.status) >= i
                    ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
        )}

        {/* Items */}
        <div className="space-y-3 mb-5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <img src={item.image} alt={item.productName} className="h-12 w-12 rounded-xl object-cover bg-gray-50" />
              <div className="flex-1">
                <p className="text-sm font-bold text-dark">{item.productName}</p>
                <p className="text-xs text-gray-400">{item.variantName} · x{item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-dark">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Envío</span>
            <span>{order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-black text-base pt-1 border-t border-gray-100">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Payment / Channel */}
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-medium text-gray-700">
            <span>{order.paymentMethod === 'mercadopago' ? '💳' : '📱'}</span>
            {order.paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Contraentrega'}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-medium text-gray-700">
            <span>{order.channel === 'whatsapp' ? '💬' : '🛒'}</span>
            {order.channel === 'whatsapp' ? 'WhatsApp' : 'Tienda online'}
          </div>
        </div>
      </div>

      {/* WhatsApp special message */}
      {isWhatsApp && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-8 h-8 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <div>
              <p className="font-bold text-green-800 mb-1">Próximo paso: confirma por WhatsApp</p>
              <p className="text-sm text-green-700">Nuestro equipo se pondrá en contacto contigo para coordinar la entrega y confirmar los detalles del pago contraentrega.</p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery info */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-sm">
        <h3 className="font-bold text-dark mb-3">Dirección de entrega</h3>
        <p className="text-gray-600">{order.customer.firstName} {order.customer.lastName}</p>
        <p className="text-gray-600">{order.customer.address}, {order.customer.neighborhood}</p>
        <p className="text-gray-600">{order.customer.city}, {order.customer.department}</p>
        <p className="text-gray-600 mt-1">{order.customer.phone}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('home')}
          className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-colors"
        >
          Seguir comprando
        </button>
        <button
          onClick={() => navigate('catalog')}
          className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-gray-300 transition-colors"
        >
          Explorar productos
        </button>
      </div>
    </div>
  );
}
