import { Navigate } from '../types';
import mascotFull from '../imports/IMG_1438.PNG';

interface Props { navigate: Navigate; }

export default function NosotrosPage({ navigate }: Props) {
  return (
    <div>
      {/* Hero */}
      <div className="bg-green-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img src={mascotFull} alt="Kewee Mascotas" className="h-40 object-contain mx-auto mb-6 drop-shadow-xl" />
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Somos Kewee Mascotas</h1>
          <p className="text-white/85 text-lg max-w-xl mx-auto">
            Una tienda colombiana creada por personas que aman a los animales, para personas que aman a los animales.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Historia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-2">Nuestra historia</p>
            <h2 className="text-2xl md:text-3xl font-black text-dark mb-4">Nació del amor por las mascotas</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Kewee Mascotas nació en Medellín con una misión clara: hacer que cuidar a tu mascota sea más fácil, accesible y confiable. Seleccionamos cada producto con el mismo criterio que usaríamos para nuestras propias mascotas.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Nuestro nombre viene de la mezcla entre "kiwi" y "we" — una tienda verde, fresca y nuestra. El personaje Kewee es un oso perezoso sonriente, porque creemos que una mascota bien cuidada es una mascota feliz y relajada.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&h=400&fit=crop&auto=format"
            alt="Perro feliz"
            className="rounded-3xl shadow-lg w-full object-cover aspect-video"
          />
        </div>

        {/* Values */}
        <div className="bg-cream rounded-3xl p-8 md:p-12">
          <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-2 text-center">Lo que nos mueve</p>
          <h2 className="text-2xl md:text-3xl font-black text-dark mb-8 text-center">Nuestra filosofía</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: '💚', title: 'Amor genuino', desc: 'Cada decisión la tomamos pensando en el bienestar de las mascotas y de sus familias.' },
              { icon: '✅', title: 'Calidad real', desc: 'Solo vendemos marcas en las que confiamos. Nada que no le daríamos a los nuestros.' },
              { icon: '🤝', title: 'Cercanía', desc: 'Somos una tienda local. Te atendemos con calidez, no con chatbots ni respuestas automáticas.' },
              { icon: '🚀', title: 'Agilidad', desc: 'Tu pedido sale rápido. Sabemos que tu mascota no puede esperar.' },
              { icon: '📦', title: 'Transparencia', desc: 'Precios claros, sin sorpresas. Lo que ves es lo que pagas.' },
              { icon: '🐾', title: 'Compromiso animal', desc: 'Parte de nuestras ganancias se destina a apoyar causas de bienestar animal en Colombia.' },
            ].map(v => (
              <div key={v.title} className="text-center">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-black text-dark mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-dark mb-4">¿Listo para consentir a tu mascota?</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('catalog')}
              className="px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors"
            >
              Ver productos
            </button>
            <button
              onClick={() => navigate('contacto')}
              className="px-8 py-3.5 border-2 border-green-500 text-green-600 font-bold rounded-full hover:bg-green-50 transition-colors"
            >
              Contáctanos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
