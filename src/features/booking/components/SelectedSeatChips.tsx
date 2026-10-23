import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Seat } from '../data/cinema';
import { colors, fonts, radius } from '@/src/theme';

interface Props {
  seats: Seat[];
  onRemove: (seat: Seat) => void;
}

// "6 / 3 row ×" chips for the current selection, or a hint when nothing is selected.
export function SelectedSeatChips({ seats, onRemove }: Props) {
  if (seats.length === 0) return <Text style={styles.hint}>Tap a seat to select it</Text>;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {seats.map((s) => (
        <View key={s.id} style={styles.chip}>
          <Text style={styles.number}>{s.number}</Text>
          <Text style={styles.row}> / {s.row} row</Text>
          <Pressable
            onPress={() => onRemove(s)}
            hitSlop={8}
            accessibilityLabel={`Remove row ${s.row} seat ${s.number}`}
          >
            <Ionicons name="close" size={14} color={colors.text} style={styles.close} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, paddingVertical: 26 },
  chips: { gap: 10, paddingVertical: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.card,
    backgroundColor: colors.chip,
  },
  number: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  row: { fontFamily: fonts.regular, fontSize: 10, color: colors.text },
  close: { marginLeft: 10 },
});
