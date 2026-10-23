import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { imageUrl } from '@/src/api/tmdb';
import { CachedImage } from '@/src/components/CachedImage';
import { formatLongDate } from '@/src/utils/dates';
import { colors, fonts, radius } from '@/src/theme';
import { Booking } from '../storage/bookingStorage';
import { summarizeBookedSeats } from '../utils/seats';

interface Props {
  booking: Booking;
  onPress: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

export const BookingCard = memo(function BookingCard({ booking, onPress, onCancel }: Props) {
  const uri = imageUrl(booking.posterPath, 'w185');

  const when = `${formatLongDate(booking.date)} | ${booking.time} ${booking.hallName}`;
  const seats = summarizeBookedSeats(booking.seats);

  // The card and its Cancel button are siblings, not nested, so screen readers can reach both.
  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(booking)}
        style={styles.main}
        accessibilityRole="button"
        accessibilityLabel={`${booking.title}, ${when}, ${seats}, total $${booking.total}`}
        accessibilityHint="Opens the movie"
      >
        <View style={styles.poster}>
          {uri ? (
            <CachedImage uri={uri} />
          ) : (
            <Ionicons name="film-outline" size={28} color={colors.textMuted} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {booking.title}
          </Text>
          <Text style={styles.meta}>{when}</Text>

          <View style={styles.seatRow}>
            <Ionicons name="ticket-outline" size={14} color={colors.accent} />
            <Text style={styles.seats} numberOfLines={2}>
              {seats}
            </Text>
          </View>

          <Text style={styles.total}>$ {booking.total}</Text>
        </View>
      </TouchableOpacity>

      <Pressable
        onPress={() => onCancel(booking)}
        hitSlop={8}
        style={styles.cancelButton}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        accessibilityHint={`Cancels the ${booking.title} booking`}
      >
        <Text style={styles.cancel}>Cancel</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  poster: {
    width: 76,
    height: 110,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flexDirection: 'row' },
  info: { flex: 1, marginLeft: 14 },
  title: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  meta: { fontFamily: fonts.medium, fontSize: 12, color: colors.accent, marginTop: 2 },
  seatRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8 },
  seats: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  total: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginTop: 'auto', paddingTop: 8 },
  cancelButton: { position: 'absolute', right: 12, bottom: 14 },
  cancel: { fontFamily: fonts.medium, fontSize: 12, color: colors.danger },
});
