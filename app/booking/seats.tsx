import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckoutBar,
  SeatLegend,
  SelectedSeatChips,
  ZoomableSeatMap,
  addBooking,
  describeSeats,
  findHall,
  useSeatSelection,
} from '@/src/features/booking';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { formatLongDate } from '@/src/utils/dates';
import { useResponsive } from '@/src/hooks/useResponsive';
import { colors, spacing } from '@/src/theme';

type Params = { id: string; title: string; date: string; hallId: string; posterPath?: string };

const showSeatLimit = (max: number) =>
  Alert.alert('Seat limit', `You can book up to ${max} seats at a time.`);

// Step 2 of booking: pick seats, see the total, and save the booking.
export default function SeatsScreen() {
  const { id, title, date, hallId, posterPath } = useLocalSearchParams<Params>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsive();
  const hall = findHall(hallId);
  const [saving, setSaving] = useState(false);

  const { rows, selected, selectedSeats, total, toggle } = useSeatSelection({
    movieId: id,
    date,
    hall,
    onLimitReached: showSeatLimit,
  });

  const showLabel = `${formatLongDate(date)}  |  ${hall.time} ${hall.shortName}`;

  const pay = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('No seats selected', 'Pick at least one seat to continue.');
      return;
    }
    setSaving(true);
    try {
      await addBooking({
        movieId: id,
        title: title ?? 'Movie',
        posterPath: posterPath || null,
        date,
        hallId: hall.id,
        hallName: hall.shortName,
        time: hall.time,
        seats: selectedSeats.map(({ id: seatId, row, number, kind }) => ({ id: seatId, row, number, kind })),
        total,
      });
    } catch {
      setSaving(false);
      Alert.alert('Booking failed', "Couldn't save your booking. Please try again.");
      return;
    }

    Alert.alert(
      'Booking confirmed',
      `${title}\n${showLabel}\n\n${describeSeats(selectedSeats)}\n\nTotal: $${total}`,
      [
        { text: 'View bookings', onPress: () => router.dismissTo('/dashboard') },
        { text: 'Done', style: 'cancel', onPress: () => router.dismissTo('/watch') },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={title ?? 'Select Seats'} subtitle={showLabel} onBack={router.back} centered />

      {/* Portrait: map above the checkout panel. Landscape: map beside a scrollable panel. */}
      <View style={[styles.flex, isLandscape && styles.row]}>
        <ZoomableSeatMap rows={rows} selected={selected} onToggle={toggle} />

        <ScrollView
          style={isLandscape ? styles.sidePanel : styles.bottomPanel}
          contentContainerStyle={[styles.panel, { paddingBottom: insets.bottom + 16 }]}
          scrollEnabled={isLandscape}
          bounces={false}
        >
          <SeatLegend hall={hall} />
          <SelectedSeatChips seats={selectedSeats} onRemove={toggle} />
          <CheckoutBar total={total} busy={saving} onPay={pay} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  row: { flexDirection: 'row' },
  bottomPanel: { flexGrow: 0, backgroundColor: colors.surface },
  sidePanel: { width: 340, flexGrow: 0, backgroundColor: colors.surface },
  panel: { paddingHorizontal: spacing.screen, paddingTop: 24 },
});
