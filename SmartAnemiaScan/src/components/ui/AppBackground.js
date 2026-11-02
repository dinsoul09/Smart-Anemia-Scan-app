import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { colors } from '../../theme';

// App-wide backdrop: light ground with two soft colour glows (mint top right, rose left).
// Rendered once behind every screen in App.js, so screen containers stay transparent.
// The design blurs solid circles; radial gradients give the same look without a blur filter.
export default function AppBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.ground]} pointerEvents="none">
      <Svg style={styles.mint} width={520} height={520}>
        <Defs>
          <RadialGradient id="mintGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.glowMint} stopOpacity={0.95} />
            <Stop offset="1" stopColor={colors.glowMint} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={260} cy={260} r={260} fill="url(#mintGlow)" />
      </Svg>
      <Svg style={styles.rose} width={480} height={480}>
        <Defs>
          <RadialGradient id="roseGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.glowRose} stopOpacity={0.75} />
            <Stop offset="1" stopColor={colors.glowRose} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={240} cy={240} r={240} fill="url(#roseGlow)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  ground: {
    backgroundColor: colors.ground,
    overflow: 'hidden',
  },
  mint: {
    position: 'absolute',
    right: -240,
    top: -200,
  },
  rose: {
    position: 'absolute',
    left: -260,
    top: 300,
  },
});
