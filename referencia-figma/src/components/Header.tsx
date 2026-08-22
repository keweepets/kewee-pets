import { useState } from 'react';
import { Navigate, Page } from '../types';
import mascot from '../imports/IMG_1439.JPG';

interface Props {
  cartCount: number;
  cartTotal: number;
  navigate: Navigate;
  onCartClick: () => void;
}

const navLinks: { label: string; page: Page; category?: string }[] = [
  { label: 'Perros', page: 'catalog', category: 'perros' },
  { label: 'Gatos', page: 'catalog', category: 'gatos' },
  { label: 'Accesorios', page: 'catalog', category: 'accesorios' },
  { label: 'Promociones', page: 'catalog', category: 'ofertas' },
  { label: 'Nosotros', page: 'nosotros' },
];

export default function Header({ cartCount, cartTotal, navigate, onCartClick }: Props) {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('catalog');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <img src={mascot} alt="Kewee mascota" className="h-9 w-9 rounded-full object-cover" />
          <div className="hidden sm:block leading-tight">
            <div className="font-black text-xl text-green-500 tracking-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
              kewee
            </div>
            <div className="text-[10px] text-muted tracking-[0.2em] uppercase -mt-1 font-medium">mascotas</div>
          </div>
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar productos, marcas..."
              className="w-full h-9 pl-4 pr-10 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Icons */}
        <div className="flex items-center gap-1">
          {/* WhatsApp */}
          <a
            href="https://wa.me/573001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-green-50 text-green-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>

          {/* Cart */}
          <button
            onClick={onCartClick}
            className="relative h-9 flex items-center gap-1.5 px-3 rounded-full hover:bg-green-50 transition-colors group"
          >
            <svg className="w-5 h-5 text-dark group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <>
                <span className="text-sm font-semibold text-dark hidden sm:block">
                  ${(cartTotal / 1000).toFixed(0)}k
                </span>
                <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold">
                  {cartCount}
                </span>
              </>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors md:hidden"
          >
            <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Nav bar */}
      <div className="bg-green-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => navigate(link.page, link.category ? { category: link.category } : undefined)}
              className="px-4 py-2 text-white/90 hover:text-white hover:bg-green-600 text-sm font-medium transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => navigate('contacto')}
            className="px-4 py-2 text-white/90 hover:text-white hover:bg-green-600 text-sm font-medium transition-colors"
          >
            Contacto
          </button>
          <div className="ml-auto flex items-center gap-2 py-1">
            <span className="text-white/70 text-xs">Contraentrega disponible en Medellín</span>
            <span className="h-1 w-1 rounded-full bg-white/50" />
            <button
              onClick={() => navigate('admin-login')}
              className="text-white/60 hover:text-white text-xs transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => { navigate(link.page, link.category ? { category: link.category } : undefined); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-dark hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { navigate('contacto'); setMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-dark hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            Contacto
          </button>
        </div>
      )}
    </header>
  );
}
