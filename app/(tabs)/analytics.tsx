import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { ShopCard, ShopHeader, ShopSearch, StatTile } from '@/components/brand/ShopKit';
import { Txt } from '@/components/Txt';
import { analytics } from '@/data/shop';
import { useI18n } from '@/i18n';
import { brand } from '@/theme/brand';

/**
 * 15 · Analytics.
 *
 * Four figures, then "Daily Orders". The chart is a **line** with labelled
 * points — the HTML prototype in the handoff draws bars, but the exported PDF
 * is the finished design and it plots a line.
 */
export default function AnalyticsScreen() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopHeader title={t('tab.analytics')} action={t('shop.add')} />

      <View style={{ paddingHorizontal: 16 }}>
        <ShopSearch value={query} onChange={setQuery} placeholder={t('shop.search')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <StatTile
            iconFirst
            label={t('shop.revenue')}
            value={`LKR ${analytics.revenue.toLocaleString('en-US')}`}
            icon="bag"
            valueSize={22}
            valueColor="#413F3F"
          />
          <StatTile
            iconFirst
            label={t('shop.totalOrders')}
            value={String(analytics.totalOrders)}
            icon="orders"
            valueSize={26}
            valueColor="#413F3F"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <StatTile
            iconFirst
            label={t('shop.averageOrder')}
            value={`LKR ${analytics.averageOrder.toLocaleString('en-US')}`}
            icon="tag"
            valueSize={22}
            valueColor="#413F3F"
          />
          <StatTile
            iconFirst
            label={t('shop.netProfit')}
            value={`LKR ${analytics.netProfit.toLocaleString('en-US')}`}
            icon="trend"
            valueSize={22}
            valueColor="#413F3F"
          />
        </View>

        <ShopCard padding={18}>
          <Txt size={14.5} weight={700} tracking={-0.014} color="#102A43">
            {t('shop.dailyOrders')}
          </Txt>
          <View style={{ height: 6 }} />
          <Txt size={11} color="#63758B">
            {t('shop.dailyOrdersSub')}
          </Txt>
          <View style={{ height: 16 }} />
          <DailyOrdersChart />
        </ShopCard>
      </ScrollView>
    </View>
  );
}

/**
 * The line chart, drawn with `react-native-svg`.
 *
 * Laid out on a fixed 300 × 170 viewBox and scaled to the card, so the
 * gridlines, the polyline and the labels stay in register at any width.
 */
function DailyOrdersChart() {
  const W = 300;
  const H = 170;
  const padLeft = 26;
  const padBottom = 26;
  const padTop = 12;
  const plotW = W - padLeft - 8;
  const plotH = H - padTop - padBottom;

  const rows = [40, 30, 20, 10, 0];
  const points = analytics.daily.map((d, i) => {
    const x = padLeft + (plotW / (analytics.daily.length - 1)) * i;
    const y = padTop + plotH * (1 - d.value / analytics.axisMax);
    return { ...d, x, y };
  });

  return (
    <View style={{ width: '100%', aspectRatio: W / H }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {rows.map((value, i) => {
          const y = padTop + (plotH / (rows.length - 1)) * i;
          return <Line key={value} x1={padLeft} y1={y} x2={W - 8} y2={y} stroke="#E7EDF5" strokeWidth={1} />;
        })}

        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={brand.chartLine}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p) => (
          <Circle
            key={p.label}
            cx={p.x}
            cy={p.y}
            r={4.2}
            fill={brand.surface}
            stroke={brand.chartLine}
            strokeWidth={2.4}
          />
        ))}
      </Svg>

      {/* Axis and point labels as real text, so they inherit the locale's face. */}
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 22 }}>
        {rows.map((value, i) => (
          <Txt
            key={value}
            size={9}
            mono
            align="right"
            color="#63758B"
            style={{
              position: 'absolute',
              right: 0,
              top: `${((padTop + (plotH / (rows.length - 1)) * i - 5) / H) * 100}%`,
            }}
          >
            {value}
          </Txt>
        ))}
      </View>

      {points.map((p) => (
        <Txt
          key={`v-${p.label}`}
          size={9.5}
          weight={700}
          color="#102A43"
          style={{
            position: 'absolute',
            left: `${((p.x - 10) / W) * 100}%`,
            top: `${((p.y - 20) / H) * 100}%`,
          }}
        >
          {p.value}
        </Txt>
      ))}

      {points.map((p) => (
        <Txt
          key={`l-${p.label}`}
          size={9}
          color="#63758B"
          style={{
            position: 'absolute',
            left: `${((p.x - 11) / W) * 100}%`,
            bottom: 0,
          }}
        >
          {p.label}
        </Txt>
      ))}
    </View>
  );
}
