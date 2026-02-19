import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordShell({
  step,
  title,
  description,
  bottomNote,
  actionLabel,
  onBack,
  onAction,
  children,
}) {
  const headerTitle = step === 'reset' ? 'Set Password' : 'Forgot Password';

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBackWrap}>
          <Text style={styles.headerBackArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.headerSpacer} />
        
      </LinearGradient>

      <View style={styles.content}>
        
        {children}
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {bottomNote ? <Text style={styles.bottomNote}>{bottomNote}</Text> : null}

        <TouchableOpacity style={styles.actionOuter} onPress={onAction}>
          <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.actionButton}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 90,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackWrap: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerBackArrow: {
    color: '#FFFFFF',
    fontSize: 33,
    marginTop: -1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  description: {
    marginTop: 8,
    color: '#5F6368',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 310,
  },
  bottomNote: {
    marginTop: 28,
    textAlign: 'center',
    color: '#E9F6FE',
    fontSize: 16,
  },
  actionOuter: {
    alignItems: 'center',
    marginTop: 28,
  },
  actionButton: {
    minWidth: 220,
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 85,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
});