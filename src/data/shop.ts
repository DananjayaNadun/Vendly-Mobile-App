import type { TranslationKey } from '@/i18n';
import type { BrandChip } from '@/theme/brand';

/**
 * The Vendly.lk design's own data.
 *
 * **Nothing here holds a display string.** Statuses, stock states, COD flags
 * and courier states are stored as translation keys, and relative times as a
 * number plus a unit, so switching to Sinhala or Tamil actually changes them.
 * The first pass kept them as English literals, which left half of every screen
 * in English whichever language was selected.
 *
 * Proper nouns stay as they are: people's names, product names, the shop, and
 * the channels (WhatsApp, Facebook, Instagram are brands, not words).
 *
 * Same seam as ever: swap this for the API when there is one.
 */

export const shop = {
  greetingKey: 'shop.goodMorning' as TranslationKey,
  name: "Pahan's Fashion Store",
  owner: 'Pahan',
  email: 'Pahan@gmail.com',
  plan: 'Premium Plan',
  category: 'Clothing & Fashion',
  phone: '+94 77 123 4567',
  whatsapp: '+94 77 123 4567',
  address: '132314, da road, abc garden',
  revenueToday: 4820,
  /** The delta is a number; the sentence around it is a translation. */
  revenueDeltaPct: 18,
};

/** `4820` → `4,820`. Amounts stay Latin in all three locales. */
export function lkr(amount: number): string {
  return amount.toLocaleString('en-US');
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';
export type OrderSource = 'WhatsApp' | 'Facebook' | 'Instagram';

export type ShopOrder = {
  id: string;
  name: string;
  /** The product, as a name and a quantity — joined by `shop.itemQty`. */
  item: { product: string; qty: number };
  source: OrderSource;
  time: string;
  amount: number;
  status: OrderStatus;
  address: string;
  courier: string;
  payment: string;
};

export const STATUS_LABEL: Record<OrderStatus, TranslationKey> = {
  pending: 'status.pending',
  shipped: 'status.shipped',
  delivered: 'status.delivered',
  cancelled: 'shop.cancelled',
};

export const STATUS_CHIP: Record<OrderStatus, BrandChip> = {
  pending: 'yellow',
  shipped: 'navy',
  delivered: 'green',
  cancelled: 'red',
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
    item: { product: 'Nike boots', qty: 1 },
    source: 'WhatsApp',
    time: '10:42 A.M.',
    amount: 500,
    status: 'pending',
    address: ADDRESS,
    courier: 'Koobiyo',
    payment: 'COD',
  },
  {
    id: '#433',
    name: 'Venuja',
    item: { product: 'Nike bottles', qty: 1 },
    source: 'Facebook',
    time: '10:42 A.M.',
    amount: 700,
    status: 'shipped',
    address: ADDRESS,
    courier: 'Koobiyo',
    payment: 'COD',
  },
  {
    id: '#434',
    name: 'Dananjaya',
    item: { product: 'Nike bags', qty: 1 },
    source: 'Instagram',
    time: '10:42 A.M.',
    amount: 1500,
    status: 'delivered',
    address: ADDRESS,
    courier: 'Pronto Lanka',
    payment: 'COD',
  },
  {
    id: '#435',
    name: 'Kamal',
    item: { product: 'Nike caps', qty: 1 },
    source: 'WhatsApp',
    time: '10:42 A.M.',
    amount: 400,
    status: 'pending',
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

/** The status tabs above the orders list. `all` is not a status. */
export const ORDER_TABS: ('all' | OrderStatus)[] = [
  'all',
  'pending',
  'shipped',
  'delivered',
  'cancelled',
];

export const TAB_LABEL: Record<'all' | OrderStatus, TranslationKey> = {
  all: 'status.all',
  ...STATUS_LABEL,
};

// ── Customers ───────────────────────────────────────────────────────────────

export type CodFlag = 'low' | 'medium' | 'high';

export type ShopCustomer = {
  name: string;
  phone: string;
  orders: number;
  spent: number;
  /** Relative age of the last order, so it can be phrased per locale. */
  last: { value: number; unit: 'h' | 'd' };
  cod: CodFlag;
};

export const COD_LABEL: Record<CodFlag, TranslationKey> = {
  low: 'shop.codLow',
  medium: 'shop.codMedium',
  high: 'shop.codHigh',
};

export const COD_CHIP: Record<CodFlag, BrandChip> = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
};

export const customers: ShopCustomer[] = [
  { name: 'Dinithi', phone: '+94 77 111 2233', orders: 12, spent: 6700, last: { value: 2, unit: 'h' }, cod: 'high' },
  { name: 'Venuja', phone: '+94 77 222 3344', orders: 1, spent: 700, last: { value: 9, unit: 'h' }, cod: 'low' },
  { name: 'Dananjaya', phone: '+94 77 333 4455', orders: 2, spent: 1400, last: { value: 2, unit: 'd' }, cod: 'medium' },
  { name: 'Kamal', phone: '+94 77 444 5566', orders: 8, spent: 4200, last: { value: 5, unit: 'd' }, cod: 'medium' },
];

export const customerStats = { total: 248, repeat: 186, repeatPct: 75 };

// ── Inventory ───────────────────────────────────────────────────────────────

export type StockState = 'good' | 'low' | 'out';

export type ShopProduct = { name: string; price: number; stock: number };

export const STOCK_LABEL: Record<StockState, TranslationKey> = {
  good: 'shop.stockGood',
  low: 'shop.stockLow',
  out: 'shop.stockOut',
};

export const STOCK_CHIP: Record<StockState, BrandChip> = {
  good: 'green',
  low: 'orange',
  out: 'red',
};

/** Derived, so an adjusted count cannot disagree with the chip beside it. */
export function stockState(count: number): StockState {
  if (count === 0) return 'out';
  return count <= 10 ? 'low' : 'good';
}

export const products: ShopProduct[] = [
  { name: 'Nike Boots', price: 500, stock: 24 },
  { name: 'Nike Caps', price: 400, stock: 7 },
  { name: 'Nike Bags', price: 1500, stock: 0 },
  { name: 'Nike Bottels', price: 700, stock: 34 },
];

// ── Analytics ───────────────────────────────────────────────────────────────

/**
 * One point on the trend chart. Both metrics travel together so the chart can
 * switch between them without refetching or re-deriving anything.
 */
export type MetricPoint = { labelKey: TranslationKey; revenue: number; orders: number };

export type PeriodKey = 'week' | 'month' | 'quarter';

export type AnalyticsPeriod = {
  key: PeriodKey;
  labelKey: TranslationKey;
  /** The bucket the points are grouped into — days, weeks or months. */
  bucketKey: TranslationKey;
  points: MetricPoint[];
  /** The same span, one period earlier. This is what the deltas compare against. */
  previous: { revenue: number; orders: number };
  channels: { source: OrderSource; orders: number }[];
  top: { product: string; units: number; price: number }[];
};

/**
 * Three spans, each bucketed at a size that stays legible: seven daily points,
 * four weekly ones, three monthly ones. Plotting thirty raw days in a 340pt-wide
 * card would be a smear, so the bucket changes with the range rather than the
 * point count exploding.
 */
const PERIODS: Record<PeriodKey, AnalyticsPeriod> = {
  week: {
    key: 'week',
    labelKey: 'shop.period7',
    bucketKey: 'shop.perDay',
    points: [
      { labelKey: 'axis.mon', orders: 18, revenue: 9600 },
      { labelKey: 'axis.tue', orders: 24, revenue: 12800 },
      { labelKey: 'axis.wed', orders: 21, revenue: 11200 },
      { labelKey: 'axis.thu', orders: 32, revenue: 17100 },
      { labelKey: 'axis.fri', orders: 41, revenue: 21900 },
      { labelKey: 'axis.sat', orders: 8, revenue: 4300 },
      { labelKey: 'axis.sun', orders: 6, revenue: 3100 },
    ],
    previous: { revenue: 67800, orders: 132 },
    channels: [
      { source: 'WhatsApp', orders: 93 },
      { source: 'Facebook', orders: 36 },
      { source: 'Instagram', orders: 21 },
    ],
    top: [
      { product: 'Nike Bottels', units: 31, price: 700 },
      { product: 'Nike Boots', units: 42, price: 500 },
      { product: 'Nike Bags', units: 14, price: 1500 },
      { product: 'Nike Caps', units: 28, price: 400 },
    ],
  },
  month: {
    key: 'month',
    labelKey: 'shop.period30',
    bucketKey: 'shop.perWeek',
    points: [
      { labelKey: 'axis.w1', orders: 132, revenue: 67800 },
      { labelKey: 'axis.w2', orders: 145, revenue: 74200 },
      { labelKey: 'axis.w3', orders: 138, revenue: 71500 },
      { labelKey: 'axis.w4', orders: 150, revenue: 80000 },
    ],
    previous: { revenue: 268900, orders: 512 },
    channels: [
      { source: 'WhatsApp', orders: 352 },
      { source: 'Facebook', orders: 133 },
      { source: 'Instagram', orders: 80 },
    ],
    top: [
      { product: 'Nike Bottels', units: 118, price: 700 },
      { product: 'Nike Boots', units: 156, price: 500 },
      { product: 'Nike Bags', units: 49, price: 1500 },
      { product: 'Nike Caps', units: 102, price: 400 },
    ],
  },
  quarter: {
    key: 'quarter',
    labelKey: 'shop.period90',
    bucketKey: 'shop.perMonth',
    points: [
      { labelKey: 'axis.jun', orders: 498, revenue: 254200 },
      { labelKey: 'axis.jul', orders: 540, revenue: 279800 },
      { labelKey: 'axis.aug', orders: 565, revenue: 293500 },
    ],
    previous: { revenue: 731000, orders: 1420 },
    channels: [
      { source: 'WhatsApp', orders: 998 },
      { source: 'Facebook', orders: 378 },
      { source: 'Instagram', orders: 227 },
    ],
    top: [
      { product: 'Nike Bottels', units: 331, price: 700 },
      { product: 'Nike Boots', units: 442, price: 500 },
      { product: 'Nike Bags', units: 138, price: 1500 },
      { product: 'Nike Caps', units: 289, price: 400 },
    ],
  },
};

export const PERIOD_KEYS: PeriodKey[] = ['week', 'month', 'quarter'];

/** The share of revenue the shop keeps. Net profit is derived, never authored. */
const MARGIN = 0.375;

/**
 * Everything the Analytics screen shows, computed from the period's own points.
 *
 * The design states four headline figures independently, and they disagree:
 * revenue 80,000 over 150 orders is an average of 533, not the 3,000 printed
 * beside it. Deriving the average from the two figures above it is the only way
 * the tiles can all be true at once — the same rule the rest of this file
 * follows.
 */
export function analyticsFor(key: PeriodKey) {
  const period = PERIODS[key];
  const revenue = period.points.reduce((sum, p) => sum + p.revenue, 0);
  const orders = period.points.reduce((sum, p) => sum + p.orders, 0);
  const totalChannel = period.channels.reduce((sum, c) => sum + c.orders, 0);

  /** Percentage change against the previous span, rounded to a whole number. */
  const delta = (now: number, before: number) =>
    before === 0 ? 0 : Math.round(((now - before) / before) * 100);

  return {
    ...period,
    revenue,
    orders,
    averageOrder: orders === 0 ? 0 : Math.round(revenue / orders),
    netProfit: Math.round(revenue * MARGIN),
    revenueDelta: delta(revenue, period.previous.revenue),
    ordersDelta: delta(orders, period.previous.orders),
    channels: period.channels.map((c) => ({
      ...c,
      share: totalChannel === 0 ? 0 : Math.round((c.orders / totalChannel) * 100),
    })),
    top: [...period.top]
      .map((p) => ({ ...p, revenue: p.units * p.price }))
      .sort((a, b) => b.revenue - a.revenue),
  };
}

export type AnalyticsView = ReturnType<typeof analyticsFor>;

/** Kept for the Home screen's report share, which has no period picker. */
export const analytics = analyticsFor('week');

// ── Couriers ────────────────────────────────────────────────────────────────

export const courierStats = {
  active: 2,
  pendingWaybills: 18,
  averageDelivery: 480,
  deliveryRate: 92,
};

export type CourierState = 'active' | 'pending';

export type ShopCourier = {
  name: string;
  active: number;
  waybills?: number;
  state: CourierState;
};

export const COURIER_LABEL: Record<CourierState, TranslationKey> = {
  active: 'shop.courierActive',
  pending: 'shop.courierPending',
};

export const COURIER_CHIP: Record<CourierState, BrandChip> = {
  active: 'green',
  pending: 'yellow',
};

export const couriers: ShopCourier[] = [
  { name: 'Koobiyo', active: 14, state: 'active' },
  { name: 'Pronto Lanka', active: 4, waybills: 2, state: 'pending' },
];

/** Couriers the shop has not linked yet — the connect list. */
export const availableCouriers = ['Domex', 'Aramex LK', 'DHL Express'];

// ── Home ────────────────────────────────────────────────────────────────────

/**
 * The four counters. Each names the orders tab it opens, so tapping one is a
 * real navigation rather than decoration.
 */
export const homeStats: {
  key: string;
  label: TranslationKey;
  value: string;
  /** The delta is a key plus its numbers, so it translates like everything else. */
  delta: { key: TranslationKey; vars?: Record<string, string | number> };
  /** Movement, when there is any. Drawn as an arrow rather than typed as one. */
  direction?: 'up' | 'down';
  tab: 'all' | OrderStatus;
}[] = [
  {
    key: 'new',
    label: 'shop.newOrders',
    value: '24',
    delta: { key: 'shop.deltaToday', vars: { n: 3 } },
    direction: 'up',
    tab: 'pending',
  },
  {
    key: 'cod',
    label: 'shop.pendingCod',
    value: '12',
    delta: { key: 'shop.deltaOrders', vars: { n: 12 } },
    tab: 'pending',
  },
  {
    key: 'delivered',
    label: 'shop.delivered',
    value: '18',
    delta: { key: 'common.today' },
    tab: 'delivered',
  },
  {
    key: 'cancelled',
    label: 'shop.cancelled',
    value: '3',
    delta: { key: 'shop.deltaCodIssues' },
    tab: 'cancelled',
  },
];
