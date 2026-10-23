import React, { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Seat, SeatRow } from '../data/cinema';
import { ScreenArc } from './ScreenArc';
import { SeatMap } from './SeatMap';
import { colors, spacing } from '@/src/theme';

const ZOOM_LEVELS = [1, 1.5, 2];
// Widest row is 24 seats; this is its width in seat units, including gaps, aisles and the row label.
const ROW_WIDTH_UNITS = 31;
// Keeps seats a comfortable size on tablets instead of stretching to fill the screen.
const MAX_BASE_SEAT_SIZE = 22;

interface Props {
  rows: SeatRow[];
  selected: Set<string>;
  onToggle: (seat: Seat) => void;
}

// Seat map with the screen arc, +/- zoom and a design-style scroll bar.
export function ZoomableSeatMap({ rows, selected, onToggle }: Props) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const [scroll, setScroll] = useState({ x: 0, content: 0, view: 0 });

  // Sized from this component's own width, so it fits both the portrait screen and the
  // narrower landscape column next to the checkout panel.
  const fitWidth = Math.max(0, scroll.view - spacing.screen * 2);
  const baseSeat = Math.min(fitWidth / ROW_WIDTH_UNITS, MAX_BASE_SEAT_SIZE);
  const seatSize = baseSeat * ZOOM_LEVELS[zoomIndex];
  const canZoomIn = zoomIndex < ZOOM_LEVELS.length - 1;
  const canZoomOut = zoomIndex > 0;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    setScroll({ x: contentOffset.x, content: contentSize.width, view: layoutMeasurement.width });
  };

  return (
    <View style={styles.area}>
      <ScrollView
        testID="seat-map"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onContentSizeChange={(w) => setScroll((s) => ({ ...s, content: w }))}
        onLayout={(e) => {
          const view = e.nativeEvent.layout.width;
          setScroll((s) => ({ ...s, view }));
        }}
      >
        <View style={{ width: Math.max(fitWidth, seatSize * ROW_WIDTH_UNITS) }}>
          <View style={styles.screen}>
            <ScreenArc label />
          </View>
          {seatSize > 0 ? (
            <SeatMap rows={rows} seatSize={seatSize} selected={selected} onToggle={onToggle} />
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.zoomControls}>
        <ZoomButton icon="add" disabled={!canZoomIn} onPress={() => setZoomIndex((z) => z + 1)} />
        <ZoomButton icon="remove" disabled={!canZoomOut} onPress={() => setZoomIndex((z) => z - 1)} />
      </View>

      <ScrollTrack {...scroll} />
    </View>
  );
}

function ZoomButton({
  icon,
  disabled,
  onPress,
}: {
  icon: 'add' | 'remove';
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.zoomButton, disabled && styles.zoomDisabled]}
      accessibilityRole="button"
      accessibilityLabel={icon === 'add' ? 'Zoom in' : 'Zoom out'}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}

// The thumb shows which part of the map is visible when zoomed in.
function ScrollTrack({ x, content, view }: { x: number; content: number; view: number }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const thumbWidth = trackWidth * Math.min(1, view / Math.max(content, 1));
  const progress = Math.min(1, Math.max(0, x / Math.max(content - view, 1)));
  return (
    <View style={styles.track} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
      <View style={[styles.thumb, { width: thumbWidth, left: (trackWidth - thumbWidth) * progress }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.screen, paddingVertical: 30 },
  screen: { marginHorizontal: 10, marginBottom: 24 },
  zoomControls: { position: 'absolute', right: spacing.screen, bottom: 33, flexDirection: 'row', gap: 10 },
  zoomButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  zoomDisabled: { opacity: 0.4 },
  track: {
    height: 5,
    marginHorizontal: spacing.screen,
    marginBottom: 12,
    borderRadius: 3,
    backgroundColor: colors.track,
  },
  thumb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: colors.seatUnavailable,
  },
});
