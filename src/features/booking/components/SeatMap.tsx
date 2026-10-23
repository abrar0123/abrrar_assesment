import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Seat, SeatRow } from '../data/cinema';
import { colors, fonts } from '@/src/theme';

interface Props {
  rows: SeatRow[];
  seatSize: number;
  selected?: Set<string>;
  onToggle?: (seat: Seat) => void;
  // Compact maps (hall preview cards) draw plain dots and skip row labels.
  compact?: boolean;
}

export const seatColor = (seat: Seat, selected: boolean) => {
  if (selected) return colors.seatSelected;
  if (!seat.available) return colors.seatUnavailable;
  return seat.kind === 'vip' ? colors.seatVip : colors.seatRegular;
};

export const SeatMap = memo(function SeatMap({ rows, seatSize, selected, onToggle, compact }: Props) {
  // Compact previews are airier, like the design's hall cards.
  const gap = compact ? seatSize * 0.75 : Math.max(1, Math.round(seatSize * 0.18));
  const aisle = compact ? seatSize * 2 : seatSize * 0.9;

  return (
    <View style={{ gap, alignSelf: 'stretch' }}>
      {rows.map(({ row, blocks }) => (
        <View key={row} style={styles.row}>
          {!compact ? (
            <Text style={[styles.rowLabel, { width: seatSize, fontSize: Math.max(7, seatSize * 0.5) }]}>
              {row}
            </Text>
          ) : null}
          <View style={[styles.blocks, { gap: aisle }]}>
            {blocks.map((block, i) => (
              <View key={i} style={[styles.block, { gap }]}>
                {block.map((seat) => {
                  const isSelected = !!selected?.has(seat.id);
                  const color = seatColor(seat, isSelected);
                  if (compact) {
                    return (
                      <View
                        key={seat.id}
                        style={{
                          width: seatSize,
                          height: seatSize,
                          borderRadius: seatSize * 0.3,
                          backgroundColor: color,
                        }}
                      />
                    );
                  }
                  return (
                    <Pressable
                      key={seat.id}
                      disabled={!seat.available || !onToggle}
                      onPress={() => onToggle?.(seat)}
                      hitSlop={2}
                      accessibilityRole="button"
                      accessibilityLabel={`Row ${seat.row} seat ${seat.number}${seat.kind === 'vip' ? ' VIP' : ''}`}
                      accessibilityState={{ selected: isSelected, disabled: !seat.available }}
                    >
                      <MaterialCommunityIcons name="seat" size={seatSize} color={color} />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { fontFamily: fonts.medium, color: colors.text, textAlign: 'left' },
  blocks: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  block: { flexDirection: 'row' },
});
