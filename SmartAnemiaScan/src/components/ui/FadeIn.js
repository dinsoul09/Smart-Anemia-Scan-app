import React, { useEffect, useRef } from 'react';
import { Animated, AccessibilityInfo, Easing } from 'react-native';

// Cards slide up a little and fade in, one after another by `delay`.
// Skipped entirely when the system "reduce motion" setting is on.
export default function FadeIn({ children, delay = 0, style }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          progress.setValue(1);
          return;
        }
        Animated.timing(progress, {
          toValue: 1,
          duration: 420,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    return () => {
      cancelled = true;
    };
  }, [delay, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
