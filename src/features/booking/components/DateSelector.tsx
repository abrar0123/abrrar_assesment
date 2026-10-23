import React from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { formatShortDate } from '@/src/utils/dates';
import { colors, fonts, radius, spacing } from '@/src/theme';

interface Props {
  dates: Date[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

// Horizontal "5 Mar · 6 Mar · …" chips.
export function DateSelector({ dates, selectedIndex, onSelect }: Props) {
  return (
    <FlatList
      horizontal
      data={dates}
      keyExtractor={(d) => d.toISOString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item, index }) => {
        const active = index === selectedIndex;
        return (
          <Pressable
            onPress={() => onSelect(index)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>{formatShortDate(item)}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.screen, gap: 10 },
  chip: {
    height: 32,
    paddingHorizontal: 20,
    borderRadius: radius.card,
    backgroundColor: colors.chip,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text },
  textActive: { color: colors.white },
});
