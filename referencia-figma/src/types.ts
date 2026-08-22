export interface Variant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  shortDesc: string;
  images: string[];
  variants: Variant[];
  tags: string[];
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  brand: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

export interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  department: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountReason?: string;
  shipping: number;
  total: number;
  paymentMethod: 'mercadopago' | 'contraentrega';
  channel: 'tienda' | 'whatsapp' | 'manual';
  status: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
}

export type Page =
  | 'home'
  | 'catalog'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'confirmation'
  | 'nosotros'
  | 'contacto'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-create-product'
  | 'admin-orders'
  | 'admin-order-detail'
  | 'admin-create-order'
  | 'admin-categories'
  | 'admin-brands'
  | 'admin-promotions'
  | 'admin-settings';

export interface NavParams {
  slug?: string;
  orderId?: string;
  category?: string;
}

export type Navigate = (page: Page, params?: NavParams) => void;
