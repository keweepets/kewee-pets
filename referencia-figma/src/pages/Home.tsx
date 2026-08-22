import { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Navigate } from '../types';
import { formatPrice, brands } from '../data';
import ProductCard from '../components/ProductCard';
import mascotFull from '../imports/IMG_1438.PNG';

interface Props {
  products: Product[];
  navigate: Navigate;
  addToCart: (item: CartItem) => void;
}

const heroSlides = [
  {
    bg: 'bg-green-500',
    image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&h=500&fit=crop&auto=format',
    eyebrow: 'Bienvenidos a Kewee',
    title: 'Todo lo que tu mascota necesita',
    subtitle: 'Alimentos premium, juguetes y accesorios seleccionados con amor.',
    cta: 'Explorar productos',
    ctaPage: 'catalog' as const,
  },
  {
    bg: 'bg-[#2D2D2D]',
    image: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=800&h=500&fit=crop&auto=format',
    eyebrow: 'Para tus gatos',
    title: 'Nutrición de primera para ellos',
    subtitle: 'Descubre nuestras marcas favoritas: Royal Canin, Pro Plan, Hill\'s y más.',
    cta: 'Ver para gatos',
    ctaPage: 'catalog' as const,
    ctaCategory: 'gatos',
  },
  {
    bg: 'bg-cream',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=500&fit=crop&auto=format',
    eyebrow: 'Contraentrega en Medellín',
    title: 'Paga al recibir en tu puerta',
    subtitle: 'Pedidos contraentrega gestionados exclusivamente por WhatsApp.',
    cta: 'Pedir por WhatsApp',
    ctaPage: 'contacto' as const,
    dark: false,
  },
];

export default function Home({ products, navigate, addToCart }: Props) {
  const [slide, setSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const bestSellers = products.filter(p => p.bestSeller);
  const featured = products.filter(p => p.featured);

  const current = heroSlides[slide];
  const isLight = current.bg === 'bg-cream';

  return (
    <div>
      {/* Hero Slider */}
      <div className={`relative overflow-hidden ${current.bg} transition-colors duration-700`}>
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isLight ? 'text-green-600' : 'text-green-300'}`}>
                {current.eyebrow}
              </p>
              <h1 className={`text-3xl md:text-5xl font-black leading-tight mb-4 ${isLight ? 'text-dark' : 'text-white'}`}>
                {current.title}
              </h1>
              <p className={`text-base md:text-lg mb-6 max-w-md ${isLight ? 'text-gray-600' : 'text-white/80'}`}>
                {current.subtitle}
              </p>
              <button
                onClick={() => navigate(current.ctaPage, 'ctaCategory' in current && current.ctaCategory ? { category: current.ctaCategory } : undefined)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full text-base shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                {current.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            {/* Image */}
            <div className="flex-1 max-w-xs md:max-w-sm">
              <img
                src={current.image}
                alt="Hero"
                className="w-full rounded-3xl shadow-2xl object-cover aspect-square"
              />
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-green-500' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Categories row */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Perros', emoji: '🐕', color: 'bg-amber-50 border-amber-200', category: 'perros' },
            { label: 'Gatos', emoji: '🐈', color: 'bg-purple-50 border-purple-200', category: 'gatos' },
            { label: 'Accesorios', emoji: '🦮', color: 'bg-blue-50 border-blue-200', category: 'accesorios' },
            { label: 'Promociones', emoji: '🏷️', color: 'bg-red-50 border-red-200', category: 'ofertas' },
          ].map(cat => (
            <button
              key={cat.label}
              onClick={() => navigate('catalog', { category: cat.category })}
              className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 ${cat.color} hover:scale-105 transition-transform font-bold text-dark`}
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Perros + Gatos split */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Perros */}
          <div
            className="relative overflow-hidden rounded-3xl h-64 md:h-80 cursor-pointer group"
            onClick={() => navigate('catalog', { category: 'perros' })}
          >
            <img
              src="https://images.unsplash.com/photo-1648316465628-f21950bedc4f?w=700&h=500&fit=crop&auto=format"
              alt="Sección perros"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-1">Sección</p>
              <h3 className="text-white text-2xl font-black mb-2">Para perros</h3>
              <p className="text-white/80 text-sm mb-4">Alimentos, juguetes y accesorios para tu mejor amigo.</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-dark text-sm font-bold rounded-full hover:bg-green-50 transition-colors">
                Comprar para perros
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Gatos */}
          <div
            className="relative overflow-hidden rounded-3xl h-64 md:h-80 cursor-pointer group"
            onClick={() => navigate('catalog', { category: 'gatos' })}
          >
            <img
              src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=700&h=500&fit=crop&auto=format"
              alt="Sección gatos"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-1">Sección</p>
              <h3 className="text-white text-2xl font-black mb-2">Para gatos</h3>
              <p className="text-white/80 text-sm mb-4">El juego y la nutrición importan. Cuídalos bien.</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-dark text-sm font-bold rounded-full hover:bg-green-50 transition-colors">
                Comprar para gatos
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bestsellers carousel */}
      <div className="bg-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-1">Favoritos</p>
              <h2 className="text-2xl md:text-3xl font-black text-dark">Los favoritos de nuestros peludos</h2>
            </div>
            <button
              onClick={() => navigate('catalog')}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {bestSellers.map(p => (
              <div key={p.id} className="snap-start shrink-0 w-52 sm:w-60">
                <ProductCard product={p} navigate={navigate} addToCart={addToCart} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promo banner */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-green-500 min-h-[200px] flex items-center">
          <img
            src="https://images.unsplash.com/photo-1582725461742-8ecd962c260d?w=1200&h=300&fit=crop&auto=format"
            alt="Promoción"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply"
          />
          <div className="relative z-10 px-8 md:px-16 py-10 max-w-lg">
            <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Promoción especial
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
              Hasta 20% OFF en alimentos seleccionados
            </h2>
            <p className="text-white/85 mb-6">Oferta válida hasta el 31 de agosto. No acumulable con otras promociones.</p>
            <button
              onClick={() => navigate('catalog', { category: 'ofertas' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-bold rounded-full hover:bg-green-50 transition-colors"
            >
              Ver promociones
            </button>
          </div>
        </div>
      </div>

      {/* Nosotros section */}
      <div className="bg-cream py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <img
                  src={mascotFull}
                  alt="Kewee Mascotas"
                  className="h-56 md:h-72 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-2">Quiénes somos</p>
              <h2 className="text-2xl md:text-4xl font-black text-dark mb-4 leading-tight">
                Creemos que cada mascota merece lo mejor
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Somos una tienda virtual colombiana especializada en productos para mascotas. Seleccionamos cada producto con amor y criterio, porque sabemos que tu compañero peludo es parte de la familia.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: '💚', label: 'Amor por los animales' },
                  { icon: '✓', label: 'Marcas de confianza' },
                  { icon: '🚀', label: 'Envío rápido' },
                  { icon: '📱', label: 'Atención por WhatsApp' },
                ].map(v => (
                  <div key={v.label} className="flex items-center gap-2 text-sm font-medium text-dark">
                    <span className="text-base">{v.icon}</span>
                    {v.label}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('nosotros')}
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-green-500 text-green-600 font-bold rounded-full hover:bg-green-500 hover:text-white transition-colors"
              >
                Conocer más sobre Kewee
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured products grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-1">Destacados</p>
            <h2 className="text-2xl md:text-3xl font-black text-dark">Consentir a tu mascota</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map(p => (
            <ProductCard key={p.id} product={p} navigate={navigate} addToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">
            Nuestras marcas
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {brands.map(b => (
              <button
                key={b.id}
                onClick={() => navigate('catalog')}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-green-400 hover:text-green-600 hover:shadow-sm transition-all"
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-dark mb-4">
          Todo lo que tu mascota necesita,<br className="hidden md:block" /> en un solo lugar.
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Desde alimentos premium hasta accesorios especiales. Con entrega a domicilio y contraentrega en Medellín.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('catalog')}
            className="px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full text-base transition-all hover:shadow-md active:scale-95"
          >
            Explorar productos
          </button>
          <a
            href="https://wa.me/573001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-green-500 text-green-600 font-bold rounded-full text-base hover:bg-green-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
