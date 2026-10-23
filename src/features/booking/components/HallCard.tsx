import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Hall, buildSeatMap } from '../data/cinema';
import { ScreenArc } from './ScreenArc';
import { SeatMap } from './SeatMap';
import { colors, fonts, radius } from '@/src/theme';

interface Props {
  hall: Hall;
  // Same seed as the seat screen, so the preview matches the real seat map.
  seed: string;
  active: boolean;
  onPress: (hall: Hall) => void;
}

// Showtime card: "12:30 Cinetech + Hall 1", mini seat map, and price line.
export const HallCard = memo(function HallCard({ hall, seed, active, onPress }: Props) {
  const rows = useMemo(() => buildSeatMap(seed), [seed]);

  return (
    <Pressable
      onPress={() => onPress(hall)}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={styles.heading}>
        <Text style={styles.time}>{hall.time} </Text>
        <Text style={styles.name}> {hall.name}</Text>
      </Text>
      <View style={[styles.card, active && styles.cardActive]}>
        <View style={styles.screen}>
          <ScreenArc />
        </View>
        <SeatMap rows={rows} seatSize={4} compact />
      </View>
      <Text style={styles.price}>
        From <Text style={styles.bold}>{hall.price}$</Text> or{' '}
        <Text style={styles.bold}>{hall.bonus} bonus</Text>
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  heading: { marginBottom: 6 },
  time: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  name: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  card: {
    width: 249,
    height: 145,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardActive: { borderColor: colors.accent },
  screen: { alignSelf: 'stretch', marginHorizontal: 10, marginBottom: 10 },
  price: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted, marginTop: 8 },
  bold: { fontFamily: fonts.semibold, color: colors.text },
});
