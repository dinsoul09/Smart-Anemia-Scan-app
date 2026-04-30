import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Group95 from '../../../assets/Group95.svg';
import Vector from '../../../assets/Vector.svg';

const CONTACT_CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', value: '+7 775 009 76 57', icon: 'message-circle', color: '#25D366' },
  { key: 'email', label: 'Email', value: 'karim.abrakhmanov123@mail.ru', icon: 'mail', color: '#00BBD3' },
  { key: 'phone', label: 'Phone', value: '+7 775 009 76 57', icon: 'phone', color: '#6C63FF' },
];

const FAQ_ITEMS = [
  { key: 'faq1', question: 'How does the scan work?', answer: 'Our AI analyzes the color of your lower eyelid conjunctiva to detect signs of anemia with high accuracy.' },
  { key: 'faq2', question: 'Is my data secure?', answer: 'Yes! All your health data is encrypted and stored securely. We never share your information with third parties.' },
  { key: 'faq3', question: 'How accurate is the result?', answer: 'Our model achieves over 75% accuracy. However, always consult a healthcare professional for a definitive diagnosis.' },
];

function AnimatedCard({ children, delay = 0, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

export default function HelpCenterComponent() {
  const [expandedChannel, setExpandedChannel] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleToggleChannel = (channelKey) => {
    setExpandedChannel((prev) => (prev === channelKey ? null : channelKey));
  };

  const handleToggleFaq = (faqKey) => {
    setExpandedFaq((prev) => (prev === faqKey ? null : faqKey));
  };

  return (
    <ScrollView 
      style={styles.wrapper} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Background Logo */}
      <View style={styles.bgLogoWrap}>
        <Vector width={280} height={280} style={styles.bgLogo} />
      </View>
      {/* Contact Section */}
      <AnimatedCard delay={100}>
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        <Text style={styles.sectionSubtitle}>Choose your preferred way to reach us</Text>
      </AnimatedCard>

      <View style={styles.channelsGrid}>
        {CONTACT_CHANNELS.map((channel, index) => {
          const isExpanded = expandedChannel === channel.key;

          return (
            <AnimatedCard key={channel.key} delay={200 + index * 100} style={styles.channelCardOuter}>
              <TouchableOpacity
                style={[styles.channelCard, isExpanded && styles.channelCardActive]}
                onPress={() => handleToggleChannel(channel.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.channelIconCircle, { backgroundColor: channel.color + '18' }]}>
                  <Feather name={channel.icon} size={22} color={channel.color} />
                </View>
                <Text style={styles.channelLabel}>{channel.label}</Text>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#A0AEC0"
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.channelValueWrap}>
                  <LinearGradient
                    colors={[channel.color + '12', channel.color + '06']}
                    style={styles.channelValueCard}
                  >
                    <Text style={[styles.channelValueText, { color: channel.color }]}>{channel.value}</Text>
                  </LinearGradient>
                </View>
              )}
            </AnimatedCard>
          );
        })}
      </View>

      {/* FAQ Section */}
      <AnimatedCard delay={600}>
        <View style={styles.faqHeader}>
          <View style={styles.faqIconWrap}>
            <Feather name="help-circle" size={18} color="#00BBD3" />
          </View>
          <Text style={styles.sectionTitle}>FAQ</Text>
        </View>
      </AnimatedCard>

      {FAQ_ITEMS.map((faq, index) => {
        const isExpanded = expandedFaq === faq.key;

        return (
          <AnimatedCard key={faq.key} delay={700 + index * 100} style={styles.faqCardOuter}>
            <TouchableOpacity
              style={[styles.faqCard, isExpanded && styles.faqCardActive]}
              onPress={() => handleToggleFaq(faq.key)}
              activeOpacity={0.7}
            >
              <View style={styles.faqQuestionRow}>
                <View style={styles.faqDot} />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Feather
                  name={isExpanded ? 'minus' : 'plus'}
                  size={18}
                  color={isExpanded ? '#00BBD3' : '#A0AEC0'}
                />
              </View>

              {isExpanded && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          </AnimatedCard>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bgLogoWrap: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.06,
    zIndex: -1,
  },
  bgLogo: {
    opacity: 0.06,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8899A6',
    marginTop: 4,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  channelsGrid: {
    gap: 10,
    marginBottom: 28,
  },
  channelCardOuter: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  channelCardActive: {
    borderColor: '#00BBD3',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  channelIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  channelLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    letterSpacing: 0.2,
  },
  channelValueWrap: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#00BBD3',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  channelValueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  channelValueText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  channelActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  faqIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E6FBFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqCardOuter: {
    marginBottom: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  faqCardActive: {
    borderColor: '#B2F5EA',
    backgroundColor: '#F7FFFE',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00BBD3',
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    lineHeight: 20,
  },
  faqAnswer: {
    marginTop: 10,
    marginLeft: 18,
    fontSize: 13,
    color: '#718096',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
});
