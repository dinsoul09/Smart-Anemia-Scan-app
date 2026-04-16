import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, PanResponder } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ScanGuideModal({ visible, onClose }) {
  const guideSheetTranslateY = useRef(new Animated.Value(0)).current;

  const closeGuideSheet = () => {
    Animated.timing(guideSheetTranslateY, {
      toValue: 420,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      guideSheetTranslateY.setValue(0);
      onClose();
    });
  };

  const guideSheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 6,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          guideSheetTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 1) {
          closeGuideSheet();
          return;
        }
        Animated.spring(guideSheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeGuideSheet}
    >
      <View style={styles.guideBackdrop}>
        <TouchableOpacity style={styles.guideBackdropPress} onPress={closeGuideSheet} />
        <Animated.View
          style={[styles.guideSheet, { transform: [{ translateY: guideSheetTranslateY }] }]}
          {...guideSheetPanResponder.panHandlers}
        >
          <View style={styles.guideHandle} />
          <Text style={styles.guideTitle}>Check your surroundings before scanning!</Text>

          <View style={styles.guideIllustration}>
            <Feather name="eye" size={46} color="#00BBD3" />
          </View>

          <Text style={styles.guideMainText}>Please check if you are too close to the camera!</Text>

          <View style={styles.guideItem}>
            <Feather name="sun" size={16} color="#00BBD3" />
            <Text style={styles.guideItemText}>Make sure you're in a well-lit area.</Text>
          </View>
          <View style={styles.guideItem}>
            <Feather name="scissors" size={16} color="#00BBD3" />
            <Text style={styles.guideItemText}>Remove glasses and move hair away from your eyes.</Text>
          </View>

          <TouchableOpacity style={styles.guideNextButton} activeOpacity={0.9} onPress={closeGuideSheet}>
            <Text style={styles.guideNextText}>Next</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  guideBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    paddingBottom: 0,
  },
  guideBackdropPress: {
    flex: 1,
  },
  guideSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 28,
    marginBottom: 0,
  },
  guideHandle: {
    width: 78,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    backgroundColor: '#EAEAEA',
    marginBottom: 18,
  },
  guideTitle: {
    color: '#2D2D2D',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  guideIllustration: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: '#E6FBFC',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  guideMainText: {
    color: '#1E1E1E',
    fontSize: 31,
    fontWeight: '600',
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 10,
    gap: 10,
  },
  guideItemText: {
    flex: 1,
    color: '#3C3C3C',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  guideNextButton: {
    borderWidth: 1,
    borderColor: '#8EE6EC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: 12,
    backgroundColor: '#F1FEFF',
  },
  guideNextText: {
    color: '#00BBD3',
    fontSize: 20,
    fontWeight: '700',
  },
});
