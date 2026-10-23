import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/src/theme';

// Small heading with a hairline underneath ("Top Results", "My Bookings").
export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.text,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
});
