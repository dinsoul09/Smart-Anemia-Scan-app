import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, PanResponder, ActivityIndicator } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

// How close (in screen points) a touch must be to a handle to grab it instead of moving the whole outline
const HANDLE_GRAB_RADIUS = 28;
const HANDLE_SIZE = 18;

// A crescent around the image centre: the flat top follows the lid margin, the rounded bottom the fold.
// Only a starting shape — the user drags it onto their own conjunctiva.
const makeInitialOutline = (width, height) => {
  const w = Math.min(width, height) * 0.5;
  const h = w * 0.3;
  const cx = width / 2;
  const top = height / 2 - h / 2;

  return [
    { x: cx - w / 2, y: top },
    { x: cx - w / 4, y: top + h * 0.08 },
    { x: cx, y: top + h * 0.1 },
    { x: cx + w / 4, y: top + h * 0.08 },
    { x: cx + w / 2, y: top },
    { x: cx + w / 3, y: top + h * 0.75 },
    { x: cx, y: top + h },
    { x: cx - w / 3, y: top + h * 0.75 },
  ];
};

export default function ConjunctivaMaskEditor({ photo, isSubmitting, errorText, onRetake, onConfirm }) {
  const [layout, setLayout] = useState(null);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (photo) {
      setPoints(makeInitialOutline(photo.width, photo.height));
    }
  }, [photo]);

  // Where the photo sits inside the editor area with resizeMode="contain"
  const frame = useMemo(() => {
    if (!photo || !layout) return null;
    const scale = Math.min(layout.width / photo.width, layout.height / photo.height);
    return {
      scale,
      left: (layout.width - photo.width * scale) / 2,
      top: (layout.height - photo.height * scale) / 2,
    };
  }, [photo, layout]);

  // PanResponder is created once, so it reads the latest values through refs
  const stateRef = useRef({ points, frame, photo });
  stateRef.current = { points, frame, photo };
  const dragRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { points: current, frame: f } = stateRef.current;
        if (!f) return;

        const { locationX, locationY } = event.nativeEvent;
        let nearest = -1;
        let nearestDistance = HANDLE_GRAB_RADIUS;
        current.forEach((p, i) => {
          const distance = Math.hypot(f.left + p.x * f.scale - locationX, f.top + p.y * f.scale - locationY);
          if (distance < nearestDistance) {
            nearest = i;
            nearestDistance = distance;
          }
        });

        // -1 means the touch missed every handle: drag the whole outline
        dragRef.current = { index: nearest, start: current };
      },
      onPanResponderMove: (_, gesture) => {
        const drag = dragRef.current;
        const { frame: f, photo: p } = stateRef.current;
        if (!drag || !f || !p) return;

        const dx = gesture.dx / f.scale;
        const dy = gesture.dy / f.scale;
        const clamp = (pt) => ({
          x: Math.min(p.width, Math.max(0, pt.x)),
          y: Math.min(p.height, Math.max(0, pt.y)),
        });

        setPoints(
          drag.start.map((pt, i) =>
            drag.index === -1 || drag.index === i ? clamp({ x: pt.x + dx, y: pt.y + dy }) : pt,
          ),
        );
      },
      onPanResponderRelease: () => {
        dragRef.current = null;
      },
      onPanResponderTerminate: () => {
        dragRef.current = null;
      },
    }),
  ).current;

  const screenPoints = frame
    ? points.map((p) => ({ x: frame.left + p.x * frame.scale, y: frame.top + p.y * frame.scale }))
    : [];

  return (
    <Modal visible={!!photo} animationType="slide" onRequestClose={onRetake}>
      <View style={styles.container}>
        <Text style={styles.title}>Outline the conjunctiva</Text>
        <Text style={styles.subtitle}>
          Drag the points onto the edge of the pink inner side of the lower eyelid. Only this area is sent for analysis.
        </Text>

        <View
          style={styles.editorArea}
          onLayout={(e) => setLayout(e.nativeEvent.layout)}
          {...panResponder.panHandlers}
        >
          {/* Touches go to the editor area itself, so locationX/Y are measured from it */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {photo ? <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} resizeMode="contain" /> : null}

            {frame ? (
              <Svg style={StyleSheet.absoluteFill}>
                <Polygon
                  points={screenPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(51, 228, 219, 0.18)"
                  stroke="#33E4DB"
                  strokeWidth={2}
                />
              </Svg>
            ) : null}

            {screenPoints.map((p, i) => (
              <View key={i} style={[styles.handle, { left: p.x - HANDLE_SIZE / 2, top: p.y - HANDLE_SIZE / 2 }]} />
            ))}
          </View>
        </View>

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={onRetake} disabled={isSubmitting}>
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => onConfirm(points)}
            disabled={isSubmitting || points.length === 0}
          >
            <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.primaryButtonFill}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Analyse</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 56,
    paddingBottom: 34,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#E9F6FE',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  editorArea: {
    flex: 1,
    overflow: 'hidden',
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#00BBD3',
  },
  errorText: {
    color: '#FF8A80',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#33E4DB',
    backgroundColor: 'rgba(0, 187, 211, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButtonFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
