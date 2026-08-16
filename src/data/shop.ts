import type { BrandChip } from '@/theme/brand';

/**
 * The Vendly.lk design's own data.
 *
 * Kept apart from `mock.ts`, which models the COD-reliability product: a
 * five-tier risk ramp, derived money-at-risk, waybills. This design is a
 * different product surface — LKR, order sources, a flat Low/Medium/High COD
 * flag — so it gets its own module rather than being bent onto that one.
 *
 * Figures are transcribed from the handoff. Same seam as before: swap this for
 * the API when there is one.
 */

export const shop = {
  greeting: 'Good morning',
  name: "Pahan's Fashion Store",
  owner: 'Pahan',
  email: 'Pahan@gmail.com',
  plan: 'Premium Plan',
  category: 'Clothing & Fashion',
  phone: '+94 77 123 4567',
  whatsapp: '+94 77 123 4567',
  address: '132314, da road, abc garden',
  revenueToday: 4820,
  revenueDelta: '↑ 18% vs yesterday',
};

/** `4820` → `4,820`. The design writes every amount as `LKR 4,820`. */
export function lkr(amount: number): string {
  return amount.toLocaleString('en-US');
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
export type OrderSource = 'WhatsApp' | 'Facebook' | 'Instagram';

export type ShopOrder = {
  id: string;
  name: string;
  item: string;
  source: OrderSource;
  time: string;
  amount: number;
  status: OrderStatus;
  address: string;
  courier: string;
  payment: string;
};

/** Status → chip colour, as the design keys them. */
export const STATUS_CHIP: Record<OrderStatus, BrandChip> = {
  Pending: 'yellow',
  Shipped: 'navy',
  Delivered: 'green',
  Cancelled: 'red',
};

export const SOURCE_CHIP: Record<OrderSource, BrandChip> = {
  WhatsApp: 'green',
  Facebook: 'blue',
  Instagram: 'purple',
};

const ADDRESS = '132314, da road,\nabc garden,\nhell nah';

export const orders: ShopOrder[] = [
  {
    id: '#432',
    name: 'Dinithi',
    item: 'Nike boots x 1',
    source: 'WhatsApp',
    time: '10:42 A.M.',
    amount: 500,
    status: 'Pending',
    address: ADDRESS,
    courier: 'Koobiyo',
    payment: 'COD',
  },
  {
    id: '#433',
    name: 'Venuja',
    item: 'Nike bottles x 1',
    source: 'Facebook',
    time: '10:42 A.M.',
    amount: 700,
    status: 'Shipped',
    address: ADDRESS,
    courier: 'Koobiyo',
    payment: 'COD',
  },
  {
    id: '#434',
    name: 'Dananjaya',
    item: 'Nike bags x 1',
    source: 'Instagram',
    time: '10:42 A.M.',
    amount: 1500,
    status: 'Delivered',
    address: ADDRESS,
    courier: 'Pronto Lanka',
    payment: 'COD',
  },
  {
    id: '#435',
    name: 'Kamal',
    item: 'Nike caps x 1',
    source: 'WhatsApp',
    time: '10:42 A.M.',
    amount: 400,
    status: 'Pending',
    address: ADDRESS,
    courier: 'Koobiyo',
    payment: 'COD',
  },
];

export function findShopOrder(id: string | undefined): ShopOrder | undefined {
  if (!id) return undefined;
  const wanted = id.startsWith('#') ? id : `#${id}`;
  return orders.find((o) => o.id === wanted);
}

export const ORDER_TABS: ('All' | OrderStatus)[] = [
  'All',
  'Pending',
  'Shipped',
  'Delivered',
  'Cancelled',
];

// ── Customers ───────────────────────────────────────────────────────────────

export type CodFlag = 'Low' | 'Medium' | 'COD : High';

export type ShopCustomer = {
  name: string;
  orders: number;
  spent: number;
  last: string;
  cod: CodFlag;
};

export const COD_CHIP: Record<CodFlag, BrandChip> = {
  Low: 'green',
  Medium: 'yellow',
  'COD : High': 'red',
};

export const customers: ShopCustomer[] = [
  { name: 'Dinithi', orders: 12, spent: 6700, last: 'Last order 2h ago', cod: 'COD : High' },
  { name: 'Venuja', orders: 1, spent: 700, last: 'Last order 9h ago', cod: 'Low' },
  { name: 'Dananjaya', orders: 2, spent: 1400, last: 'Last order 2d ago', cod: 'Medium' },
  { name: 'Kamal', orders: 8, spent: 4200, last: 'Last order 5d ago', cod: 'Medium' },
];

export const customerStats = { total: 248, repeat: 186, repeatPct: 75 };

// ── Inventory ───────────────────────────────────────────────────────────────

export type StockState = 'Good' | 'Low' | 'Out Of Stock';

export type ShopProduct = { name: string; price: number; stock: number; state: StockState };

export const STOCK_CHIP: Record<StockState, BrandChip> = {
  Good: 'green',
  Low: 'orange',
  'Out Of Stock': 'red',
};

export const products: ShopProduct[] = [
  { name: 'Nike Boots', price: 500, stock: 24, state: 'Good' },
  { name: 'Nike Caps', price: 400, stock: 7, state: 'Low' },
  { name: 'Nike Bags', price: 1500, stock: 0, state: 'Out Of Stock' },
  { name: 'Nike Bottels', price: 700, stock: 34, state: 'Good' },
];

// ── Analytics ───────────────────────────────────────────────────────────────

export const analytics = {
  revenue: 80000,
  totalOrders: 150,
  averageOrder: 3000,
  netProfit: 30000,
  /** The last seven days, as the "Daily Orders" line chart plots them. */
  daily: [
    { label: 'Mon', value: 18 },
    { label: 'Tue', value: 24 },
    { label: 'Wed', value: 21 },
    { label: 'Thu', value: 32 },
    { label: 'Fri', value: 41 },
  ],
  /** The y-axis the design draws: 0 to 40 in steps of 10. */
  axisMax: 40,
};

// ── Couriers ────────────────────────────────────────────────────────────────

export const courierStats = {
  active: 2,
  pendingWaybills: 18,
  averageDelivery: 480,
  deliveryRate: 92,
};

export type ShopCourier = { name: string; meta: string; state: 'Active' | 'Pending' };

export const couriers: ShopCourier[] = [
  { name: 'Koobiyo', meta: '14 active · COD settled weekly', state: 'Active' },
  { name: 'Pronto Lanka', meta: '4 active · 2 waybills pending', state: 'Pending' },
];

export const COURIER_CHIP: Record<ShopCourier['state'], BrandChip> = {
  Active: 'green',
  Pending: 'yellow',
};

// ── Home ────────────────────────────────────────────────────────────────────

export const homeStats = [
  { key: 'new', label: 'New Orders', value: '24', delta: '↑ 3 today' },
  { key: 'cod', label: 'Pending COD', value: '12', delta: '12 orders' },
  { key: 'delivered', label: 'Delivered', value: '18', delta: 'Today' },
  { key: 'cancelled', label: 'Cancelled', value: '3', delta: 'COD issues' },
] as const;
