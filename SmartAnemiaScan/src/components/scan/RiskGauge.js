import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, type } from '../../theme';

// Half-circle gauge: green / amber / red bands with a marker at the anemia probability
export default function RiskGauge({ probability }) {
  const pct = Math.round(probability * 100);
  const angle = Math.PI * probability;
  const markerX = 130 - 110 * Math.cos(angle);
  const markerY = 130 - 110 * Math.sin(angle);

  return (
    <View style={styles.wrap} accessibilityLabel={`${pct} percent chance of anemia signs`}>
      <Svg width={260} height={150} viewBox="0 0 260 150">
        <Path d="M20 130A110 110 0 0 1 74 35.3" stroke={colors.risk.low.bar} strokeWidth={14} strokeLinecap="round" fill="none" />
        <Path d="M86.3 29A110 110 0 0 1 173.7 29" stroke={colors.risk.moderate.bar} strokeWidth={14} strokeLinecap="round" fill="none" />
        <Path d="M186 35.3A110 110 0 0 1 240 130" stroke={colors.risk.high.bar} strokeWidth={14} strokeLinecap="round" fill="none" />
        <Circle cx={markerX} cy={markerY} r={11} fill="#FFFFFF" stroke={colors.ink} strokeWidth={4} />
      </Svg>
      <View style={styles.center}>
        <Text style={type.number}>{pct}%</Text>
        <Text style={type.caption}>chance of anemia signs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 260,
    height: 150,
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 6,
    alignItems: 'center',
    gap: 4,
  },
});
