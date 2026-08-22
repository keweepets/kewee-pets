import { useState } from 'react';
import { CartItem, Order, Navigate, Customer } from '../types';
import { formatPrice } from '../data';

interface Props {
  cart: CartItem[];
  navigate: Navigate;
  placeOrder: (order: Order) => void;
}

const departments = ['Antioquia', 'Bogotá D.C.', 'Valle del Cauca', 'Atlántico', 'Cundinamarca', 'Santander', 'Bolívar', 'Nariño', 'Córdoba', 'Tolima'];

export default function Checkout({ cart, navigate, placeOrder }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'contraentrega'>('mercadopago');
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [form, setForm] = useState<Customer>({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', neighborhood: '', city: '', department: 'Antioquia',
  });
  const [errors, setErrors] = useState<Partial<Customer>>({});

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 150000 ? 0 : 8000;
  const total = subtotal + shipping;

  const validate = (): boolean => {
    const e: Partial<Customer> = {};
    if (!form.firstName.trim()) e.firstName = 'Requerido';
    if (!form.lastName.trim()) e.lastName = 'Requerido';
    if (!form.phone.trim()) e.phone = 'Requerido';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email inválido';
    if (!form.address.trim()) e.address = 'Requerido';
    if (!form.city.trim()) e.city = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (step === 'info') { setStep('payment'); return; }

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `KW-2024-${String(Math.floor(Math.random() * 900) + 100)}`,
      date: new Date().toISOString().split('T')[0],
      customer: form,
      items: cart,
      subtotal,
      discount: 0,
      shipping,
      total,
      paymentMethod,
      channel: 'tienda',
      status: 'pendiente',
    };

    if (paymentMethod === 'contraentrega') {
      const lines = cart.map(i => `• ${i.productName} (${i.variantName}) x${i.quantity} — ${formatPrice(i.price * i.quantity)}`);
      const msg = `Hola Kewee Mascotas! Quiero hacer un pedido contraentrega:\n\n${lines.join('\n')}\n\nTotal: ${formatPrice(total)}\n\nNombre: ${form.firstName} ${form.lastName}\nDirección: ${form.address}, ${form.neighborhood}, ${form.city}\nTeléfono: ${form.phone}`;
      window.open(`https://wa.me/573001234567?text=${encodeURIComponent(msg)}`, '_blank');
    }

    placeOrder(order);
  };

  const field = (
    key: keyof Customer,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-sm font-semibold text-dark mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition-colors ${
          errors[key] ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-green-400'
        }`}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  const buildWhatsAppMsg = () => {
    const lines = cart.map(i => `• ${i.productName} (${i.variantName}) x${i.quantity} — ${formatPrice(i.price * i.quantity)}`);
    const msg = `Hola Kewee Mascotas! Quiero hacer un pedido contraentrega en Medellín:\n\n${lines.join('\n')}\n\nTotal estimado: ${formatPrice(total)}\n\nNombre: ${form.firstName} ${form.lastName}\nDirección: ${form.address}, ${form.neighborhood}\nTeléfono: ${form.phone}`;
    return `https://wa.me/573001234567?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <button onClick={() => navigate('home')} className="hover:text-green-600">Inicio</button>
        <span>/</span>
        <button onClick={() => navigate('cart')} className="hover:text-green-600">Carrito</button>
        <span>/</span>
        <span className="text-dark font-medium">Checkout</span>
      </nav>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        {['Información', 'Pago'].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            {i > 0 && <div className="h-px w-8 bg-gray-200" />}
            <div className={`flex items-center gap-2 text-sm font-bold ${
              (i === 0 && step === 'info') || (i === 1 && step === 'payment')
                ? 'text-green-600' : i === 0 && step === 'payment' ? 'text-gray-400' : 'text-gray-400'
            }`}>
              <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black ${
                i === 0 && step === 'payment' ? 'bg-green-500 text-white' :
                (i === 0 && step === 'info') || (i === 1 && step === 'payment') ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>{i === 0 && step === 'payment' ? '✓' : i + 1}</span>
              {s}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1">
          {step === 'info' ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-dark mb-6">Información de contacto</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {field('firstName', 'Nombre', 'text', 'Juan')}
                {field('lastName', 'Apellido', 'text', 'García')}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {field('phone', 'Teléfono / WhatsApp', 'tel', '+57 300 000 0000')}
                {field('email', 'Correo electrónico', 'email', 'juan@email.com')}
              </div>

              <div className="border-t border-gray-100 my-5" />
              <h3 className="text-sm font-black text-dark mb-4">Dirección de entrega</h3>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-dark mb-1.5">Departamento</label>
                <select
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {field('city', 'Ciudad', 'text', 'Medellín')}
                {field('neighborhood', 'Barrio', 'text', 'El Poblado')}
              </div>

              {field('address', 'Dirección', 'text', 'Calle 45 #23-12')}

              <button
                onClick={handleSubmit}
                className="w-full mt-6 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:shadow-md active:scale-95"
              >
                Continuar con el pago
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-dark mb-6">Método de pago</h2>

              {/* Payment options */}
              <div className="space-y-3 mb-6">
                <label className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-colors ${
                  paymentMethod === 'mercadopago' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="mercadopago"
                    checked={paymentMethod === 'mercadopago'}
                    onChange={() => setPaymentMethod('mercadopago')}
                    className="mt-0.5 accent-green-500"
                  />
                  <div>
                    <p className="font-bold text-dark text-sm">Pago online con Mercado Pago</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tarjeta de crédito, débito, PSE, efectivo y más.</p>
                    <div className="flex gap-2 mt-2">
                      {['Visa', 'Mastercard', 'PSE'].map(b => (
                        <span key={b} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">{b}</span>
                      ))}
                    </div>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-colors ${
                  paymentMethod === 'contraentrega' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="contraentrega"
                    checked={paymentMethod === 'contraentrega'}
                    onChange={() => setPaymentMethod('contraentrega')}
                    className="mt-0.5 accent-green-500"
                  />
                  <div>
                    <p className="font-bold text-dark text-sm flex items-center gap-2">
                      Contraentrega en Medellín
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">Solo Medellín</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Paga en efectivo al recibir tu pedido.</p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'contraentrega' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <div>
                      <p className="font-bold text-amber-800 text-sm">Los pedidos contraentrega en Medellín se gestionan exclusivamente por WhatsApp.</p>
                      <p className="text-xs text-amber-700 mt-1">Al continuar, te redirigiremos a WhatsApp para confirmar los detalles de tu pedido con nuestro equipo.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('info')}
                  className="px-5 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-gray-300 transition-colors"
                >
                  Atrás
                </button>
                {paymentMethod === 'mercadopago' ? (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-[#009EE3] hover:bg-[#0082C3] text-white font-bold rounded-2xl transition-colors"
                  >
                    Continuar con Mercado Pago
                  </button>
                ) : (
                  <a
                    href={buildWhatsAppMsg()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-2xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Pedir por WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-gray-50 rounded-3xl p-5 sticky top-24">
            <h3 className="font-black text-dark mb-4">Tu pedido</h3>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.image} alt={item.productName} className="h-12 w-12 rounded-xl object-cover bg-gray-100" />
                    <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 flex items-center justify-center bg-green-500 text-white text-[10px] font-bold rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dark line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.variantName}</p>
                  </div>
                  <span className="text-sm font-bold text-dark shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
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
              <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-dark">Total</span>
                <span className="text-xl font-black text-dark">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
