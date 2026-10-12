import { View, Text, StyleSheet, StatusBar } from 'react-native';
import BrandMark from './src/components/ui/BrandMark';
import { colors, fonts } from './src/theme';

export default function SplashScreen({ fontsLoaded = false }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <BrandMark size={96} inverted />
      <Text style={[styles.title, fontsLoaded && { fontFamily: fonts.bold, fontWeight: 'normal' }]}>SmartAnemiaScan</Text>
      <Text style={[styles.tagline, fontsLoaded && { fontFamily: fonts.regular }]}>Anemia screening from one eyelid photo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  tagline: {
    marginTop: 6,
    fontSize: 15,
    color: colors.onPrimaryMuted,
    textAlign: 'center',
  },
});
