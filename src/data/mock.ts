import type { Locale, TranslationKey } from '@/i18n';
import type { RiskLevel } from '@/theme/tokens';

/**
 * Every figure, name and id in this file is transcribed from the design so the
 * built screens read identically to the prototype. Swap this module for the API
 * layer when there is one; nothing above it assumes the data is static.
 *
 * **Nothing in here is written down twice.** The orders array is the only record
 * of what the shop is holding, and every count, total and queue on every screen
 * is derived from it at the bottom of this file. Filter counts used to be
 * authored separately from the list they sat above, which is how "Packing · 5"
 * ended up over an empty screen; a customer's risky/tracked/at-risk figures used
 * to be authored three times, which is how one shop had six risky customers on
 * Account and four on Insights. Deriving is what stops those drifting again.
 *
 * Names carry per-locale forms because the Sinhala screen in the design
 * transliterates them (Nimali Perera → නිමාලි පෙරේරා) rather than leaving them
 * Latin. Amounts never localise — the design keeps numerals Latin everywhere.
 */

export type LocalizedName = Record<Locale, string>;

export function name(n: LocalizedName, locale: Locale): string {
  return n[locale];
}

/** `84250` → `84,250`. Grouping stays Latin in all three locales. */
export function money(amount: number): string {
  return amount.toLocaleString('en-US');
}

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

export type Variant = { name: 'teal' | 'mustard' | 'indigo' | 'natural'; stock: number };

export type Product = {
  id: string;
  title: string;
  sku: string;
  price: number;
  cost?: number;
  marginPct?: number;
  stock: number;
  /** Drives which stock pill the row shows. */
  state: 'ok' | 'low' | 'out';
  /** Hidden from the shop's website and from the sellable lists. */
  hidden?: boolean;
  variantLabel?: { kind: 'sizes' | 'colours'; count: number };
  variants?: Variant[];
  /** Units sold in the last 30 days. Ranks the fast-movers list. */
  sold30?: number;
  revenue30?: number;
  runsOutDays?: number;
};

export const products: Product[] = [
  {
    id: 'bcs-01',
    title: 'Batik Cotton Shirt',
    sku: 'BCS-01',
    price: 3200,
    cost: 1750,
    marginPct: 45,
    stock: 14,
    state: 'ok',
    variantLabel: { kind: 'sizes', count: 3 },
    sold30: 31,
    revenue30: 99200,
    runsOutDays: 14,
  },
  {
    id: 'hls-04',
    title: 'Handloom Scarf',
    sku: 'HLS-04',
    price: 1350,
    cost: 700,
    marginPct: 48,
    stock: 6,
    state: 'low',
    variantLabel: { kind: 'colours', count: 3 },
    variants: [
      { name: 'teal', stock: 2 },
      { name: 'mustard', stock: 4 },
      { name: 'indigo', stock: 0 },
    ],
    sold30: 18,
    revenue30: 24300,
    runsOutDays: 9,
  },
  {
    id: 'lns-02',
    title: 'Linen Sarong',
    sku: 'LNS-02',
    price: 2750,
    cost: 1500,
    marginPct: 45,
    stock: 22,
    state: 'ok',
    variantLabel: { kind: 'colours', count: 2 },
    variants: [
      { name: 'natural', stock: 14 },
      { name: 'indigo', stock: 8 },
    ],
    sold30: 24,
    revenue30: 66000,
    runsOutDays: 27,
  },
  {
    id: 'tea-03',
    title: 'Ceylon Tea Gift Box',
    sku: 'TEA-03',
    price: 2250,
    cost: 1180,
    marginPct: 48,
    stock: 18,
    state: 'ok',
    sold30: 27,
    revenue30: 60750,
    runsOutDays: 20,
  },
  {
    id: 'cdb-07',
    title: 'Coir Doormat',
    sku: 'CDB-07',
    price: 1650,
    cost: 820,
    marginPct: 50,
    stock: 31,
    state: 'ok',
    sold30: 9,
    revenue30: 14850,
    runsOutDays: 103,
  },
  {
    id: 'msk-11',
    title: 'Wooden Mask',
    sku: 'MSK-11',
    price: 4400,
    cost: 2400,
    marginPct: 45,
    stock: 3,
    state: 'low',
    variantLabel: { kind: 'sizes', count: 2 },
    sold30: 4,
    revenue30: 17600,
    runsOutDays: 22,
  },
  {
    id: 'ble-09',
    title: 'Beeralu Earrings',
    sku: 'BLE-09',
    price: 890,
    cost: 410,
    marginPct: 54,
    stock: 0,
    state: 'out',
    sold30: 12,
    revenue30: 10680,
  },
  {
    id: 'srb-05',
    title: 'Silver Bangle',
    sku: 'SRB-05',
    price: 6800,
    cost: 4100,
    marginPct: 40,
    stock: 0,
    state: 'out',
    hidden: true,
    sold30: 0,
    revenue30: 0,
  },
];

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * A colour or size, carried as a translation key rather than as text.
 *
 * Variants used to be appended per product id at the call site (`' · Teal'`),
 * which meant a Tamil seller read a Latin colour name in the middle of a Tamil
 * line. Sizes stay Latin on purpose — `L` and `M` are size letters, not words.
 */
export type VariantRef = { variantKey?: TranslationKey; size?: string };

/** `Handloom Scarf` + `{variantKey: 'colour.teal'}` → `Handloom Scarf · Teal`. */
export function productLabel(
  title: string,
  ref: VariantRef | undefined,
  t: (key: TranslationKey) => string,
): string {
  const suffix = ref?.size ?? (ref?.variantKey ? t(ref.variantKey) : undefined);
  return suffix ? `${title} · ${suffix}` : title;
}

/** What the shop actually offers: hidden products are not sellable. */
export const sellableProducts = products.filter((p) => !p.hidden);

/**
 * The fast-movers strip in the order builder, ranked by units sold rather than
 * hand-picked — an out-of-stock product offered with a live "+" was the previous
 * result of picking by index.
 */
export const fastMovers = sellableProducts
  .filter((p) => p.state !== 'out')
  .sort((a, b) => (b.sold30 ?? 0) - (a.sold30 ?? 0));

export const productsMeta = {
  all: sellableProducts.length,
  low: sellableProducts.filter((p) => p.state === 'low').length,
  out: sellableProducts.filter((p) => p.state === 'out').length,
  hidden: products.filter((p) => p.hidden).length,
  total: products.length,
};

// ─────────────────────────────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────────────────────────────

export type Channel = 'whatsapp' | 'messenger' | 'instagram';

/** A line from this customer's history, used to pre-fill the order builder. */
export type PriorPurchase = VariantRef & { productId: string; times?: number };

export type Customer = {
  id: string;
  name: LocalizedName;
  initials: string;
  phone: string;
  risk: RiskLevel;
  address?: string;
  landmark?: string;
  city?: string;
  orderCount?: number;
  lastOrder?: string;
  /** COD history, as shown in the rating sheet. */
  refused?: number;
  accepted?: number;
  /** Lifetime value, shown on the customers list and profile. */
  totalSpent?: number;
  /** Where this customer reaches the shop. */
  channel?: Channel;
  /** A seller's own note, shown on the profile. */
  note?: string;
  /** Set when the seller has overridden the computed rating. */
  overridden?: boolean;
  /**
   * What they have bought before, newest first. Step 2 of the order builder and
   * the profile both read this — before, both showed the same two hardcoded
   * products to every customer, so picking Dilani listed Nimali's history.
   */
  boughtBefore?: PriorPurchase[];
};

export const customers: Record<string, Customer> = {
  nimali: {
    id: 'nimali',
    name: { en: 'Nimali Perera', si: 'නිමාලි පෙරේරා', ta: 'நிமாலி பெரேரா' },
    initials: 'NP',
    phone: '077 412 8890',
    risk: 'risky',
    address: '142/3 Peradeniya Road, Kandy 20000',
    landmark: 'Landmark: near Sarasavi bookshop',
    city: 'Kandy',
    orderCount: 5,
    lastOrder: '12 Jul',
    refused: 2,
    accepted: 3,
    totalSpent: 21400,
    channel: 'messenger',
    note: 'Asks for teal in everything. Prefers evening delivery.',
    boughtBefore: [
      { productId: 'bcs-01', size: 'L', times: 3 },
      { productId: 'hls-04', variantKey: 'colour.teal', times: 2 },
    ],
  },
  dilani: {
    id: 'dilani',
    name: { en: 'Dilani Fernando', si: 'දිලානි ප්‍රනාන්දු', ta: 'திலானி பெர்னாண்டோ' },
    initials: 'DF',
    phone: '071 220 5514',
    risk: 'excellent',
    city: 'Colombo',
    address: '58 Galle Road, Colombo 03',
    orderCount: 22,
    lastOrder: '9 Aug',
    refused: 0,
    accepted: 19,
    totalSpent: 96300,
    channel: 'whatsapp',
    boughtBefore: [
      { productId: 'tea-03', times: 6 },
      { productId: 'lns-02', variantKey: 'colour.natural', times: 4 },
      { productId: 'cdb-07', times: 2 },
    ],
  },
  kasun: {
    id: 'kasun',
    name: { en: 'Kasun Jayaweera', si: 'කසුන් ජයවීර', ta: 'கசுன் ஜயவீர' },
    initials: 'KJ',
    phone: '077 550 1120',
    risk: 'good',
    city: 'Gampaha',
    address: '12/1 Station Road, Gampaha 11000',
    orderCount: 14,
    lastOrder: '9 Aug',
    refused: 1,
    accepted: 12,
    totalSpent: 61250,
    channel: 'whatsapp',
    boughtBefore: [
      { productId: 'bcs-01', size: 'M', times: 4 },
      { productId: 'lns-02', variantKey: 'colour.natural', times: 3 },
    ],
  },
  ruwan: {
    id: 'ruwan',
    name: { en: 'Ruwan Silva', si: 'රුවන් සිල්වා', ta: 'ருவன் சில்வா' },
    initials: 'RS',
    phone: '070 663 2280',
    risk: 'average',
    city: 'Matara',
    address: '9 Beach Road, Matara 81000',
    refused: 1,
    accepted: 8,
    orderCount: 9,
    lastOrder: '2 Aug',
    totalSpent: 18900,
    channel: 'messenger',
    boughtBefore: [{ productId: 'ble-09', times: 2 }],
  },
  unknown: {
    id: 'unknown',
    name: { en: 'Unknown number', si: 'නාඳුනන අංකය', ta: 'தெரியாத எண்' },
    initials: '?',
    phone: '076 908 1123',
    risk: 'high',
    orderCount: 1,
    lastOrder: '9 Aug',
    refused: 0,
    accepted: 0,
    totalSpent: 0,
    channel: 'instagram',
  },
  sanduni: {
    id: 'sanduni',
    name: { en: 'Sanduni Ratnayake', si: 'සඳුනි රත්නායක', ta: 'சந்துனி ரத்நாயக்க' },
    initials: 'SR',
    phone: '077 100 4432',
    risk: 'good',
    city: 'Kurunegala',
    address: '204 Negombo Road, Kurunegala 60000',
    orderCount: 11,
    lastOrder: '8 Aug',
    refused: 1,
    accepted: 9,
    totalSpent: 47600,
    channel: 'whatsapp',
    boughtBefore: [
      { productId: 'tea-03', times: 3 },
      { productId: 'hls-04', variantKey: 'colour.mustard', times: 2 },
    ],
  },
  thilini: {
    id: 'thilini',
    name: { en: 'Thilini Bandara', si: 'තිලිනි බණ්ඩාර', ta: 'திலினி பண்டார' },
    initials: 'TB',
    phone: '071 884 2019',
    risk: 'risky',
    city: 'Negombo',
    address: '31 Lewis Place, Negombo 11500',
    orderCount: 6,
    lastOrder: '28 Jul',
    refused: 2,
    accepted: 4,
    totalSpent: 14250,
    channel: 'messenger',
    boughtBefore: [{ productId: 'cdb-07', times: 2 }],
  },
  malith: {
    id: 'malith',
    name: { en: 'Malith Gunasekara', si: 'මලිත් ගුණසේකර', ta: 'மலித் குணசேகர' },
    initials: 'MG',
    phone: '076 401 7738',
    risk: 'high',
    city: 'Colombo',
    address: '77 Havelock Road, Colombo 05',
    orderCount: 4,
    lastOrder: '19 Jul',
    refused: 3,
    accepted: 1,
    totalSpent: 5600,
    channel: 'instagram',
    boughtBefore: [{ productId: 'bcs-01', size: 'L', times: 1 }],
  },
};

/** The customers list, ordered the way the screen shows them: most recent first. */
export const customerList: Customer[] = [
  customers.dilani,
  customers.kasun,
  customers.sanduni,
  customers.nimali,
  customers.ruwan,
  customers.thilini,
  customers.malith,
  customers.unknown,
];

/** Worst first. Shared by the needs-review queue and the tier bar. */
export const riskOrder: Record<RiskLevel, number> = {
  high: 0,
  risky: 1,
  average: 2,
  good: 3,
  excellent: 4,
};

/** The customers a seller is being asked to watch: Risky and High risk only. */
export const riskyCustomers = customerList
  .filter((cust) => cust.risk === 'risky' || cust.risk === 'high')
  .sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk] || (b.refused ?? 0) - (a.refused ?? 0));

// ─────────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'packing' | 'shipped' | 'delivered';
export type PaymentKind = 'cod' | 'card';

/** How far an order has travelled. Drives the timeline and the primary action. */
export const statusRank: Record<OrderStatus, number> = {
  pending: 0,
  packing: 1,
  shipped: 2,
  delivered: 3,
};

export type OrderLine = VariantRef & {
  productId: string;
  title: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  customer: Customer;
  total: number;
  itemCount: number;
  status: OrderStatus;
  payment: PaymentKind;
  /** `undefined` groups the order under Today. */
  day?: 'today' | 'earlier';
  /** Relative age, shown in the list and the app bar. Today's orders only. */
  placedAgo?: string;
  /** Absolute timestamp, shown on the timeline. */
  placedAt: string;
  deliveredAt?: string;
  channel?: string;
  lines: OrderLine[];
  subtotal: number;
  delivery: number;
  /** Set once a courier has been booked. */
  courierId?: string;
};

/** What an order is authored as; everything else about it is computed. */
type OrderSpec = Omit<Order, 'customer' | 'lines' | 'total' | 'itemCount' | 'subtotal'> & {
  customerId: keyof typeof customers;
  lines: (VariantRef & { productId: string; qty: number })[];
};

const DEFAULT_DELIVERY = 350;

const orderSpecs: OrderSpec[] = [
  // ── Today ────────────────────────────────────────────────────────────────
  {
    id: '#VD-2418',
    customerId: 'unknown',
    status: 'pending',
    payment: 'cod',
    day: 'today',
    placedAgo: '20 min ago',
    placedAt: 'Today, 09:40',
    channel: 'Instagram',
    delivery: DEFAULT_DELIVERY,
    lines: [
      { productId: 'msk-11', size: 'L', qty: 2 },
      { productId: 'tea-03', qty: 1 },
    ],
  },
  {
    id: '#VD-2417',
    customerId: 'dilani',
    status: 'pending',
    payment: 'card',
    day: 'today',
    placedAgo: '12 min ago',
    placedAt: 'Today, 09:12',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    lines: [
      { productId: 'lns-02', variantKey: 'colour.natural', qty: 1 },
      { productId: 'cdb-07', qty: 1 },
    ],
  },
  {
    id: '#VD-2416',
    customerId: 'kasun',
    status: 'shipped',
    payment: 'cod',
    day: 'today',
    placedAgo: '40 min ago',
    placedAt: 'Today, 08:35',
    channel: 'WhatsApp',
    delivery: 200,
    courierId: 'pronto',
    lines: [
      { productId: 'lns-02', variantKey: 'colour.natural', qty: 2 },
      { productId: 'bcs-01', size: 'M', qty: 1 },
    ],
  },
  {
    id: '#VD-2415',
    customerId: 'nimali',
    status: 'pending',
    payment: 'cod',
    day: 'today',
    placedAgo: '1 hr ago',
    placedAt: 'Today, 08:14',
    channel: 'Messenger',
    delivery: DEFAULT_DELIVERY,
    lines: [
      { productId: 'bcs-01', size: 'L', qty: 1 },
      { productId: 'hls-04', variantKey: 'colour.teal', qty: 1 },
    ],
  },
  {
    id: '#VD-2414',
    customerId: 'ruwan',
    status: 'pending',
    payment: 'cod',
    day: 'today',
    placedAgo: '1 hr ago',
    placedAt: 'Today, 08:02',
    channel: 'Messenger',
    delivery: DEFAULT_DELIVERY,
    lines: [{ productId: 'ble-09', qty: 2 }],
  },
  {
    id: '#VD-2413',
    customerId: 'dilani',
    status: 'pending',
    payment: 'card',
    day: 'today',
    placedAgo: '2 hr ago',
    placedAt: 'Today, 07:55',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    lines: [{ productId: 'tea-03', qty: 2 }],
  },
  {
    id: '#VD-2412',
    customerId: 'kasun',
    status: 'pending',
    payment: 'cod',
    day: 'today',
    placedAgo: '2 hr ago',
    placedAt: 'Today, 07:31',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    lines: [
      { productId: 'bcs-01', size: 'M', qty: 1 },
      { productId: 'cdb-07', qty: 2 },
    ],
  },
  {
    id: '#VD-2409',
    customerId: 'kasun',
    status: 'packing',
    payment: 'cod',
    day: 'today',
    placedAgo: '3 hr ago',
    placedAt: 'Today, 07:10',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    lines: [{ productId: 'lns-02', variantKey: 'colour.indigo', qty: 1 }],
  },
  {
    id: '#VD-2408',
    customerId: 'dilani',
    status: 'packing',
    payment: 'card',
    day: 'today',
    placedAgo: '3 hr ago',
    placedAt: 'Today, 06:48',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    lines: [{ productId: 'bcs-01', size: 'M', qty: 2 }],
  },
  {
    id: '#VD-2404',
    customerId: 'dilani',
    status: 'shipped',
    payment: 'cod',
    day: 'today',
    placedAgo: '4 hr ago',
    placedAt: 'Today, 06:20',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    courierId: 'pronto',
    lines: [
      { productId: 'tea-03', qty: 2 },
      { productId: 'cdb-07', qty: 1 },
    ],
  },

  // ── Earlier ──────────────────────────────────────────────────────────────
  {
    id: '#VD-2411',
    customerId: 'sanduni',
    status: 'pending',
    payment: 'cod',
    day: 'earlier',
    placedAt: '8 Aug, 18:20',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    lines: [
      { productId: 'hls-04', variantKey: 'colour.mustard', qty: 2 },
      { productId: 'tea-03', qty: 1 },
    ],
  },
  {
    id: '#VD-2410',
    customerId: 'sanduni',
    status: 'pending',
    payment: 'cod',
    day: 'earlier',
    placedAt: '8 Aug, 17:05',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    lines: [{ productId: 'cdb-07', qty: 1 }],
  },
  {
    id: '#VD-2407',
    customerId: 'thilini',
    status: 'packing',
    payment: 'cod',
    day: 'earlier',
    placedAt: '8 Aug, 16:40',
    channel: 'Messenger',
    delivery: DEFAULT_DELIVERY,
    lines: [
      { productId: 'hls-04', variantKey: 'colour.indigo', qty: 1 },
      { productId: 'ble-09', qty: 1 },
    ],
  },
  {
    id: '#VD-2406',
    customerId: 'sanduni',
    status: 'packing',
    payment: 'cod',
    day: 'earlier',
    placedAt: '8 Aug, 15:12',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    lines: [{ productId: 'tea-03', qty: 1 }],
  },
  {
    id: '#VD-2405',
    customerId: 'nimali',
    status: 'packing',
    payment: 'cod',
    day: 'earlier',
    placedAt: '8 Aug, 14:03',
    channel: 'Messenger',
    delivery: DEFAULT_DELIVERY,
    lines: [{ productId: 'bcs-01', size: 'L', qty: 1 }],
  },
  {
    id: '#VD-2403',
    customerId: 'sanduni',
    status: 'shipped',
    payment: 'cod',
    day: 'earlier',
    placedAt: '8 Aug, 12:40',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    courierId: 'koombiya',
    lines: [{ productId: 'msk-11', size: 'S', qty: 1 }],
  },
  {
    id: '#VD-2401',
    customerId: 'ruwan',
    status: 'shipped',
    payment: 'cod',
    day: 'earlier',
    placedAt: '8 Aug, 11:15',
    channel: 'Messenger',
    delivery: DEFAULT_DELIVERY,
    courierId: 'pronto',
    lines: [{ productId: 'hls-04', variantKey: 'colour.mustard', qty: 2 }],
  },
  {
    id: '#VD-2400',
    customerId: 'malith',
    status: 'shipped',
    payment: 'cod',
    day: 'earlier',
    placedAt: '8 Aug, 10:02',
    channel: 'Instagram',
    delivery: DEFAULT_DELIVERY,
    courierId: 'koombiya',
    lines: [
      { productId: 'bcs-01', size: 'L', qty: 1 },
      { productId: 'lns-02', variantKey: 'colour.indigo', qty: 1 },
    ],
  },
  {
    id: '#VD-2399',
    customerId: 'thilini',
    status: 'shipped',
    payment: 'card',
    day: 'earlier',
    placedAt: '8 Aug, 09:30',
    channel: 'Messenger',
    delivery: DEFAULT_DELIVERY,
    courierId: 'pronto',
    lines: [{ productId: 'cdb-07', qty: 2 }],
  },
  {
    id: '#VD-2398',
    customerId: 'kasun',
    status: 'delivered',
    payment: 'cod',
    day: 'earlier',
    placedAt: '7 Aug, 10:10',
    deliveredAt: '8 Aug, 16:05',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    courierId: 'pronto',
    lines: [
      { productId: 'tea-03', qty: 1 },
      { productId: 'hls-04', variantKey: 'colour.teal', qty: 1 },
    ],
  },
  {
    id: '#VD-2397',
    customerId: 'dilani',
    status: 'delivered',
    payment: 'card',
    day: 'earlier',
    placedAt: '7 Aug, 09:00',
    deliveredAt: '8 Aug, 13:20',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    courierId: 'pronto',
    lines: [{ productId: 'lns-02', variantKey: 'colour.natural', qty: 1 }],
  },
  {
    id: '#VD-2396',
    customerId: 'sanduni',
    status: 'delivered',
    payment: 'cod',
    day: 'earlier',
    placedAt: '6 Aug, 16:45',
    deliveredAt: '8 Aug, 10:15',
    channel: 'WhatsApp',
    delivery: DEFAULT_DELIVERY,
    courierId: 'koombiya',
    lines: [
      { productId: 'cdb-07', qty: 1 },
      { productId: 'ble-09', qty: 1 },
    ],
  },
  {
    id: '#VD-2402',
    customerId: 'ruwan',
    status: 'delivered',
    payment: 'card',
    day: 'earlier',
    placedAgo: '6 Aug',
    placedAt: '6 Aug, 15:20',
    deliveredAt: '8 Aug, 11:40',
    channel: 'Messenger',
    delivery: 520,
    courierId: 'pronto',
    lines: [{ productId: 'ble-09', qty: 2 }],
  },
];

/**
 * Resolves each spec against the catalogue. Line titles, item counts and totals
 * are computed here rather than typed alongside them, so an order can never
 * claim a total its own lines do not add up to.
 */
export const orders: Order[] = orderSpecs.map(({ customerId, lines, ...rest }) => {
  const resolved: OrderLine[] = lines.map((line) => {
    const product = findProduct(line.productId);
    if (!product) throw new Error(`${rest.id} references unknown product ${line.productId}`);
    return { ...line, title: product.title, price: product.price };
  });
  const subtotal = resolved.reduce((sum, line) => sum + line.price * line.qty, 0);
  return {
    ...rest,
    customer: customers[customerId],
    lines: resolved,
    itemCount: resolved.reduce((sum, line) => sum + line.qty, 0),
    subtotal,
    total: subtotal + rest.delivery,
  };
});

/** Look an order up by id, with or without the leading `#`. */
export function findOrder(id: string | undefined): Order | undefined {
  if (!id) return undefined;
  const wanted = id.startsWith('#') ? id : `#${id}`;
  return orders.find((o) => o.id === wanted);
}

/** The id the next order created in the builder will carry. */
export function nextOrderId(): string {
  const highest = orders.reduce((max, o) => Math.max(max, Number(o.id.replace(/\D/g, ''))), 0);
  return `#VD-${highest + 1}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Couriers
// ─────────────────────────────────────────────────────────────────────────────

export type Courier = {
  id: string;
  name: string;
  initials: string;
  fee: number | null;
  /** `undefined` where the courier issues no tracking number — self-delivery. */
  trackingPrefix?: string;
  deliveredPct?: number;
  avgDays?: number;
  yourParcels?: number;
  returnFee?: number;
};

export const couriers: Courier[] = [
  {
    id: 'pronto',
    name: 'Pronto Express',
    initials: 'PX',
    fee: 350,
    trackingPrefix: 'PX',
    deliveredPct: 96,
    avgDays: 1.2,
    yourParcels: 41,
    returnFee: 450,
  },
  {
    id: 'koombiya',
    name: 'Koombiya Delivery',
    initials: 'KO',
    fee: 290,
    trackingPrefix: 'KO',
    deliveredPct: 89,
    avgDays: 2.1,
    yourParcels: 27,
    returnFee: 300,
  },
  { id: 'self', name: 'Self / three-wheel', initials: 'SP', fee: null },
];

export function findCourier(id: string | undefined): Courier | undefined {
  return id ? couriers.find((x) => x.id === id) : undefined;
}

/** Bar widths, in points, transcribed from the prototype's barcode. */
const BARCODE = [3, 1, 2, 5, 1, 3, 2, 1, 4, 2, 1, 3, 5, 1, 2, 3, 1, 4, 2, 1, 3, 2, 5, 1, 2, 3, 1, 4];

/**
 * The label for one parcel.
 *
 * Derived from the order and the courier that was actually booked. The waybill
 * used to render a single static object, so choosing Koombiya or self-delivery
 * still printed a Pronto Express label with a Pronto tracking number — a
 * wrong-parcel bug on the one screen whose entire output is physical.
 */
export function waybillFor(order: Order, courier: Courier) {
  return {
    courierName: courier.name.toUpperCase(),
    tracking: courier.trackingPrefix
      ? trackingNumber(courier.trackingPrefix, order.id)
      : null,
    barcode: BARCODE,
  };
}

/** Deterministic, so reopening or reprinting a label shows the same number. */
function trackingNumber(prefix: string, orderId: string): string {
  const digits = orderId.replace(/\D/g, '').padStart(4, '0');
  const check = [...digits].reduce((n, ch) => (n * 7 + Number(ch)) % 10000, 1729);
  return `${prefix} ${digits} ${String(check).padStart(4, '0')} LK`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Derived shop-wide figures
//
// Everything below reads the arrays above. None of it is authored twice.
// ─────────────────────────────────────────────────────────────────────────────

const byStatus = (status: OrderStatus) => orders.filter((o) => o.status === status);
const sum = (list: Order[]) => list.reduce((total, o) => total + o.total, 0);

const isRisky = (o: Order) => o.customer.risk === 'risky' || o.customer.risk === 'high';

/** COD parcels already handed to a courier — money physically out of the shop. */
const codOut = orders.filter((o) => o.payment === 'cod' && o.status === 'shipped');

/** COD money that could still be refused at the door: not yet delivered, risky buyer. */
const codAtRisk = orders.filter(
  (o) => o.payment === 'cod' && o.status !== 'delivered' && isRisky(o),
);

const counts = {
  pending: byStatus('pending').length,
  packing: byStatus('packing').length,
  shipped: byStatus('shipped').length,
  delivered: byStatus('delivered').length,
};

/** The filter chips above the orders list, counted off the list itself. */
export const orderCounts = {
  pending: counts.pending,
  packing: counts.packing,
  shipped: counts.shipped,
};

const cashToCollect = sum(codOut);
const courierFees = codOut.reduce((total, o) => total + o.delivery, 0);

export const home = {
  /** Taken today, whatever its status. */
  revenueToday: sum(orders.filter((o) => o.day !== 'earlier')),
  revenueDelta: '+12%',
  /** Out with couriers, still to be collected from customers. */
  cashToCollect,
  codOrdersOut: codOut.length,
  courierFees,
  /** What actually lands in the shop's hands once the couriers are paid. */
  afterCourier: cashToCollect - courierFees,
  counts,
};

export const shop = {
  name: { en: 'Kandy Kraft', si: 'කැන්ඩි ක්‍රාෆ්ට්', ta: 'கண்டி கிராஃப்ட்' } as LocalizedName,
  initials: 'KK',
  phone: '076 220 9014',
  city: 'Kandy',
  date: { en: 'Sunday, 9 Aug', si: 'ඉරිදා, අගෝස්තු 9', ta: 'ஞாயிறு, ஆக 9' } as LocalizedName,
  /**
   * The plan is an id, not a display name. It used to be the raw string
   * "Growth plan", which the Sinhala account screen rendered verbatim in the
   * middle of a Sinhala sentence; `more.ts` maps this onto a translated name.
   */
  planId: 'growth',
  planRenews: '2 Sep',
  customerCount: customerList.length,
  riskyCustomers: riskyCustomers.length,
};

/** Money exposed to a refusal. Deliberately *not* the same figure as cash to collect. */
export const moneyAtRisk = { amount: sum(codAtRisk), orders: codAtRisk.length };

export const analytics = {
  month: 'Aug',
  revenue: 1284600,
  revenueDelta: '+18%',
  /** Daily bars as percentages of the tallest, 1–10 Aug. */
  bars: [38, 52, 44, 66, 58, 79, 71, 88, 64, 100],
  /** Indices drawn in the accent colour rather than the track colour. */
  barsHighlighted: [7, 9],
  avgOrder: Math.round(sum(orders) / orders.length),
  avgOrderDelta: 310,
  repeatPct: 37,
  repeatDelta: 4,
  lostToCod: 6300,
  lostDelta: '−41%',
  returns: 14,
  lossBars: [100, 84, 70, 59, 41],
  bestSellers: [...sellableProducts]
    .sort((a, b) => (b.revenue30 ?? 0) - (a.revenue30 ?? 0))
    .slice(0, 3)
    .map((product, i) => ({
      rank: String(i + 1).padStart(2, '0'),
      title: product.title,
      revenue: product.revenue30 ?? 0,
    })),
};
