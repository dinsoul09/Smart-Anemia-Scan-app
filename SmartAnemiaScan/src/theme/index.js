// SmartAnemiaScan design tokens — "Spruce & Rose".
// Every screen takes its colors, fonts and radii from here instead of hard-coded hex values,
// so a future dark theme (Night Mint) only needs a second `colors` object.

export const colors = {
  // Base
  ground: '#F1F4F2',      // app background
  surface: '#FFFFFF',     // cards, inputs, nav bar
  ink: '#13201D',         // main text
  muted: '#55625E',       // secondary text (4.5:1+ on ground and surface)
  subtle: '#66736F',      // inactive nav icons/labels
  line: '#DCE3E0',        // input borders, nav top border
  divider: '#E6ECEA',     // row separators inside cards
  disabled: '#CBD7D3',

  // Brand
  primary: '#1D5B53',     // spruce — buttons, active states
  primaryPressed: '#13403A',
  primaryTint: '#DCEBE6',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#D3E6E1',

  rose: '#E07A62',        // eyelid accent, checkpoints, streaks
  roseLight: '#F0A58F',
  roseTint: '#F7E2DB',
  roseInk: '#9E3B26',
  roseInkDark: '#5C2418',

  mint: '#7ED3B8',        // scan frame corners on dark camera view

  // Camera
  cameraBg: '#0B1110',
  cameraPreview: '#1B2422',

  // Result risk levels (same in every theme)
  risk: {
    low: { fg: '#24684A', bg: '#E1F0E7', bar: '#8CC5A6', solid: '#5FA982' },
    moderate: { fg: '#855210', bg: '#F8EBD3', bar: '#E8BE6E', solid: '#E0A94A' },
    high: { fg: '#9E2F22', bg: '#F7DED9', bar: '#DE7B69', solid: '#D4604E' },
  },

  danger: '#9E2F22',
  overlay: 'rgba(19, 32, 29, 0.45)',
};

// Font families are registered in App.js with expo-font (files in assets/fonts).
export const fonts = {
  regular: 'Onest-Regular',
  medium: 'Onest-Medium',
  semibold: 'Onest-SemiBold',
  bold: 'Onest-Bold',
};

export const fontFiles = {
  'Onest-Regular': require('../../assets/fonts/Onest_400Regular.ttf'),
  'Onest-Medium': require('../../assets/fonts/Onest_500Medium.ttf'),
  'Onest-SemiBold': require('../../assets/fonts/Onest_600SemiBold.ttf'),
  'Onest-Bold': require('../../assets/fonts/Onest_700Bold.ttf'),
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  hero: 32,
  pill: 999,
};

export const spacing = {
  screen: 20,   // side padding on tab screens
  form: 24,     // side padding on auth screens
};

// Text presets. Custom fonts carry the weight, so never combine them with fontWeight.
export const type = {
  number: { fontFamily: fonts.bold, fontSize: 48, letterSpacing: -1.4, color: colors.ink },
  title: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: -0.5, color: colors.ink },
  heading: { fontFamily: fonts.bold, fontSize: 21, letterSpacing: -0.2, color: colors.ink },
  subheading: { fontFamily: fonts.semibold, fontSize: 18, color: colors.ink },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.ink },
  bodyMuted: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  caption: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  section: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
};

export const shadow = {
  fab: {
    shadowColor: '#1D5B53',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
};

// Turns an API scan result ({ sick, confidence }) into a risk level and an
// "chance of anemia signs" percentage. Thresholds are the same ones the old
// ScanResultModal used: anemia + confidence > 0.7 = high, >= 0.4 = moderate.
export const assessScan = (scan) => {
  if (!scan) return { risk: 'low', isAnemia: false, anemiaProbability: 0 };
  const label = String(scan.sick ?? scan.result ?? '').toLowerCase();
  const isAnemia = scan.isAnemic ?? label === 'anemia';
  const confidence = Number(scan.confidence ?? 0);
  let risk = 'low';
  if (isAnemia && confidence > 0.7) risk = 'high';
  else if (isAnemia && confidence >= 0.4) risk = 'moderate';
  const anemiaProbability = isAnemia ? confidence : 1 - confidence;
  return { risk, isAnemia, anemiaProbability: Math.min(Math.max(anemiaProbability, 0), 1) };
};

export const riskLabel = {
  low: 'Low probability',
  moderate: 'Moderate probability',
  high: 'High probability',
};

const theme = { colors, fonts, radii, spacing, type, shadow };
export default theme;
