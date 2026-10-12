import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { IconButton } from '../../ui';
import { colors, fonts, radii, type } from '../../../theme';

// Support channels. A channel shows up only once it has a real value here.
const SUPPORT = {
  whatsapp: null, // e.g. '77001234567' (digits only, with country code)
  email: null, // e.g. 'support@example.kz'
  phone: null, // e.g. '+77001234567'
};

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: 'message-circle', url: (v) => `https://wa.me/${v}` },
  { key: 'email', label: 'Email', icon: 'mail', url: (v) => `mailto:${v}` },
  { key: 'phone', label: 'Call', icon: 'phone', url: (v) => `tel:${v}` },
].filter((c) => SUPPORT[c.key]);

const FAQ = [
  {
    q: 'How does the scan work?',
    a: 'The app looks at the colour of your inner lower eyelid. Pale tissue there can be a sign of low haemoglobin, so we flag it and suggest a blood test.',
  },
  {
    q: 'How accurate is the result?',
    a: 'The model is still being validated clinically. Treat a moderate or high result as a reason to get a complete blood count, not as a diagnosis.',
  },
  {
    q: 'Why does lighting matter?',
    a: 'The result depends on colour, and yellow lamps or shadows change how the eyelid looks to the camera. Scan in bright, even daylight for results you can compare week to week.',
  },
  {
    q: 'Is my data private?',
    a: 'Only the part of the eyelid you outline is sent for analysis, not the whole photo. Your scans are visible only in your account. See the Privacy Policy in Profile for details.',
  },
];

function FaqItem({ item, open, onToggle, last }) {
  return (
    <View style={[styles.faqItem, !last && styles.faqDivider]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.faqQuestion}
      >
        <Text style={styles.faqQuestionText}>{item.q}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
      </Pressable>
      {open ? <Text style={styles.faqAnswer}>{item.a}</Text> : null}
    </View>
  );
}

export default function HelpCenterComponent({ onBack }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          {onBack ? <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={onBack} /> : null}
        </View>

        <View style={styles.intro}>
          <Text style={type.title} accessibilityRole="header">Help</Text>
          <Text style={type.bodyMuted}>Questions about scans or your account</Text>
        </View>

        {CHANNELS.length > 0 ? (
          <View style={styles.channels}>
            {CHANNELS.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => Linking.openURL(c.url(SUPPORT[c.key]))}
                accessibilityRole="link"
                style={({ pressed }) => [styles.channel, pressed && styles.pressed]}
              >
                <View style={styles.channelIcon}>
                  <Feather name={c.icon} size={22} color={colors.primary} />
                </View>
                <Text style={styles.channelLabel}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={[type.section, styles.sectionTitle]}>Common questions</Text>
        <View style={styles.faq}>
          {FAQ.map((item, i) => (
            <FaqItem
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              last={i === FAQ.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    minHeight: 44,
  },
  intro: {
    gap: 2,
    paddingHorizontal: 4,
  },
  channels: {
    flexDirection: 'row',
    gap: 10,
  },
  channel: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  channelIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.7,
  },
  sectionTitle: {
    paddingHorizontal: 4,
    marginTop: 4,
  },
  faq: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: 16,
  },
  faqItem: {
    paddingVertical: 4,
  },
  faqDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  faqQuestion: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestionText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  faqAnswer: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    paddingBottom: 14,
  },
});
