import { useState } from 'react';
import { products as initialProducts, orders as initialOrders } from './data';
import { CartItem, Order, Page, NavParams, Product, Navigate } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import NosotrosPage from './pages/NosotrosPage';
import ContactoPage from './pages/ContactoPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminCreateOrder from './pages/admin/AdminCreateOrder';

function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
      <h2 className="text-xl font-black text-dark mb-2">{title}</h2>
      <p className="text-gray-400 text-sm">Esta sección está en desarrollo.</p>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [currentProductSlug, setCurrentProductSlug] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [lastOrderId, setLastOrderId] = useState('');

  const navigate: Navigate = (p: Page, params?: NavParams) => {
    setPage(p);
    if (params?.slug) setCurrentProductSlug(params.slug);
    if (params?.orderId) setCurrentOrderId(params.orderId);
    if (params?.category !== undefined) setCurrentCategory(params.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === item.productId && i.variantId === item.variantId);
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, variantId: string) =>
    setCart(prev => prev.filter(i => !(i.productId === productId && i.variantId === variantId)));

  const updateCartQty = (productId: string, variantId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId, variantId); return; }
    setCart(prev => prev.map(i =>
      i.productId === productId && i.variantId === variantId ? { ...i, quantity: qty } : i
    ));
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const placeOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setLastOrderId(order.id);
    setCart([]);
    setPage('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin login page
  if (page === 'admin-login') {
    return (
      <AdminLogin
        onLogin={() => {
          setAdminLoggedIn(true);
          setPage('admin-dashboard');
        }}
      />
    );
  }

  // Admin pages
  const isAdminPage = page.startsWith('admin-');
  if (isAdminPage) {
    if (!adminLoggedIn) {
      setPage('admin-login');
      return null;
    }
    return (
      <AdminLayout
        page={page}
        navigate={navigate}
        onLogout={() => { setAdminLoggedIn(false); setPage('home'); }}
      >
        {page === 'admin-dashboard' && (
          <AdminDashboard orders={orders} products={products} navigate={navigate} />
        )}
        {(page === 'admin-products' || page === 'admin-create-product') && (
          <AdminProducts
            products={products}
            setProducts={setProducts}
            navigate={navigate}
            createMode={page === 'admin-create-product'}
          />
        )}
        {page === 'admin-orders' && (
          <AdminOrders orders={orders} navigate={navigate} />
        )}
        {page === 'admin-order-detail' && (
          <AdminOrderDetail
            orders={orders}
            orderId={currentOrderId}
            setOrders={setOrders}
            navigate={navigate}
          />
        )}
        {page === 'admin-create-order' && (
          <AdminCreateOrder
            products={products}
            orders={orders}
            setOrders={setOrders}
            navigate={navigate}
          />
        )}
        {page === 'admin-categories' && <AdminPlaceholder title="Gestión de categorías" />}
        {page === 'admin-brands' && <AdminPlaceholder title="Gestión de marcas" />}
        {page === 'admin-promotions' && <AdminPlaceholder title="Gestión de promociones" />}
        {page === 'admin-settings' && <AdminPlaceholder title="Configuración" />}
      </AdminLayout>
    );
  }

  // Public store
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={cartCount}
        cartTotal={cartTotal}
        navigate={navigate}
        onCartClick={() => navigate('cart')}
      />
      <main className="flex-1">
        {page === 'home' && (
          <Home products={products} navigate={navigate} addToCart={addToCart} />
        )}
        {page === 'catalog' && (
          <Catalog
            products={products}
            category={currentCategory}
            navigate={navigate}
            addToCart={addToCart}
          />
        )}
        {page === 'product' && (
          <ProductDetail
            products={products}
            slug={currentProductSlug}
            navigate={navigate}
            addToCart={addToCart}
          />
        )}
        {page === 'cart' && (
          <CartPage
            cart={cart}
            navigate={navigate}
            updateQty={updateCartQty}
            removeItem={removeFromCart}
          />
        )}
        {page === 'checkout' && (
          <Checkout cart={cart} navigate={navigate} placeOrder={placeOrder} />
        )}
        {page === 'confirmation' && (
          <OrderConfirmation
            orders={orders}
            orderId={lastOrderId}
            navigate={navigate}
          />
        )}
        {page === 'nosotros' && <NosotrosPage navigate={navigate} />}
        {page === 'contacto' && <ContactoPage navigate={navigate} />}
      </main>
      <Footer navigate={navigate} />
      <WhatsAppButton />
    </div>
  );
}
