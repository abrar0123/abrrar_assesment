import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DateSelector, HALLS, Hall, HallCard, showingDates } from '@/src/features/booking';
import { Button } from '@/src/components/Button';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { formatLongDate, toISODate } from '@/src/utils/dates';
import { useResponsive } from '@/src/hooks/useResponsive';
import { colors, fonts, spacing } from '@/src/theme';

type Params = { id: string; title: string; releaseDate?: string; posterPath?: string };

// Step 1 of booking: pick a date and a hall/showtime.
export default function BookingScreen() {
  const { id, title, releaseDate, posterPath } = useLocalSearchParams<Params>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsive();

  const dates = useMemo(() => showingDates(releaseDate), [releaseDate]);
  const [dateIndex, setDateIndex] = useState(0);
  const [hallId, setHallId] = useState(HALLS[0].id);
  const isoDate = toISODate(dates[dateIndex]);

  const selectHall = useCallback((hall: Hall) => setHallId(hall.id), []);

  const selectSeats = () =>
    router.push({ pathname: '/booking/seats', params: { id, title, posterPath, date: isoDate, hallId } });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={title ?? 'Tickets'}
        subtitle={releaseDate ? `In Theaters ${formatLongDate(releaseDate)}` : undefined}
        onBack={router.back}
        centered
      />

      {/* The design's generous top spacing only fits in portrait. */}
      <ScrollView contentContainerStyle={[styles.content, isLandscape && styles.contentLandscape]}>
        <Text style={styles.label}>Date</Text>
        <DateSelector dates={dates} selectedIndex={dateIndex} onSelect={setDateIndex} />

        <FlatList
          horizontal
          data={HALLS}
          keyExtractor={(h) => h.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.halls}
          renderItem={({ item }) => (
            <HallCard
              hall={item}
              seed={`${id}-${isoDate}-${item.id}`}
              active={item.id === hallId}
              onPress={selectHall}
            />
          )}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button title="Select Seats" onPress={selectSeats} style={styles.cta} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 100, paddingBottom: 24 },
  contentLandscape: { paddingTop: 20 },
  label: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
    marginHorizontal: spacing.screen,
    marginBottom: 14,
  },
  halls: { paddingHorizontal: spacing.screen, gap: 10, marginTop: 39 },
  footer: { paddingHorizontal: spacing.screen, paddingTop: 12, backgroundColor: colors.background },
  // Full width on phones in portrait; a comfortable fixed width when the screen is wide.
  cta: { width: '100%', maxWidth: 480, alignSelf: 'center' },
});
