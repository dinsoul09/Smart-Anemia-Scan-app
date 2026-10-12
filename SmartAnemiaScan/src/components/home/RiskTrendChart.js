import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, fonts } from '../../theme';

const HEIGHT = 128;
const PAD_X = 14;
const LABEL_SPACE = 52; // right edge keeps room for the band names
// Bands top → bottom; probability ranges follow assessScan's thresholds (0.4 / 0.7)
const BANDS = [
  { key: 'high', label: 'High', y: 0, h: 42, fill: '#FBEDEA', text: '#B4594A', from: 0.7, to: 1, yTop: 4, yBottom: 40 },
  { key: 'moderate', label: 'Moderate', y: 44, h: 34, fill: '#FBF3E4', text: '#A0742A', from: 0.4, to: 0.7, yTop: 46, yBottom: 76 },
  { key: 'low', label: 'Low', y: 80, h: 40, fill: '#EEF6F1', text: '#3F7E5E', from: 0, to: 0.4, yTop: 82, yBottom: 116 },
];

// Probability → y inside its band, so a point always sits in the band of its risk level
const yFor = (p) => {
  const band = BANDS.find((b) => p >= b.from) ?? BANDS[BANDS.length - 1];
  const t = (Math.min(p, band.to) - band.from) / (band.to - band.from);
  return band.yBottom - t * (band.yBottom - band.yTop);
};

// Smooth line through the points (Catmull-Rom turned into cubic Béziers)
const smoothPath = (pts) =>
  pts.reduce((d, p, i) => {
    if (i === 0) return `M${p.x} ${p.y}`;
    const p0 = pts[i - 2] ?? pts[i - 1];
    const p1 = pts[i - 1];
    const p3 = pts[i + 1] ?? p;
    const c1x = p1.x + (p.x - p0.x) / 6;
    const c1y = p1.y + (p.y - p0.y) / 6;
    const c2x = p.x - (p3.x - p1.x) / 6;
    const c2y = p.y - (p3.y - p1.y) / 6;
    return `${d}C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

const shortDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// Anemia probability of recent scans over the Low / Moderate / High bands.
// `points`: [{ date, probability, risk }] oldest → newest; empty draws just the bands.
export default function RiskTrendChart({ points, emptyText }) {
  const [width, setWidth] = useState(0);
  const plotRight = width - LABEL_SPACE;

  const coords = width && points.length
    ? points.map((p, i) => ({
        x: points.length === 1 ? plotRight : PAD_X + (i * (plotRight - PAD_X)) / (points.length - 1),
        y: yFor(p.probability),
        risk: p.risk,
      }))
    : [];
  const last = coords[coords.length - 1];

  return (
    <View>
      <View
        style={styles.plot}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessibilityLabel={
          points.length
            ? `Last ${points.length} scans: ${points.map((p) => `${Math.round(p.probability * 100)}%`).join(', ')}`
            : emptyText
        }
      >
        {width ? (
          <Svg width={width} height={HEIGHT}>
            {BANDS.map((b) => (
              <Rect key={b.key} x={0} y={b.y} width={width} height={b.h} rx={10} fill={b.fill} opacity={0.9} />
            ))}
            {coords.length > 1 ? (
              <Path d={smoothPath(coords)} stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" fill="none" />
            ) : null}
            {coords.slice(0, -1).map((c, i) => (
              <Circle key={i} cx={c.x} cy={c.y} r={5} fill={colors.risk[c.risk].solid} stroke="#FFFFFF" strokeWidth={2} />
            ))}
            {last ? (
              <>
                <Circle cx={last.x} cy={last.y} r={12} fill={colors.primary} opacity={0.14} />
                <Circle cx={last.x} cy={last.y} r={7} fill={colors.primary} stroke="#FFFFFF" strokeWidth={2.5} />
              </>
            ) : null}
          </Svg>
        ) : null}
        {BANDS.map((b) => (
          <Text key={b.key} style={[styles.bandLabel, { top: b.y + 4, color: b.text }]}>
            {b.label}
          </Text>
        ))}
        {!points.length && emptyText ? <Text style={styles.emptyText}>{emptyText}</Text> : null}
      </View>

      {points.length ? (
        <View style={[styles.labels, { width: plotRight > 0 ? plotRight + PAD_X : undefined }]}>
          {points.map((p, i) => {
            const isLast = i === points.length - 1;
            return (
              <Text key={`${p.date}-${i}`} style={[styles.dateLabel, isLast && styles.dateLabelLast]}>
                {shortDate(p.date)}
              </Text>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    height: HEIGHT,
    marginTop: 4,
  },
  bandLabel: {
    position: 'absolute',
    right: 8,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  emptyText: {
    position: 'absolute',
    left: 0,
    right: LABEL_SPACE,
    top: 54,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 2,
  },
  dateLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.subtle,
  },
  dateLabelLast: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
});
