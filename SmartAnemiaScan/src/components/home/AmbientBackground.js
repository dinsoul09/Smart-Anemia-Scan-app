import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

// Two soft colour glows behind the Home content (mint top right, rose left).
// The design blurs solid circles; radial gradients give the same look without a blur filter.
export default function AmbientBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg style={styles.mint} width={520} height={520}>
        <Defs>
          <RadialGradient id="mintGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#CFE6DE" stopOpacity={0.95} />
            <Stop offset="1" stopColor="#CFE6DE" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={260} cy={260} r={260} fill="url(#mintGlow)" />
      </Svg>
      <Svg style={styles.rose} width={480} height={480}>
        <Defs>
          <RadialGradient id="roseGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#F6D9CF" stopOpacity={0.75} />
            <Stop offset="1" stopColor="#F6D9CF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={240} cy={240} r={240} fill="url(#roseGlow)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
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
