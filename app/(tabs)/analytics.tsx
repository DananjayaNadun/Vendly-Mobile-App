import React, { useEffect, useMemo, useState } from 'react';
import { Animated, ScrollView, View } from 'react-native';

import { ShopCard, StatTile } from '@/components/brand/ShopKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { TrendChart, TrendReadout } from '@/components/brand/TrendChart';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import {
  PERIOD_KEYS,
  SOURCE_CHIP,
  analyticsFor,
  shop,
  type AnalyticsView,
  type PeriodKey,
} from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { shareOnWhatsApp } from '@/lib/links';
import { useI18n, type TranslationKey } from '@/i18n';
import { brand, brandChip, brandRadius } from '@/theme/brand';
import { Rise, useAnimatedNumber, useGrow } from '@/theme/motion';

/** Static, so rendering the picker does not recompute three whole periods. */
const PERIOD_LABEL: Record<PeriodKey, TranslationKey> = {
  week: 'shop.period7',
  month: 'shop.period30',
  quarter: 'shop.period90',
};

/** Inset of a segmented control's thumb from its track. */
const TRACK_PAD = 3;

/**
 * 15 · Analytics.
 *
 * Reworked around the questions a seller actually opens this screen to answer:
 * how much did I make, is that better than last time, what is selling, and
 * where are the orders coming from.
 *
 * What changed, and why:
 *
 * - **A period selector replaces the search field.** That field was bound to
 *   state and filtered nothing — there is nothing on a report to search. Every
 *   figure here was also undated, which makes "LKR 80,000" unreadable; the
 *   period now drives the whole screen.
 * - **Every tile carries its change** against the preceding span. A number with
 *   no comparison cannot be acted on.
 * - **The chart is interactive** and can switch metric. It led with Revenue in
 *   the tiles and then plotted Orders, and printed every value on the line at
 *   once. See `TrendChart` for the rest.
 * - **Two blocks added**: where orders come from, and what is selling. Channel
 *   mix is the closest thing this product has to a marketing report, and both
 *   come from data the app already holds.
 *
 * Motion carries the recalculation. Switching period re-runs every figure, and
 * the tiles count from the old value to the new one rather than blinking — the
 * direction of that movement *is* the comparison the deltas are spelling out.
 */
export default function AnalyticsScreen() {
  const { t } = useI18n();
  const [period, setPeriod] = useState<PeriodKey>('week');
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');
  const [selected, setSelected] = useState<number | null>(null);
  const [toast, setToast] = useState(false);

  const view = useMemo(() => analyticsFor(period), [period]);
  // Labels are resolved here so the chart never touches the catalogue.
  const chartPoints = useMemo(
    () => view.points.map((p) => ({ ...p, label: t(p.labelKey) })),
    [view, t],
  );

  // The newest bucket is the useful default, and the selection has to follow the
  // period — index 6 is meaningless once the series is three months long.
  const index = Math.min(selected ?? view.points.length - 1, view.points.length - 1);
  const point = view.points[index];

  useEffect(() => setSelected(null), [period]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const money = (n: number) => `LKR ${n.toLocaleString('en-US')}`;
  const periodName = t(view.labelKey);

  const share = () => {
    shareOnWhatsApp(
      t('shop.reportMessage', {
        shop: shop.name,
        revenue: view.revenue.toLocaleString('en-US'),
        orders: view.orders,
        average: view.averageOrder.toLocaleString('en-US'),
        profit: view.netProfit.toLocaleString('en-US'),
      }),
    );
    setToast(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopNav
        large
        title={t('tab.analytics')}
        actions={[
          { key: 'share', icon: 'share', label: t('shop.shareReport'), onPress: share },
        ]}
        below={
          // The period selector replaces the design's search field, which had
          // nothing to search.
          <View style={{ paddingHorizontal: 20 }}>
            <PeriodPicker period={period} onChange={setPeriod} />
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}>
        {/* ── Headline figures ────────────────────────────────────────── */}
        <Rise style={{ flexDirection: 'row', gap: 14 }}>
          <StatTile
            iconFirst
            countUp
            label={t('shop.revenue')}
            value={money(view.revenue)}
            delta={signed(view.revenueDelta)}
            deltaDirection={direction(view.revenueDelta)}
            icon="bag"
            valueSize={20}
            valueColor="#413F3F"
          />
          <StatTile
            iconFirst
            countUp
            label={t('shop.totalOrders')}
            value={String(view.orders)}
            delta={signed(view.ordersDelta)}
            deltaDirection={direction(view.ordersDelta)}
            icon="orders"
            valueSize={26}
            valueColor="#413F3F"
          />
        </Rise>
        <Rise index={1} style={{ flexDirection: 'row', gap: 14 }}>
          <StatTile
            iconFirst
            countUp
            label={t('shop.averageOrder')}
            value={money(view.averageOrder)}
            icon="tag"
            valueSize={20}
            valueColor="#413F3F"
          />
          <StatTile
            iconFirst
            countUp
            label={t('shop.netProfit')}
            value={money(view.netProfit)}
            icon="trend"
            valueSize={20}
            valueColor="#413F3F"
          />
        </Rise>
        <Rise index={2}>
          <Txt size={11.5} color={brand.muted} style={{ marginTop: -6, paddingHorizontal: 4 }}>
            {t('shop.vsPrevious', { period: periodName })}
          </Txt>
        </Rise>

        {/* ── Trend ───────────────────────────────────────────────────── */}
        <Rise index={3}>
          <ShopCard padding={18}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <TrendReadout
                  label={t(view.bucketKey)}
                  value={metric === 'revenue' ? money(point.revenue) : String(point.orders)}
                  caption={`${t(point.labelKey)} · ${t('shop.tapPoint')}`}
                />
              </View>
              <MetricToggle metric={metric} onChange={setMetric} />
            </View>

            <View style={{ height: 14 }} />
            <TrendChart
              points={chartPoints}
              metric={metric}
              selected={index}
              onSelect={setSelected}
            />
          </ShopCard>
        </Rise>

        {/* ── Where orders come from ──────────────────────────────────── */}
        <Rise index={4}>
          <ChannelMix channels={view.channels} orders={view.orders} period={period} />
        </Rise>

        {/* ── What is selling ─────────────────────────────────────────── */}
        <Rise index={5}>
          <TopProducts top={view.top} period={period} />
        </Rise>
      </ScrollView>

      <Toast visible={toast} title={t('shop.reportShared')} bottom={90} />
    </View>
  );
}

/** `-4` → `4%`. The direction rides alongside as a drawn arrow, not a glyph. */
function signed(pct: number): string {
  return `${Math.abs(pct)}%`;
}

/** No arrow at all on a flat period — an arrow that points nowhere is noise. */
function direction(pct: number): 'up' | 'down' | undefined {
  if (pct === 0) return undefined;
  return pct > 0 ? 'up' : 'down';
}

// ─────────────────────────────────────────────────────────────────────────────
// Period
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The three spans, as a segmented control with a thumb that slides.
 *
 * The label is drawn twice — once in the resting colour, once in white on top —
 * and the white copy fades in as the thumb reaches it. Flipping the colour on
 * the press instead would put white text on the white track for the length of
 * the slide, which is a control that briefly erases its own label.
 *
 * The thumb is sized and placed in percentages rather than measured pixels.
 * Three equal pills do not need measuring, and a control whose selection marker
 * only appears once an `onLayout` has been delivered has no marker at all on
 * its first frame — or for as long as the platform defers that callback.
 */
function PeriodPicker({
  period,
  onChange,
}: {
  period: PeriodKey;
  onChange: (next: PeriodKey) => void;
}) {
  const { t } = useI18n();
  const count = PERIOD_KEYS.length;
  const slide = useAnimatedNumber(PERIOD_KEYS.indexOf(period));

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: brand.surface,
        borderWidth: 1,
        borderColor: '#E3E7EC',
        borderRadius: brandRadius.pill,
        padding: TRACK_PAD,
      }}
    >
      {/* Inset to the track's padding, so the thumb's percentages resolve
          against the pills' own width rather than the track's. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: TRACK_PAD,
          left: TRACK_PAD,
          right: TRACK_PAD,
          bottom: TRACK_PAD,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: `${100 / count}%`,
            left: slide.interpolate({
              inputRange: [0, count - 1],
              outputRange: ['0%', `${(100 * (count - 1)) / count}%`],
            }),
            borderRadius: brandRadius.pill,
            backgroundColor: brand.primary,
          }}
        />
      </View>

      {PERIOD_KEYS.map((key, i) => {
        const active = key === period;
        const label = t(PERIOD_LABEL[key]);
        return (
          <Tap
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="radio"
            aria-checked={active}
            accessibilityLabel={label}
            feedback="opacity"
            style={{
              flex: 1,
              minHeight: 34,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 6,
            }}
          >
            <Txt size={13} weight={600} align="center" color={brand.body}>
              {label}
            </Txt>
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                opacity: slide.interpolate({
                  inputRange: [i - 1, i, i + 1],
                  outputRange: [0, 1, 0],
                  extrapolate: 'clamp',
                }),
              }}
            >
              <Txt size={13} weight={600} align="center" color={brand.onPrimary}>
                {label}
              </Txt>
            </Animated.View>
          </Tap>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Metric
// ─────────────────────────────────────────────────────────────────────────────

const METRICS: { key: 'revenue' | 'orders'; icon: 'bag' | 'orders'; label: TranslationKey }[] = [
  { key: 'revenue', icon: 'bag', label: 'shop.metricRevenue' },
  { key: 'orders', icon: 'orders', label: 'shop.metricOrders' },
];

/**
 * Revenue / Orders.
 *
 * The two labels are different lengths in all three languages, so this thumb
 * cannot be placed in percentages the way the period pills are: each option
 * reports its width and the thumb springs to that offset and size. Until both
 * measurements land, the active option paints its own background — the control
 * is never left without a selection marker.
 */
function MetricToggle({
  metric,
  onChange,
}: {
  metric: 'revenue' | 'orders';
  onChange: (next: 'revenue' | 'orders') => void;
}) {
  const { t } = useI18n();
  const [widths, setWidths] = useState<number[]>([]);
  const active = METRICS.findIndex((option) => option.key === metric);
  const measured = widths.length === METRICS.length && widths.every((w) => w > 0);

  const offset = useAnimatedNumber(
    measured ? widths.slice(0, active).reduce((sum, w) => sum + w, 0) : 0,
  );
  const width = useAnimatedNumber(measured ? widths[active] : 0);

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#F1F4F8',
        borderRadius: brandRadius.pill,
        padding: TRACK_PAD,
      }}
    >
      {measured ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: TRACK_PAD,
            top: TRACK_PAD,
            bottom: TRACK_PAD,
            width,
            borderRadius: brandRadius.pill,
            backgroundColor: brand.surface,
            transform: [{ translateX: offset }],
          }}
        />
      ) : null}

      {METRICS.map((option, i) => {
        const on = option.key === metric;
        return (
          <Tap
            key={option.key}
            onPress={() => onChange(option.key)}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              setWidths((prev) => {
                if (prev[i] === w) return prev;
                const next = [...prev];
                next[i] = w;
                return next;
              });
            }}
            accessibilityRole="radio"
            aria-checked={on}
            accessibilityLabel={t(option.label)}
            feedback="opacity"
            style={{
              minHeight: 32,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 11,
              borderRadius: brandRadius.pill,
              backgroundColor: !measured && on ? brand.surface : 'transparent',
            }}
          >
            <LineIcon
              name={option.icon}
              size={14}
              color={on ? brand.chartLine : '#8C9AAC'}
              strokeWidth={2}
            />
            <Txt size={11.5} weight={600} color={on ? brand.chartLine : '#8C9AAC'}>
              {t(option.label)}
            </Txt>
          </Tap>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Channels
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Where the orders came from: one stacked bar, then the numbers behind it.
 *
 * The bar has no gaps between its segments and clips to a pill, so the widths
 * sum to exactly the track. Any shortfall left by rounding shows as track rather
 * than being absorbed silently into the last channel.
 */
function ChannelMix({
  channels,
  orders,
  period,
}: {
  channels: AnalyticsView['channels'];
  orders: number;
  period: PeriodKey;
}) {
  const { t } = useI18n();

  return (
    <ShopCard padding={18}>
      <Txt size={14.5} weight={700} tracking={-0.014} color="#102A43">
        {t('shop.channels')}
      </Txt>
      <View style={{ height: 6 }} />
      <Txt size={11} color="#63758B">
        {t('shop.channelsSub', { count: orders, n: channels.length })}
      </Txt>
      <View style={{ height: 16 }} />

      <View
        style={{
          flexDirection: 'row',
          height: 12,
          borderRadius: brandRadius.pill,
          backgroundColor: '#EDF1F6',
          overflow: 'hidden',
        }}
      >
        {channels.map((c, i) => (
          <Segment
            // Re-mounted when the period changes so the bar redraws with the
            // figures instead of silently resizing behind them.
            key={`${period}:${c.source}`}
            share={c.share}
            index={i}
            color={brandChip[SOURCE_CHIP[c.source]].fg}
          />
        ))}
      </View>

      <View style={{ height: 14, gap: 10 }} />
      {channels.map((c) => (
        <View
          key={c.source}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 }}
        >
          <View
            style={{
              width: 9,
              height: 9,
              borderRadius: brandRadius.pill,
              backgroundColor: brandChip[SOURCE_CHIP[c.source]].fg,
            }}
          />
          <Txt flex={1} size={13} weight={500} color={brand.text}>
            {c.source}
          </Txt>
          <Txt size={12.5} mono color={brand.muted}>
            {c.orders}
          </Txt>
          <Txt
            size={13}
            weight={700}
            mono
            color={brand.text}
            style={{ minWidth: 42, textAlign: 'right' }}
          >
            {c.share}%
          </Txt>
        </View>
      ))}
    </ShopCard>
  );
}

/** One band of the stacked bar, growing to its share of the whole. */
function Segment({ share, color, index }: { share: number; color: string; index: number }) {
  const width = useGrow(share, index);
  return <Animated.View style={{ width, height: '100%', backgroundColor: color }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Top products
// ─────────────────────────────────────────────────────────────────────────────

function TopProducts({ top, period }: { top: AnalyticsView['top']; period: PeriodKey }) {
  const { t } = useI18n();
  const leader = top[0]?.revenue ?? 0;

  return (
    <ShopCard padding={18}>
      <Txt size={14.5} weight={700} tracking={-0.014} color="#102A43">
        {t('shop.topProducts')}
      </Txt>
      <View style={{ height: 6 }} />
      <Txt size={11} color="#63758B">
        {t('shop.topProductsSub')}
      </Txt>
      <View style={{ height: 14 }} />

      {top.map((item, i) => (
        <TopRow
          key={`${period}:${item.product}`}
          rank={i}
          product={item.product}
          units={item.units}
          revenue={item.revenue}
          share={leader === 0 ? 0 : Math.round((item.revenue / leader) * 100)}
        />
      ))}
    </ShopCard>
  );
}

function TopRow({
  rank,
  product,
  units,
  revenue,
  share,
}: {
  rank: number;
  product: string;
  units: number;
  revenue: number;
  share: number;
}) {
  const { t } = useI18n();
  const width = useGrow(share, rank);

  return (
    <View style={{ paddingVertical: 9, gap: 7 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Txt size={11} weight={700} mono color="#B4BCC6" style={{ minWidth: 16 }}>
          {String(rank + 1).padStart(2, '0')}
        </Txt>
        <Txt flex={1} size={13.5} weight={600} color={brand.text} numberOfLines={1}>
          {product}
        </Txt>
        <Txt size={11.5} color={brand.muted}>
          {t('shop.unitsSold', { n: units })}
        </Txt>
        <Txt size={13} weight={700} color={brand.text}>
          LKR {revenue.toLocaleString('en-US')}
        </Txt>
      </View>
      {/* A bar against the leader, so rank is visible before it is read. */}
      <View
        style={{
          height: 5,
          borderRadius: brandRadius.pill,
          backgroundColor: '#EDF1F6',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            width,
            height: '100%',
            borderRadius: brandRadius.pill,
            backgroundColor: brand.chartLine,
          }}
        />
      </View>
    </View>
  );
}
