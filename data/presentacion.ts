/**
 * ⚠️ DATOS DE PRESENTACIÓN (MOCK) — TEMPORAL
 *
 * Estos productos y marcas existen SOLO para representar visualmente el Home
 * durante las fases de diseño (FASE 2). NO es la capa de datos real.
 *
 * En FASE 3 (Catálogo) esta información se reemplazará por consultas a
 * Supabase (tablas productos / variantes_producto / marcas) usando los tipos
 * de `types/producto.ts`, que ya reflejan ese esquema. Ningún componente de
 * UI importa este archivo directamente salvo la página Home; cuando exista
 * la capa de datos se elimina este archivo completo.
 */

import type { Marca, Producto } from "@/types/producto";

export const marcas: Marca[] = [
  { id: "royal-canin", nombre: "Royal Canin" },
  { id: "pro-plan", nombre: "Pro Plan" },
  { id: "hills", nombre: "Hill's" },
  { id: "kong", nombre: "KONG" },
  { id: "zee-dog", nombre: "Zee.Dog" },
  { id: "catit", nombre: "Catit" },
  { id: "pedigree", nombre: "Pedigree" },
  { id: "whiskas", nombre: "Whiskas" },
];

export const productosPresentacion: Producto[] = [
  {
    id: "rc-med-adult",
    slug: "royal-canin-medium-adult",
    nombre: "Royal Canin Medium Adult",
    marca: "Royal Canin",
    categoria: "perros",
    subcategoria: "Alimento seco",
    descripcion:
      "Formulado específicamente para perros adultos de razas medianas (de 11 a 25 kg), Royal Canin Medium Adult ofrece nutrición precisa que ayuda a mantener el peso ideal, apoya la salud digestiva y protege la piel y el pelaje.",
    descripcionCorta: "Nutrición precisa para razas medianas de 11 a 25 kg",
    imagenes: [
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop&auto=format",
    ],
    variantes: [
      { id: "rc-med-adult-v1", nombre: "4 lb", precio: 45000, precioOriginal: 52000, sku: "RC-MED-4LB", stock: 15 },
      { id: "rc-med-adult-v2", nombre: "10 lb", precio: 95000, precioOriginal: 110000, sku: "RC-MED-10LB", stock: 8 },
      { id: "rc-med-adult-v3", nombre: "14 lb", precio: 125000, sku: "RC-MED-14LB", stock: 12 },
      { id: "rc-med-adult-v4", nombre: "25 lb", precio: 195000, sku: "RC-MED-25LB", stock: 5 },
    ],
    etiquetas: ["mas-vendido", "oferta"],
    activo: true,
    destacado: true,
    masVendido: true,
  },
  {
    id: "proplan-adult-chicken",
    slug: "pro-plan-adult-chicken",
    nombre: "Pro Plan Adult Chicken & Rice",
    marca: "Pro Plan",
    categoria: "perros",
    subcategoria: "Alimento seco",
    descripcion:
      "Pro Plan Adult con pollo y arroz proporciona nutrición avanzada con ingredientes de alta calidad para perros adultos activos. El pollo como primer ingrediente garantiza proteína de alta digestibilidad.",
    descripcionCorta: "Pollo real como primer ingrediente para energía activa",
    imagenes: [
      "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop&auto=format",
    ],
    variantes: [
      { id: "pp-adult-chicken-v1", nombre: "3 kg", precio: 55000, sku: "PP-ADT-3KG", stock: 20 },
      { id: "pp-adult-chicken-v2", nombre: "7.5 kg", precio: 110000, precioOriginal: 125000, sku: "PP-ADT-75KG", stock: 10 },
      { id: "pp-adult-chicken-v3", nombre: "15 kg", precio: 185000, sku: "PP-ADT-15KG", stock: 7 },
    ],
    etiquetas: ["mas-vendido"],
    activo: true,
    destacado: true,
    masVendido: true,
  },
  {
    id: "rc-adult-cat",
    slug: "royal-canin-adult-cat",
    nombre: "Royal Canin Adult Cat",
    marca: "Royal Canin",
    categoria: "gatos",
    subcategoria: "Alimento seco",
    descripcion:
      "Alimento completo para gatos adultos de entre 1 y 7 años. Mantiene el peso ideal y apoya la salud del tracto urinario. Croquetas adaptadas a la mandíbula del gato.",
    descripcionCorta: "Equilibrio perfecto para gatos adultos 1-7 años",
    imagenes: [
      "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&h=600&fit=crop&auto=format",
    ],
    variantes: [
      { id: "rc-adult-cat-v1", nombre: "400 g", precio: 28000, sku: "RC-CAT-400G", stock: 25 },
      { id: "rc-adult-cat-v2", nombre: "2 kg", precio: 75000, precioOriginal: 88000, sku: "RC-CAT-2KG", stock: 14 },
      { id: "rc-adult-cat-v3", nombre: "4 kg", precio: 130000, sku: "RC-CAT-4KG", stock: 8 },
    ],
    etiquetas: ["mas-vendido", "oferta"],
    activo: true,
    destacado: true,
    masVendido: true,
  },
  {
    id: "proplan-kitten",
    slug: "pro-plan-kitten",
    nombre: "Pro Plan Kitten Chicken",
    marca: "Pro Plan",
    categoria: "gatos",
    subcategoria: "Alimento seco",
    descripcion:
      "Nutrición de alta calidad para gatitos en crecimiento. Rico en DHA de aceite de pescado para el desarrollo cerebral y visual. El colostro bovino apoya el sistema inmunológico.",
    descripcionCorta: "Fórmula rica en DHA para gatitos en crecimiento",
    imagenes: [
      "https://images.unsplash.com/photo-1582725461742-8ecd962c260d?w=600&h=600&fit=crop&auto=format",
    ],
    variantes: [
      { id: "pp-kitten-v1", nombre: "1.5 kg", precio: 58000, sku: "PP-KIT-15KG", stock: 16 },
      { id: "pp-kitten-v2", nombre: "3 kg", precio: 98000, precioOriginal: 110000, sku: "PP-KIT-3KG", stock: 11 },
    ],
    etiquetas: ["mas-vendido"],
    activo: true,
    destacado: true,
    masVendido: true,
  },
  {
    id: "hills-adult",
    slug: "hills-science-diet-adult",
    nombre: "Hill's Science Diet Adult",
    marca: "Hill's",
    categoria: "perros",
    subcategoria: "Alimento seco",
    descripcion:
      "Hill's Science Diet Adult es un alimento balanceado formulado por veterinarios para perros adultos sanos. Nutrición clínicamente probada con ingredientes naturales de calidad.",
    descripcionCorta: "Formulado por veterinarios, nutrición clínicamente probada",
    imagenes: [
      "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=600&h=600&fit=crop&auto=format",
    ],
    variantes: [
      { id: "hills-adult-v1", nombre: "3.5 lb", precio: 48000, sku: "HS-ADT-35LB", stock: 18 },
      { id: "hills-adult-v2", nombre: "15 lb", precio: 135000, precioOriginal: 152000, sku: "HS-ADT-15LB", stock: 9 },
    ],
    etiquetas: ["oferta"],
    activo: true,
    destacado: false,
    masVendido: false,
  },
  {
    id: "kong-classic",
    slug: "kong-classic",
    nombre: "KONG Classic",
    marca: "KONG",
    categoria: "perros",
    subcategoria: "Juguetes",
    descripcion:
      "El juguete más icónico para perros. Fabricado en goma natural resistente, puedes rellenarlo con premios para estimulación mental y juego independiente.",
    descripcionCorta: "Juguete de goma clásico, rellénalo con premios",
    imagenes: [
      "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=600&h=600&fit=crop&auto=format",
    ],
    variantes: [
      { id: "kong-classic-v1", nombre: "S (0–9 kg)", precio: 32000, sku: "KONG-S", stock: 20 },
      { id: "kong-classic-v2", nombre: "M (9–16 kg)", precio: 38000, sku: "KONG-M", stock: 15 },
      { id: "kong-classic-v3", nombre: "L (16–29 kg)", precio: 48000, precioOriginal: 55000, sku: "KONG-L", stock: 10 },
    ],
    etiquetas: ["nuevo", "oferta"],
    activo: true,
    destacado: true,
    masVendido: false,
  },
  {
    id: "catit-bebedero",
    slug: "catit-bebedero-flower",
    nombre: "Catit Bebedero Flower Fountain",
    marca: "Catit",
    categoria: "gatos",
    subcategoria: "Accesorios",
    descripcion:
      "Fuente de agua con filtro de triple acción que estimula a los gatos a beber más. Diseño en forma de flor con tres flujos diferentes. Incluye filtro que elimina malos sabores.",
    descripcionCorta: "Fuente con filtro triple para hidratación óptima",
    imagenes: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&h=600&fit=crop&auto=format",
    ],
    variantes: [{ id: "catit-bebedero-v1", nombre: "3 L", precio: 89000, precioOriginal: 105000, sku: "CATIT-BEB-3L", stock: 7 }],
    etiquetas: ["oferta"],
    activo: true,
    destacado: true,
    masVendido: false,
  },
  {
    id: "zee-dog-collar",
    slug: "zee-dog-collar-neo",
    nombre: "Zee.Dog Collar Neo Dots",
    marca: "Zee.Dog",
    categoria: "accesorios",
    subcategoria: "Collares",
    descripcion:
      "Collar resistente y colorido de la colección Neo Dots. Tela de nylon premium con argolla de aluminio forjado. Diseño vibrante que se mantiene brillante con el uso.",
    descripcionCorta: "Nylon premium, argolla de aluminio forjado",
    imagenes: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop&auto=format",
    ],
    variantes: [
      { id: "zee-dog-collar-v1", nombre: "XS", precio: 45000, sku: "ZD-COL-XS", stock: 8 },
      { id: "zee-dog-collar-v2", nombre: "S", precio: 50000, sku: "ZD-COL-S", stock: 12 },
      { id: "zee-dog-collar-v3", nombre: "M", precio: 55000, sku: "ZD-COL-M", stock: 10 },
      { id: "zee-dog-collar-v4", nombre: "L", precio: 60000, sku: "ZD-COL-L", stock: 6 },
    ],
    etiquetas: ["nuevo"],
    activo: true,
    destacado: false,
    masVendido: false,
  },
];
