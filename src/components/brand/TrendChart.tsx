import React, { useMemo } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { Rise, useAnimatedNumber, useDrawIn } from '@/theme/motion';
import { brand } from '@/theme/brand';

/**
 * The trend chart.
 *
 * Replaces a static polyline that printed every value on top of the line at
 * once. Three things were wrong with that: the labels crowded the stroke at any
 * realistic data density, the axis was pinned to a hardcoded 40 so a taller
 * series would simply escape the plot, and there was no way to read an exact
 * figure for a specific day.
 *
 * Here the axis is derived from the data, only the *selected* point is labelled,
 * and every point is selectable. Selection is driven by a row of transparent
 * full-height columns rather than by hit-testing the dots — a 4pt dot is not a
 * touch target, and this needs no gesture library to work on both platforms.
 *
 * **Motion.** The line draws itself whenever the data behind it changes, which
 * is how switching period or metric announces that every value just moved; the
 * fill follows it in, and the selected point slides to its new place instead of
 * teleporting. All of it collapses to a plain cut under reduce-motion.
 */

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const W = 320;
const H = 168;
const PAD = { top: 14, right: 8, bottom: 26, left: 34 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/**
 * Rounds an axis up to a readable ceiling.
 *
 * The ladder is deliberately fine. A coarse 1/2/5/10 sequence sends a series
 * peaking at 21,900 up to a 50,000 ceiling, which leaves the line sitting in the
 * bottom half of the card doing nothing — the steps between let it reach 25,000
 * instead and use the height it has.
 */
const LADDER = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function niceCeiling(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const scaled = value / magnitude;
  const step = LADDER.find((s) => scaled <= s) ?? 10;
  return step * magnitude;
}

/** `21900` → `21.9k`, so an axis label never wraps. */
function compact(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}m`;
  if (value >= 1_000) return `${Math.round(value / 100) / 10}k`;
  return String(value);
}

/** Labels arrive already translated — the chart does no lookups of its own. */
export type ChartPoint = { label: string; revenue: number; orders: number };

export function TrendChart({
  points,
  metric,
  selected,
  onSelect,
}: {
  points: ChartPoint[];
  metric: 'revenue' | 'orders';
  selected: number;
  onSelect: (index: number) => void;
}) {
  const geometry = useMemo(() => {
    const values = points.map((p) => (metric === 'revenue' ? p.revenue : p.orders));
    const max = niceCeiling(Math.max(...values, 1));
    const step = points.length > 1 ? PLOT_W / (points.length - 1) : 0;

    const coords = values.map((value, i) => ({
      value,
      label: points[i].label,
      x: PAD.left + step * i,
      y: PAD.top + PLOT_H * (1 - value / max),
    }));

    const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
    // The area closes down to the baseline so the fill has something to sit on.
    const area = `${line} L${coords[coords.length - 1].x},${PAD.top + PLOT_H} L${coords[0].x},${
      PAD.top + PLOT_H
    } Z`;

    // Exact for a polyline, and it is what the dash pattern has to match.
    const length = coords.reduce(
      (sum, c, i) =>
        i === 0 ? 0 : sum + Math.hypot(c.x - coords[i - 1].x, c.y - coords[i - 1].y),
      0,
    );

    return { coords, max, line, area, length };
  }, [points, metric]);

  // Redraw whenever the series or the metric changes — not on every selection.
  const seriesKey = `${metric}:${points.map((p) => p.label).join(',')}`;
  const draw = useDrawIn(geometry.length, seriesKey);

  const rows = [1, 0.75, 0.5, 0.25, 0];
  const active = geometry.coords[selected] ?? geometry.coords[geometry.coords.length - 1];
  const dotX = useAnimatedNumber(active.x);
  const dotY = useAnimatedNumber(active.y);
  const baseline = PAD.top + PLOT_H;

  return (
    <View style={{ width: '100%', aspectRatio: W / H }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={brand.chartLine} stopOpacity={0.22} />
            <Stop offset="1" stopColor={brand.chartLine} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {rows.map((r) => (
          <Line
            key={r}
            x1={PAD.left}
            y1={PAD.top + PLOT_H * (1 - r)}
            x2={W - PAD.right}
            y2={PAD.top + PLOT_H * (1 - r)}
            stroke="#E7EDF5"
            strokeWidth={1}
          />
        ))}

        {/* The fill trails the stroke in rather than appearing under a
            half-drawn line. */}
        <AnimatedPath d={geometry.area} fill="url(#trendFill)" opacity={draw.progress} />

        <AnimatedPath
          d={geometry.line}
          fill="none"
          stroke={brand.chartLine}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={geometry.length}
          strokeDashoffset={draw.dashoffset}
        />

        {/* A guide down from the selected point, so the x label reads as its own. */}
        <AnimatedLine
          x1={dotX}
          y1={dotY}
          x2={dotX}
          y2={baseline}
          stroke={brand.chartLine}
          strokeWidth={1}
          strokeDasharray="3 3"
          strokeOpacity={0.5}
        />

        {geometry.coords.map((c, i) =>
          i === selected ? null : (
            <AnimatedCircle
              key={c.label}
              cx={c.x}
              cy={c.y}
              r={3.4}
              fill={brand.surface}
              stroke={brand.chartLine}
              strokeWidth={2.2}
              opacity={draw.progress}
            />
          ),
        )}

        {/* The selected dot is drawn last and animates its own position, so it
            slides along the line as the selection moves. */}
        <AnimatedCircle
          cx={dotX}
          cy={dotY}
          r={6}
          fill={brand.chartLine}
          stroke={brand.surface}
          strokeWidth={3}
        />
      </Svg>

      {/* Axis labels as real text, so they take the locale's face and metrics. */}
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: PAD.left - 6 }}>
        {rows.map((r) => (
          <Txt
            key={r}
            size={9}
            mono
            align="right"
            color="#8C9AAC"
            style={{
              position: 'absolute',
              right: 0,
              top: `${((PAD.top + PLOT_H * (1 - r) - 5) / H) * 100}%`,
            }}
          >
            {compact(Math.round(geometry.max * r))}
          </Txt>
        ))}
      </View>

      {geometry.coords.map((c, i) => (
        <Txt
          key={`x-${c.label}`}
          size={9.5}
          weight={i === selected ? 700 : 400}
          color={i === selected ? brand.chartLine : '#8C9AAC'}
          style={{
            position: 'absolute',
            left: `${((c.x - 16) / W) * 100}%`,
            bottom: 0,
            width: `${(32 / W) * 100}%`,
            textAlign: 'center',
          }}
        >
          {c.label}
        </Txt>
      ))}

      {/* Selection targets: full-height columns, so any tap near a point lands. */}
      <View
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' }}
      >
        <View style={{ width: `${(PAD.left / W) * 100}%` }} />
        {geometry.coords.map((c, i) => (
          <Tap
            key={`hit-${c.label}`}
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityLabel={`${c.label} ${c.value}`}
            feedback="none"
            style={{ flex: 1 }}
          />
        ))}
        <View style={{ width: `${(PAD.right / W) * 100}%` }} />
      </View>
    </View>
  );
}

/** The reading for whichever point is selected — the chart's actual headline. */
export function TrendReadout({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Txt size={11.5} weight={600} tracking={0.06} transform="uppercase" color="#8C9AAC">
        {label}
      </Txt>
      {/* Keyed on the reading so `Rise` remounts and replays: without a cue the
          figure silently swaps and a tap on the chart looks like it did nothing. */}
      <Rise key={value}>
        <Txt size={26} weight={700} tracking={-0.025} color="#102A43">
          {value}
        </Txt>
      </Rise>
      <Txt size={11.5} color="#63758B">
        {caption}
      </Txt>
    </View>
  );
}
