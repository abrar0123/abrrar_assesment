import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, DimensionValue, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius as radii } from '@/src/theme';

interface Props {
  width?: DimensionValue;
  height: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

// Pulsing placeholder shaped like the content it stands in for (no spinner-on-blank screens).
export function Skeleton({ width = '100%', height, radius = radii.card, style }: Props) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.base, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.skeleton },
});
