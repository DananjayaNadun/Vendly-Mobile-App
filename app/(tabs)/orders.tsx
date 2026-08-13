import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BottomBar, LargeHeader, TopChrome, useScrollShadow } from '@/components/AppBar';
import { CustomerRow, useRiskLabels } from '@/components/CustomerRow';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import {
  Button,
  Card,
  EmptyState,
  Eyebrow,
  FilterChips,
  IconButton,
  Money,
  Pill,
  SearchField,
  Segmented,
  Skeleton,
  Tap,
} from '@/components/ui';
import {
  customerList,
  name,
  orderCounts,
  orders as allOrders,
  riskOrder,
  shop,
  type Order,
  type OrderStatus,
} from '@/data/mock';
import { Icon } from '@/icons';
import { shareOnWhatsApp } from '@/lib/links';
import { useI18n, type TranslationKey } from '@/i18n';
import { website } from '@/data/more';
import { useHideTabBar } from '@/state/TabChrome';
import { Rise } from '@/theme/motion';
import { radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Orders — and, behind a segment, Customers.
 *
 * Customers used to be its own route reached from the More drawer, which put
 * two taps and an unrelated menu between an order and the person who placed it.
 * They are the same subject seen from two sides — the demand on the shop — so
 * they share a screen and a search field here.
 */
type ListView = 'orders' | 'customers';
/** Delivered orders are reachable through All rather than a chip of their own. */
type ChipStatus = Exclude<OrderStatus, 'delivered'>;
type Filter = ChipStatus | 'all';

const FILTERS: { key: Filter; labelKey: TranslationKey }[] = [
  { key: 'pending', labelKey: 'status.pending' },
  { key: 'packing', labelKey: 'status.packing' },
  { key: 'shipped', labelKey: 'status.shipped' },
  { key: 'all', labelKey: 'status.all' },
];

export default function OrdersScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const params = useLocalSearchParams<{
    empty?: string;
    view?: string;
    filter?: string;
    search?: string;
  }>();
  const shadow = useScrollShadow();

  const [view, setView] = useState<ListView>(params.view === 'customers' ? 'customers' : 'orders');
  const [filter, setFilter] = useState<Filter>(
    FILTERS.some((f) => f.key === params.filter) ? (params.filter as Filter) : 'pending',
  );
  const [sort, setSort] = useState('recent');
  const [searching, setSearching] = useState(!!params.search);
  const [query, setQuery] = useState('');
  /** Bulk mode, entered from "Select". Empty array means nothing picked yet. */
  const [picked, setPicked] = useState<string[] | null>(null);
  const [toast, setToast] = useState<{ title: string; body?: string } | null>(null);

  // Bulk selection replaces the header, so it takes the tab bar and the raised
  // Add button too: switching tabs mid-selection used to discard it silently.
  useHideTabBar(picked !== null);

  const raise = useCallback((title: string, body?: string) => setToast({ title, body }), []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  // This screen loads into a skeleton, never a spinner. Swapping the mock
  // module for a real fetch keeps this shape.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  // `?empty=1` previews the first-run state; in a live app the same branch
  // fires the moment the shop has no orders.
  const source = params.empty ? [] : allOrders;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Searching looks across every status — a seller hunting one order does
    // not know or care which tab it is filed under.
    const base = q || filter === 'all' ? source : source.filter((o) => o.status === filter);
    if (!q) return base;
    return base.filter(
      (o) =>
        name(o.customer.name, locale).toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.customer.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')),
    );
  }, [filter, source, query, locale]);

  const visibleCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? customerList.filter(
          (cust) =>
            name(cust.name, locale).toLowerCase().includes(q) ||
            cust.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')),
        )
      : [...customerList];

    if (sort === 'spend') return matched.sort((a, b) => (b.totalSpent ?? 0) - (a.totalSpent ?? 0));
    if (sort === 'risk') return matched.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);
    return matched;
  }, [query, sort, locale]);

  // Counted off the same array the list filters. These used to be authored in
  // the mock module as shop-wide totals, so tapping "Packing · 5" produced an
  // empty scroll area with no rows and no explanation.
  const counts = source.length === 0 ? { pending: 0, packing: 0, shipped: 0 } : orderCounts;
  const showingCustomers = view === 'customers';
  const filterLabel = t(FILTERS.find((f) => f.key === filter)?.labelKey ?? 'status.all');

  const togglePick = (id: string) =>
    setPicked((prev) =>
      prev === null ? [id] : prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const segment = (
    <Segmented
      value={view}
      onChange={(key) => {
        setView(key as ListView);
        setPicked(null);
      }}
      options={[
        { key: 'orders', label: t('orders.viewOrders') },
        { key: 'customers', label: t('orders.viewCustomers') },
      ]}
    />
  );

  const header = (
    <TopChrome separated={shadow.separated}>
      {searching ? (
        <View
          style={{
            paddingTop: space.s2,
            paddingHorizontal: space.gutter,
            paddingBottom: space.s3,
            gap: space.s3,
          }}
        >
          <SearchField
            autoFocus
            value={query}
            onChange={setQuery}
            placeholder={showingCustomers ? t('search.customers') : t('search.orders')}
            cancelLabel={t('search.cancel')}
            onCancel={() => {
              setSearching(false);
              setQuery('');
            }}
          />
          {segment}
        </View>
      ) : picked !== null ? (
        <BulkBar count={picked.length} onDone={() => setPicked(null)} />
      ) : (
        <LargeHeader
          title={showingCustomers ? t('customers.title') : t('orders.title')}
          subtitle={
            showingCustomers ? t('customers.count', { count: shop.customerCount }) : undefined
          }
          // The filter chips below already *are* the filter control, and the
          // icon that used to sit here opened nothing while wearing an "active
          // filter" dot that was on unconditionally. "Add customer" went the
          // same way: there is no create-customer screen for it to open.
          actions={
            <IconButton
              name="search"
              filled
              label={showingCustomers ? t('search.customers') : t('search.orders')}
              onPress={() => setSearching(true)}
            />
          }
          below={
            <View style={{ gap: space.s3 }}>
              {segment}
              {showingCustomers ? (
                <FilterChips
                  value={sort}
                  onChange={setSort}
                  options={[
                    { key: 'recent', label: t('customers.sortRecent') },
                    { key: 'spend', label: t('customers.sortSpend') },
                    { key: 'risk', label: t('customers.sortRisk') },
                  ]}
                />
              ) : loading ? (
                <View style={{ flexDirection: 'row', gap: space.s2 }}>
                  <Skeleton width={104} height={36} radius={radius.pill} tone={2} />
                  <Skeleton width={92} height={36} radius={radius.pill} tone={2} />
                  <Skeleton width={96} height={36} radius={radius.pill} tone={2} />
                </View>
              ) : (
                <FilterChips
                  value={filter}
                  onChange={(key) => setFilter(key as Filter)}
                  options={FILTERS.map(({ key, labelKey }) => ({
                    key,
                    label: t(labelKey),
                    count: key === 'all' ? undefined : counts[key],
                  }))}
                />
              )}
            </View>
          }
        />
      )}
    </TopChrome>
  );

  // ── Customers ─────────────────────────────────────────────────────────────
  if (showingCustomers) {
    return (
      <View style={{ flex: 1, backgroundColor: c.canvas }}>
        {header}
        <ScrollView
          {...shadow}
          contentContainerStyle={{
            paddingTop: space.s4,
            paddingHorizontal: space.gutter,
            paddingBottom: space.s7,
            gap: space.s2,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {visibleCustomers.length === 0 ? (
            <EmptyState
              icon="person"
              title={t('search.none', { query: query.trim() })}
              action={t('search.cancel')}
              onAction={() => setQuery('')}
            />
          ) : (
            visibleCustomers.map((cust, i) => (
              <CustomerRow key={cust.id} customer={cust} index={i} />
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.canvas }}>
        {header}
        <OrdersSkeleton />
      </View>
    );
  }

  if (source.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: c.canvas }}>
        <TopChrome>
          <LargeHeader title={t('orders.title')} below={segment} />
        </TopChrome>
        <FirstRunEmpty
          onCopyLink={() =>
            shareOnWhatsApp(
              t('web.shareMessage', {
                shop: name(shop.name, locale),
                url: `https://${website.domain}`,
              }),
            )
          }
        />
      </View>
    );
  }

  const today = visible.filter((o) => o.day !== 'earlier');
  const earlier = visible.filter((o) => o.day === 'earlier');

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      {header}

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s4,
          paddingHorizontal: space.gutter,
          paddingBottom: picked !== null ? space.s4 : space.s7,
          gap: space.s2,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Any empty result gets a state, not just an empty search. This branch
            used to be gated on there being a query, so a status filter that
            matched nothing rendered a blank scroll area — no rows, no message. */}
        {visible.length === 0 ? (
          query.trim() ? (
            <EmptyState
              icon="list"
              title={t('search.none', { query: query.trim() })}
              action={t('search.cancel')}
              onAction={() => setQuery('')}
            />
          ) : (
            <EmptyState
              icon="list"
              title={t('orders.noneIn', { status: filterLabel })}
              body={t('orders.noneInBody')}
              action={t('orders.showAll')}
              onAction={() => setFilter('all')}
            />
          )
        ) : null}

        {today.length > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: space.s1,
              paddingBottom: space.s1,
            }}
          >
            <Eyebrow>{t('orders.todayDate')}</Eyebrow>
            {picked === null ? (
              <Tap onPress={() => setPicked([])} feedback="opacity" hitSlop={8}>
                <Txt variant="caption" weight={600} color={c.accent}>
                  {t('common.select')}
                </Txt>
              </Tap>
            ) : null}
          </View>
        ) : null}

        {today.map((o, i) => (
          <OrderCard
            key={o.id}
            order={o}
            index={i}
            selectable={picked !== null}
            selected={picked?.includes(o.id)}
            onToggle={() => togglePick(o.id)}
          />
        ))}

        {earlier.length > 0 ? (
          <>
            <Eyebrow style={{ paddingTop: space.s3, paddingHorizontal: space.s1 }}>
              {t('common.earlier')}
            </Eyebrow>
            {earlier.map((o, i) => (
              <OrderCard
                key={o.id}
                order={o}
                index={today.length + i}
                dimmed
                selectable={picked !== null}
                selected={picked?.includes(o.id)}
                onToggle={() => togglePick(o.id)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>

      {/* Bulk actions land at the bottom, in thumb reach. Through `BottomBar`
          rather than a bare view, so they clear the Android gesture bar — this
          app runs edge-to-edge and the flat padding here did not. */}
      {picked !== null && picked.length > 0 ? (
        <BottomBar>
          <View style={{ flexDirection: 'row', gap: space.s3 }}>
            <Button
              label={t('select.print')}
              variant="secondary"
              flex={1}
              icon="printer"
              onPress={() => {
                raise(
                  t('select.printed', { count: picked.length }),
                  t('select.printedSub'),
                );
                setPicked(null);
              }}
            />
            <Button
              label={t('select.book')}
              flex={1}
              icon="truck"
              onPress={() => {
                raise(t('select.booked', { count: picked.length }), t('select.bookedSub'));
                setPicked(null);
              }}
            />
          </View>
        </BottomBar>
      ) : null}

      <Toast
        visible={!!toast}
        title={toast?.title ?? ''}
        body={toast?.body}
        bottom={picked !== null ? 24 : 104}
      />
    </View>
  );
}

/**
 * One order in the list.
 *
 * The reliability rating drives the card's leading edge as well as its pill, so
 * a screen of orders can be triaged by colour down the left margin before any
 * of it is read.
 */
function OrderCard({
  order,
  index,
  dimmed,
  selectable,
  selected,
  onToggle,
}: {
  order: Order;
  index: number;
  dimmed?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const labels = useRiskLabels();
  const tone = c.risk[order.customer.risk];
  const isCod = order.payment === 'cod';

  return (
    <Rise index={index}>
      <Tap
        onPress={() =>
          selectable
            ? onToggle?.()
            : router.push({ pathname: '/order/[id]', params: { id: order.id.replace('#', '') } })
        }
        accessibilityRole="button"
        accessibilityState={selectable ? { checked: !!selected } : undefined}
        accessibilityLabel={`${name(order.customer.name, locale)} ${order.id}`}
      >
        <Card
          edge={isCod ? tone : undefined}
          bordered={selected}
          style={{
            padding: space.s4,
            paddingLeft: isCod ? space.s4 + space.s1 : space.s4,
            gap: space.s3,
            opacity: dimmed ? 0.7 : 1,
            ...(selected ? { borderWidth: 2, borderColor: c.accent } : null),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.s3 }}>
            {selectable ? (
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: radius.pill,
                  marginTop: 2,
                  borderWidth: selected ? 0 : 1.5,
                  borderColor: c.handle,
                  backgroundColor: selected ? c.accent : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected ? <Icon name="check" size={13} color={c.onAccent} strokeWidth={2.4} /> : null}
              </View>
            ) : null}

            <View style={{ flex: 1, gap: 3 }}>
              <Txt variant="subheading" numberOfLines={1}>
                {name(order.customer.name, locale)}
              </Txt>
              <Txt variant="caption" mono color={c.muted}>
                {order.id} · {order.customer.phone}
              </Txt>
            </View>

            <View style={{ alignItems: 'flex-end', gap: 3 }}>
              <Money amount={order.total} variant="subheading" />
              {dimmed ? null : (
                <Txt variant="caption" color={c.muted}>
                  {order.itemCount} {order.itemCount === 1 ? t('common.item') : t('common.items')}
                </Txt>
              )}
            </View>
          </View>

          {dimmed ? null : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2, flexWrap: 'wrap' }}>
              <Pill label={t(`status.${order.status}` as 'status.pending')} tone={c.neutral} />
              <Pill
                label={isCod ? t('pay.cod') : t('pay.paidCard')}
                tone={isCod ? c.neutral : c.positive}
              />
              {isCod ? (
                <Pill label={labels[order.customer.risk]} tone={tone} dot bordered />
              ) : null}
            </View>
          )}
        </Card>
      </Tap>
    </Rise>
  );
}

/** Replaces the large header while bulk selection is active. */
function BulkBar({ count, onDone }: { count: number; onDone: () => void }) {
  const { c } = useTheme();
  const { t } = useI18n();
  return (
    <View
      style={{
        minHeight: size.appBar,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: space.gutter,
        paddingVertical: space.s2,
      }}
    >
      <Txt flex={1} variant="heading">
        {t('select.count', { count })}
      </Txt>
      <Tap onPress={onDone} feedback="opacity" hitSlop={10}>
        <Txt variant="label" weight={600} color={c.accent}>
          {t('select.done')}
        </Txt>
      </Tap>
    </View>
  );
}

/** Skeleton, never a spinner — cards fade out down the list. */
function OrdersSkeleton() {
  return (
    <View style={{ flex: 1, paddingTop: space.s4, paddingHorizontal: space.gutter, gap: space.s2 }}>
      <Skeleton width={120} height={12} style={{ marginHorizontal: space.s1, marginBottom: space.s1 }} />
      {[1, 0.8, 0.55, 0.3].map((opacity, i) => (
        <Card key={i} style={{ padding: space.s4, gap: space.s3, opacity }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton width={[150, 132, 118, 140][i]} height={16} tone={1} />
            <Skeleton width={76} height={16} tone={1} />
          </View>
          <Skeleton width={[120, 140, 126, 100][i]} height={12} tone={2} />
          {i < 2 ? (
            <View style={{ flexDirection: 'row', gap: space.s2 }}>
              <Skeleton width={68} height={24} radius={radius.pill} tone={2} />
              <Skeleton width={i === 0 ? 52 : 76} height={24} radius={radius.pill} tone={2} />
            </View>
          ) : null}
        </Card>
      ))}
    </View>
  );
}

/** First-run empty state. */
function FirstRunEmpty({ onCopyLink }: { onCopyLink: () => void }) {
  const { t } = useI18n();
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.s5 }}>
      <EmptyState icon="list" title={t('orders.empty.title')} body={t('orders.empty.body')} />
      <View style={{ gap: space.s3, paddingHorizontal: space.s5 }}>
        <Button label={t('orders.empty.copyLink')} onPress={onCopyLink} />
        <Button
          label={t('orders.empty.manual')}
          variant="secondary"
          onPress={() => router.push('/new-order/step1')}
        />
      </View>
    </View>
  );
}
