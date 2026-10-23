import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/src/theme';

interface Props {
  label?: boolean;
  thickness?: number;
}

// Larger radius = flatter arc; 2.5x the width matches the design's gentle curve.
const RADIUS_FACTOR = 2.5;

// Shallow curved line representing the cinema screen. Drawn as the top cap of a
// large circle clipped to the arc's height, so no SVG is needed.
export function ScreenArc({ label = false, thickness = 1 }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const radius = width * RADIUS_FACTOR;
  const depth = radius - Math.sqrt(radius * radius - (width * width) / 4); // arc height (sagitta)

  return (
    <View onLayout={onLayout} style={styles.wrap}>
      {width > 0 ? (
        <View style={{ height: depth + thickness, overflow: 'hidden' }}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: (width - radius * 2) / 2,
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              borderWidth: thickness,
              borderColor: colors.accent,
            }}
          />
        </View>
      ) : null}
      {label ? <Text style={[styles.label, { marginTop: -depth * 0.4 }]}>SCREEN</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  label: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
