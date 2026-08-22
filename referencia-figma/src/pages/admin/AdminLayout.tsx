import { useState } from 'react';
import { Page, Navigate } from '../../types';
import mascot from '../../imports/IMG_1439.JPG';

interface Props {
  page: Page;
  navigate: Navigate;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems: { label: string; icon: string; page: Page }[] = [
  { label: 'Dashboard', icon: '📊', page: 'admin-dashboard' },
  { label: 'Productos', icon: '📦', page: 'admin-products' },
  { label: 'Pedidos', icon: '🛒', page: 'admin-orders' },
  { label: 'Categorías', icon: '🗂️', page: 'admin-categories' },
  { label: 'Marcas', icon: '🏷️', page: 'admin-brands' },
  { label: 'Promociones', icon: '🎯', page: 'admin-promotions' },
  { label: 'Configuración', icon: '⚙️', page: 'admin-settings' },
];

export default function AdminLayout({ page, navigate, onLogout, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = ({ mobile = false }) => (
    <nav className={`${mobile ? '' : 'hidden md:flex'} flex-col h-full`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <img src={mascot} alt="Kewee" className="h-9 w-9 rounded-full object-cover" />
        <div>
          <div className="font-black text-base text-dark leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>kewee</div>
          <div className="text-[9px] text-gray-400 tracking-[0.2em] uppercase">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => { navigate(item.page); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
              page === item.page
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-dark'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <button
          onClick={() => navigate('home')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-dark transition-colors text-left"
        >
          <span>🛍️</span> Ver tienda
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left"
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-56 bg-white flex flex-col h-full shadow-xl">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-black text-dark text-base leading-tight">
              {navItems.find(n => n.page === page)?.label ?? 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-sm">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
