import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/src/theme';
import { LoadMoreState } from '../hooks/usePagedMovies';

interface Props {
  state: LoadMoreState;
  onRetry: () => void;
}

// End-of-list footer: explains why no more movies are coming instead of the list just stopping.
export function LoadMoreFooter({ state, onRetry }: Props) {
  if (state === 'idle') return null;
  if (state === 'loading') return <ActivityIndicator style={styles.wrap} color={colors.accent} />;

  if (state === 'offline') {
    return (
      <View style={[styles.wrap, styles.row]} accessibilityLiveRegion="polite">
        <Ionicons name="cloud-offline-outline" size={16} color={colors.textMuted} />
        <Text style={styles.text}>You&apos;re offline. More movies will load when you reconnect.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <Text style={styles.text}>Couldn&apos;t load more movies.</Text>
      <Pressable onPress={onRetry} style={styles.retry} accessibilityRole="button" hitSlop={8}>
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20, alignItems: 'center', paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  text: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    flexShrink: 1,
  },
  retry: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  retryText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
});
