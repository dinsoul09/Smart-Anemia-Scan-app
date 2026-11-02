import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Button from './Button';
import { colors, fonts, radii } from '../../theme';
import { errorKind } from '../../utils/apiErrors';

// App-wide toasts and sheets (see "Messages & errors" in the design):
// success → a toast that disappears; network and server problems → a sheet with "Try again".
// Wrap the app in <FeedbackProvider> once, then call useFeedback() anywhere below it.

const TOAST_MS = 4000;

const SHEETS = {
  network: {
    icon: 'wifi-off',
    iconBg: colors.divider,
    iconColor: colors.muted,
    title: 'No internet connection',
    text: 'Scans are analysed on our server. Connect and try again.',
  },
  server: {
    icon: 'alert-circle',
    iconBg: colors.roseTint,
    iconColor: colors.roseInk,
    title: 'Something went wrong',
    text: 'We couldn’t reach the server. Nothing was lost.',
  },
};

const FeedbackContext = createContext(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used inside <FeedbackProvider>');
  return ctx;
}

export function FeedbackProvider({ children }) {
  const [toast, setToast] = useState(null); // { id, tone: 'success' | 'error', title, text }
  const [sheet, setSheet] = useState(null); // { kind: 'network' | 'server', onRetry }

  const showToast = useCallback(({ tone = 'success', title, text }) => {
    setToast({ id: Date.now(), tone, title, text });
  }, []);

  const showSheet = useCallback(({ kind, onRetry }) => setSheet({ kind, onRetry }), []);

  // Shows the sheet for network/server failures; returns false when the screen should handle the error itself
  const handleRequestError = useCallback((error, onRetry) => {
    const kind = errorKind(error);
    if (kind === 'api') return false;
    setSheet({ kind, onRetry });
    return true;
  }, []);

  const value = useMemo(() => ({ showToast, showSheet, handleRequestError }), [showToast, showSheet, handleRequestError]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toast ? <Toast key={toast.id} {...toast} onHide={() => setToast(null)} /> : null}
      <SystemSheet
        sheet={sheet}
        onClose={() => setSheet(null)}
        onRetry={() => {
          const retry = sheet?.onRetry;
          setSheet(null);
          retry?.();
        }}
      />
    </FeedbackContext.Provider>
  );
}

function Toast({ tone, title, text, onHide }) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const success = tone === 'success';

  const hide = useCallback(() => {
    Animated.timing(progress, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => onHide());
  }, [progress, onHide]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(hide, TOAST_MS);
    return () => clearTimeout(timer);
  }, [progress, hide]);

  return (
    <Animated.View
      style={[
        styles.toastWrap,
        { top: insets.top + 8 },
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.toast} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <View style={[styles.toastIcon, { backgroundColor: success ? colors.mint : colors.roseLight }]}>
          <Feather name={success ? 'check' : 'alert-circle'} size={18} color={colors.ink} />
        </View>
        <View style={styles.toastBody}>
          <Text style={styles.toastTitle}>{title}</Text>
          {text ? <Text style={styles.toastText}>{text}</Text> : null}
        </View>
        <Pressable onPress={hide} accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={10} style={styles.toastClose}>
          <Feather name="x" size={18} color={colors.onPrimaryMuted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function SystemSheet({ sheet, onClose, onRetry }) {
  const insets = useSafeAreaInsets();
  // Keep the last content while the sheet slides out
  const [shown, setShown] = useState(sheet);
  useEffect(() => {
    if (sheet) setShown(sheet);
  }, [sheet]);
  const content = SHEETS[shown?.kind] ?? SHEETS.server;

  return (
    <Modal visible={!!sheet} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} accessibilityViewIsModal>
          <View style={styles.handle} />
          <View style={[styles.sheetIcon, { backgroundColor: content.iconBg }]}>
            <Feather name={content.icon} size={26} color={content.iconColor} />
          </View>
          <Text style={styles.sheetTitle} accessibilityRole="header">{content.title}</Text>
          <Text style={styles.sheetText}>{content.text}</Text>
          <View style={styles.sheetActions}>
            {shown?.onRetry ? <Button title="Try again" onPress={onRetry} /> : null}
            <Button title="Close" variant="ghost" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  toast: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
    borderRadius: radii.lg,
    backgroundColor: '#16201E',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  toastIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastBody: {
    flex: 1,
    gap: 1,
  },
  toastTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  toastText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onPrimaryMuted,
  },
  toastClose: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    borderTopLeftRadius: radii.hero,
    borderTopRightRadius: radii.hero,
    backgroundColor: colors.surface,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 18,
  },
  sheetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
  },
  sheetText: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
  sheetActions: {
    alignSelf: 'stretch',
    gap: 4,
    marginTop: 20,
  },
});
