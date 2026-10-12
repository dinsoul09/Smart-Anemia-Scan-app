import React from 'react';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { colors } from '../../theme';

// App mark: eye with the rose lower lid. `inverted` = light tile for dark backgrounds.
export default function BrandMark({ size = 32, inverted = false }) {
  const tile = inverted ? colors.ground : colors.primary;
  const upper = inverted ? colors.primary : '#FFFFFF';
  const lower = inverted ? colors.rose : colors.roseLight;
  const iris = inverted ? colors.primary : '#FFFFFF';
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Rect width="48" height="48" rx="14" fill={tile} />
      <Path d="M9 24c4-6 9-9 15-9s11 3 15 9" stroke={upper} strokeWidth={2.8} strokeLinecap="round" fill="none" />
      <Path d="M9 24c4 6 9 9 15 9s11-3 15-9" stroke={lower} strokeWidth={2.8} strokeLinecap="round" fill="none" />
      <Circle cx="24" cy="24" r="4.8" fill={iris} />
    </Svg>
  );
}
