import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsOnline } from '@/src/hooks/useIsOnline';
import { colors, fonts } from '@/src/theme';

// Shown app-wide while offline so cached content is never mistaken for live data.
export function OfflineBanner() {
  const online = useIsOnline();
  const insets = useSafeAreaInsets();
  if (online) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { top: insets.top + 6 }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.pill}>
        <Ionicons name="cloud-offline-outline" size={14} color={colors.white} />
        <Text style={styles.text}>Offline · showing saved data</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.tabBar,
  },
  text: { fontFamily: fonts.medium, fontSize: 12, color: colors.white },
});
