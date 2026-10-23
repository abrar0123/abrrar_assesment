import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hall, VIP_MULTIPLIER } from '../data/cinema';
import { colors, fonts } from '@/src/theme';

export function SeatLegend({ hall }: { hall: Hall }) {
  return (
    <View style={styles.legend}>
      <Item color={colors.seatSelected} label="Selected" />
      <Item color={colors.seatUnavailable} label="Not available" />
      <Item color={colors.seatVip} label={`VIP (${hall.price * VIP_MULTIPLIER} $)`} />
      <Item color={colors.seatRegular} label={`Regular (${hall.price} $)`} />
    </View>
  );
}

function Item({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.item}>
      <Ionicons name="square" size={16} color={color} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  item: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
});
