import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, AccessibilityInfo, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, ClipPath, Path, Circle, G } from 'react-native-svg';
import { colors } from '../../theme';

const W = 260;
const H = 176;

// Hero eye with the lower lid pulled down — the area the model analyses.
// A slow scan line runs over it unless the system "reduce motion" setting is on.
export default function EyeIllustration({ animated = true }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled?.().then((reduce) => {
      if (cancelled || reduce || !animated) return;
      loop = Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [animated, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [34, 150] });
  const opacity = progress.interpolate({ inputRange: [0, 0.12, 0.88, 1], outputRange: [0, 0.9, 0.9, 0] });

  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <RadialGradient id="scl" cx="50%" cy="42%" r="62%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="70%" stopColor="#F3F7F5" />
            <Stop offset="100%" stopColor="#D5E3DF" />
          </RadialGradient>
          <RadialGradient id="iris" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#3B8C80" />
            <Stop offset="55%" stopColor="#22655C" />
            <Stop offset="100%" stopColor="#103631" />
          </RadialGradient>
          <LinearGradient id="conj" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F6B19E" />
            <Stop offset="1" stopColor="#D8604A" />
          </LinearGradient>
          <ClipPath id="almond">
            <Path d="M20 80C70 22 190 22 240 80C190 130 70 130 20 80Z" />
          </ClipPath>
        </Defs>

        <Path
          d="M8 34V20a12 12 0 0 1 12-12h16M224 8h16a12 12 0 0 1 12 12v14M252 142v14a12 12 0 0 1-12 12h-16M36 168H20a12 12 0 0 1-12-12v-14"
          stroke={colors.mint}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />

        <Path d="M26 86C74 132 186 132 234 86C204 150 56 150 26 86Z" fill="url(#conj)" />
        <Path
          d="M78 126c10 4 18 4 26 2M150 130c9 1 17-1 24-5M118 134c4-2 8-2 12 0"
          stroke="#B8432F"
          strokeWidth={1.1}
          strokeLinecap="round"
          fill="none"
          opacity={0.55}
        />
        <Path d="M22 90C58 158 202 158 238 90" stroke="#CFE3DD" strokeWidth={3} strokeLinecap="round" fill="none" />

        <Path d="M20 80C70 22 190 22 240 80C190 130 70 130 20 80Z" fill="url(#scl)" />
        <G clipPath="url(#almond)">
          <Circle cx="130" cy="76" r="38" fill="url(#iris)" />
          <Path
            d="M146 76h18M143.9 84l15.5 9M138 89.9l9 15.5M130 92v18M122 89.9l-9 15.5M116.1 84l-15.5 9M114 76H96M116.1 68l-15.5-9M122 62.1l-9-15.5M130 60V42M138 62.1l9-15.5M143.9 68l15.5-9"
            stroke="#8FD0C1"
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.35}
          />
          <Circle cx="130" cy="76" r="37" stroke="#0C2A26" strokeWidth={2.5} fill="none" />
          <Circle cx="130" cy="76" r="15" fill="#0A1917" />
          <Circle cx="142" cy="64" r="7" fill="#FFFFFF" />
          <Circle cx="120" cy="88" r="2.6" fill="#FFFFFF" opacity={0.7} />
          <Path d="M20 80C70 22 190 22 240 80C190 40 70 40 20 80Z" fill={colors.ink} opacity={0.14} />
        </G>
        <Path d="M16 80C68 18 192 18 244 80" stroke={colors.ground} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <Path d="M44 50C88 8 172 8 216 50" stroke="rgba(241,244,242,0.35)" strokeWidth={2} strokeLinecap="round" fill="none" />

        <Path d="M166 142l22 24" stroke={colors.roseTint} strokeWidth={1.5} strokeLinecap="round" />
        <Circle cx="166" cy="142" r="3.5" fill={colors.roseTint} />
      </Svg>
      <Animated.View style={[styles.scanline, { opacity, transform: [{ translateY }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: W,
    height: H,
  },
  scanline: {
    position: 'absolute',
    left: 14,
    top: 0,
    width: 232,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.mint,
  },
});
