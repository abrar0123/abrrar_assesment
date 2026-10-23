import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '@/src/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Design-system button: filled accent ("Get Tickets") or accent outline ("Watch Trailer").
export function Button({ title, onPress, variant = 'primary', icon, disabled, style }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {icon}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  primary: { backgroundColor: colors.accent },
  outline: { borderWidth: 1, borderColor: colors.accent },
  disabled: { opacity: 0.5 },
  text: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
});
