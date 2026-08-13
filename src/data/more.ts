import type { TranslationKey } from '@/i18n';
import type { RiskLevel } from '@/theme/tokens';

import {
  customerList,
  customers,
  findOrder,
  home,
  moneyAtRisk,
  productsMeta,
  riskyCustomers,
  shop,
  type Customer,
  type Order,
} from './mock';

/**
 * Data for the destinations behind the More tab.
 *
 * The mobile handoff never drew these screens — it links to them and stops. The
 * shape here follows the sibling `orderflow/` web prototype, which does cover
 * the same product surface, so the content is the product's rather than
 * invented. Same as `mock.ts`: this is the seam to replace with the API.
 */

// ── COD Reliability ─────────────────────────────────────────────────────────

const codHistory = customerList.reduce(
  (acc, cust) => ({
    refused: acc.refused + (cust.refused ?? 0),
    recorded: acc.recorded + (cust.refused ?? 0) + (cust.accepted ?? 0),
  }),
  { refused: 0, recorded: 0 },
);

const TIER_ORDER: RiskLevel[] = ['excellent', 'good', 'average', 'risky', 'high'];

/**
 * All of this derives from the customer roster in `mock.ts`.
 *
 * These figures used to be authored by hand alongside a `needsReview` list that
 * was authored separately, so Account claimed six risky customers, Insights
 * claimed four, and the tier breakdown one tap away claimed twenty-six. On a
 * product whose entire proposition is "trust this number", three answers to the
 * same question is the worst possible bug.
 */
export const reliability = {
  customersTracked: customerList.length,
  codOrdersRecorded: codHistory.recorded,
  /** Share of COD parcels refused at the door, across the whole shop. */
  cancellationRate:
    codHistory.recorded === 0
      ? 0
      : Math.round((codHistory.refused / codHistory.recorded) * 1000) / 10,
  /** Money that could still be refused — not the same thing as cash to collect. */
  moneyAtRisk: moneyAtRisk.amount,
  atRiskOrders: moneyAtRisk.orders,
  /** Cash already out with couriers, whoever placed it. */
  cashToCollect: home.cashToCollect,
  /** Distribution across the ramp, worst last. Sums to `customersTracked`. */
  tiers: TIER_ORDER.map((level) => ({
    level,
    count: customerList.filter((cust) => cust.risk === level).length,
  })),
  /** Risky and High risk, worst first — the working list on this screen. */
  needsReview: riskyCustomers,
  overrides: [{ customer: customers.kasun, level: 'good' as RiskLevel, setOn: '2 Aug' }],
};

// ── Payments & invoices ─────────────────────────────────────────────────────

export type TxStatus = 'collected' | 'pending' | 'refunded';
export type PayMethod = 'cod' | 'bank' | 'payhere';

export type Transaction = {
  id: string;
  orderId: string;
  customer: Customer;
  amount: number;
  method: PayMethod;
  status: TxStatus;
  when: string;
};

/**
 * Transactions and invoices name an order and take its amount from it, rather
 * than restating a figure that can fall out of step with the order it bills.
 */
function forOrder(id: string): Order {
  const order = findOrder(id);
  if (!order) throw new Error(`payments references unknown order ${id}`);
  return order;
}

const transactionSpecs: { id: string; orderId: string; method: PayMethod; status: TxStatus; when: string }[] = [
  { id: 'TX-8841', orderId: '#VD-2417', method: 'payhere', status: 'pending', when: '12 min ago' },
  { id: 'TX-8840', orderId: '#VD-2416', method: 'cod', status: 'pending', when: '40 min ago' },
  { id: 'TX-8838', orderId: '#VD-2398', method: 'cod', status: 'collected', when: '8 Aug' },
  { id: 'TX-8836', orderId: '#VD-2396', method: 'cod', status: 'collected', when: '8 Aug' },
  { id: 'TX-8829', orderId: '#VD-2397', method: 'bank', status: 'refunded', when: '7 Aug' },
  { id: 'TX-8824', orderId: '#VD-2402', method: 'bank', status: 'collected', when: '6 Aug' },
];

const transactions: Transaction[] = transactionSpecs.map((spec) => {
  const order = forOrder(spec.orderId);
  return { ...spec, customer: order.customer, amount: order.total };
});

const collected = transactions.filter((tx) => tx.status === 'collected');

const byMethodAmounts = (['cod', 'bank', 'payhere'] as PayMethod[]).map((method) => ({
  method,
  amount: collected
    .filter((tx) => tx.method === method)
    .reduce((total, tx) => total + tx.amount, 0),
}));
const collectedTotal = byMethodAmounts.reduce((total, entry) => total + entry.amount, 0);

export const payments = {
  totalCollected: collectedTotal,
  /** The same money the Today screen calls "cash to collect". */
  pendingCod: home.cashToCollect,
  refundsOwed: transactions
    .filter((tx) => tx.status === 'refunded')
    .reduce((total, tx) => total + tx.amount, 0),
  byMethod: byMethodAmounts.map((entry) => ({
    ...entry,
    share: collectedTotal === 0 ? 0 : Math.round((entry.amount / collectedTotal) * 100),
  })),
  transactions,
  invoices: [
    { id: 'INV-0231', orderId: '#VD-2417', amount: forOrder('#VD-2417').total, issued: '9 Aug', paid: false },
    { id: 'INV-0230', orderId: '#VD-2416', amount: forOrder('#VD-2416').total, issued: '9 Aug', paid: false },
    { id: 'INV-0229', orderId: '#VD-2398', amount: forOrder('#VD-2398').total, issued: '8 Aug', paid: true },
  ],
};

// ── Couriers ────────────────────────────────────────────────────────────────

export type CourierPerformance = {
  id: string;
  name: string;
  initials: string;
  connected: boolean;
  fee: number | null;
  deliveredPct: number;
  avgDays: number;
  parcels: number;
  returns: number;
  returnFee: number | null;
  /** Regions the courier will pick up from. */
  coverage: string;
};

export const courierPerformance: CourierPerformance[] = [
  {
    id: 'pronto',
    name: 'Pronto Express',
    initials: 'PX',
    connected: true,
    fee: 350,
    deliveredPct: 96,
    avgDays: 1.2,
    parcels: 41,
    returns: 2,
    returnFee: 450,
    coverage: 'Island-wide',
  },
  {
    id: 'koombiya',
    name: 'Koombiya Delivery',
    initials: 'KO',
    connected: true,
    fee: 290,
    deliveredPct: 89,
    avgDays: 2.1,
    parcels: 27,
    returns: 5,
    returnFee: 300,
    coverage: 'Western + Central',
  },
  {
    id: 'self',
    name: 'Self / three-wheel',
    initials: 'SP',
    connected: true,
    fee: null,
    deliveredPct: 100,
    avgDays: 0.5,
    parcels: 12,
    returns: 0,
    returnFee: null,
    coverage: 'Kandy only',
  },
];

/** Couriers the shop has not linked yet — the add-a-courier list. */
export const availableCouriers = [
  { id: 'domex', name: 'Domex', initials: 'DX' },
  { id: 'aramex', name: 'Aramex LK', initials: 'AX' },
];

// ── Free website ────────────────────────────────────────────────────────────

export const website = {
  live: true,
  domain: 'kandykraft.vendly.lk',
  storeName: 'Kandy Kraft',
  tagline: 'Handloom and batik, made in Kandy',
  /** A product hidden from its own page drops off the site — hence derived. */
  productsLive: productsMeta.all,
  productsTotal: productsMeta.total,
  /** Last 30 days. */
  visits: 1820,
  ordersFromSite: 37,
  customDomainPlan: 'Business',
};

// ── Help centre ─────────────────────────────────────────────────────────────

export type HelpTopic = {
  id: string;
  categoryKey: TranslationKey;
  questionKey: TranslationKey;
  answerKey: TranslationKey;
};

/** Where "Still stuck?" actually goes. */
export const support = { phone: '077 000 8080' };

export const helpTopics: HelpTopic[] = [
  {
    id: 'orders-link',
    categoryKey: 'help.cat.start',
    questionKey: 'help.q.link',
    answerKey: 'help.a.link',
  },
  {
    id: 'chat-normal',
    categoryKey: 'help.cat.start',
    questionKey: 'help.q.chat',
    answerKey: 'help.a.chat',
  },
  {
    id: 'edit-order',
    categoryKey: 'help.cat.orders',
    questionKey: 'help.q.edit',
    answerKey: 'help.a.edit',
  },
  {
    id: 'score-calc',
    categoryKey: 'help.cat.cod',
    questionKey: 'help.q.score',
    answerKey: 'help.a.score',
  },
  {
    id: 'score-override',
    categoryKey: 'help.cat.cod',
    questionKey: 'help.q.override',
    answerKey: 'help.a.override',
  },
  {
    id: 'score-shared',
    categoryKey: 'help.cat.cod',
    questionKey: 'help.q.shared',
    answerKey: 'help.a.shared',
  },
  {
    id: 'change-plan',
    categoryKey: 'help.cat.billing',
    questionKey: 'help.q.plan',
    answerKey: 'help.a.plan',
  },
];

// ── Notification settings ───────────────────────────────────────────────────

export type NotificationPref = {
  id: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  on: boolean;
};

export const notificationPrefs: NotificationPref[] = [
  { id: 'new-order', labelKey: 'nset.newOrder', descKey: 'nset.pushEmail', on: true },
  { id: 'cancelled', labelKey: 'nset.cancelled', descKey: 'nset.pushEmail', on: true },
  { id: 'low-stock', labelKey: 'nset.lowStock', descKey: 'nset.pushOnly', on: true },
  { id: 'risky', labelKey: 'nset.risky', descKey: 'nset.pushEmail', on: true },
  { id: 'refused', labelKey: 'nset.refused', descKey: 'nset.pushEmail', on: true },
  { id: 'weekly', labelKey: 'nset.weekly', descKey: 'nset.mondays', on: false },
];

// ── Subscription ────────────────────────────────────────────────────────────

export type Plan = {
  id: string;
  nameKey: TranslationKey;
  price: number;
  featureKeys: TranslationKey[];
};

export const plans: Plan[] = [
  {
    id: 'starter',
    nameKey: 'plan.starter',
    price: 1900,
    featureKeys: ['plan.f.orders', 'plan.f.products', 'plan.f.website'],
  },
  {
    id: 'growth',
    nameKey: 'plan.growth',
    price: 3900,
    featureKeys: ['plan.f.orders', 'plan.f.alerts', 'plan.f.staff', 'plan.f.rates'],
  },
  {
    id: 'business',
    nameKey: 'plan.business',
    price: 7900,
    featureKeys: ['plan.f.orders', 'plan.f.alerts', 'plan.f.domain', 'plan.f.api'],
  },
];

/** The shop's plan, resolved once so the name and price are never restated. */
export const currentPlan = plans.find((p) => p.id === shop.planId) ?? plans[1];

export const subscription = {
  currentPlanId: currentPlan.id,
  renews: shop.planRenews,
  card: 'Visa ending 4471',
  billing: (['Aug 2026', 'Jul 2026', 'Jun 2026'] as const).map((period) => ({
    id: period.replace(' ', '-'),
    period,
    amount: currentPlan.price,
    paid: true,
  })),
};
