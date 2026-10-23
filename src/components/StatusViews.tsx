import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/src/theme';

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retry} accessibilityRole="button">
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface EmptyViewProps {
  message: string;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyView({ message, title, icon = 'film-outline', actionLabel, onAction }: EmptyViewProps) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={title ? 48 : 40} color={title ? colors.textFaint : colors.textMuted} />
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={[styles.message, title && styles.messageUnderTitle]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.retry} accessibilityRole="button">
          <Text style={styles.retryText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 240 },
  title: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, marginTop: 12 },
  messageUnderTitle: { marginTop: 4, fontSize: 12 },
  message: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  retry: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  retryText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
});
