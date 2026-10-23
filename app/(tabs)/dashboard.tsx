import React, { useCallback } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Booking, BookingCard, useBookings } from '@/src/features/booking';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SectionLabel } from '@/src/components/SectionLabel';
import { EmptyView } from '@/src/components/StatusViews';
import { Skeleton } from '@/src/components/Skeleton';
import { useResponsive } from '@/src/hooks/useResponsive';
import { formatLongDate } from '@/src/utils/dates';
import { colors, spacing } from '@/src/theme';

const BOOKING_MIN_WIDTH = 340;

// The user's confirmed bookings (stored on-device with AsyncStorage).
export default function DashboardScreen() {
  const router = useRouter();
  const listBottom = useBottomTabBarHeight() + spacing.screen;
  const { bookings, loading, refreshing, refresh, cancel } = useBookings();
  const columns = useResponsive().columnsFor(BOOKING_MIN_WIDTH);

  const openMovie = useCallback((b: Booking) => router.push(`/movie/${b.movieId}`), [router]);

  const confirmCancel = useCallback(
    (b: Booking) =>
      Alert.alert('Cancel booking?', `${b.title}\n${formatLongDate(b.date)} · ${b.time} ${b.hallName}`, [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel booking', style: 'destructive', onPress: () => cancel(b.id) },
      ]),
    [cancel],
  );

  const count = bookings?.length ?? 0;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Dashboard"
        subtitle={count > 0 ? `${count} ${count === 1 ? 'booking' : 'bookings'}` : undefined}
      />
      {loading ? (
        <View style={styles.list} accessibilityLabel="Loading bookings">
          <Skeleton height={134} />
        </View>
      ) : (
        <FlatList
          key={`bookings-${columns}`} // numColumns can't change on the fly
          data={bookings}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? styles.columnGap : undefined}
          keyExtractor={(b) => b.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: listBottom },
            count === 0 && styles.emptyList,
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          ListHeaderComponent={count > 0 ? <SectionLabel>My Bookings</SectionLabel> : null}
          ItemSeparatorComponent={Separator}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <BookingCard booking={item} onPress={openMovie} onCancel={confirmCancel} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyView
              icon="ticket-outline"
              title="No bookings yet"
              message="Pick a movie and book your seats to see them here."
              actionLabel="Browse movies"
              onAction={() => router.navigate('/watch')}
            />
          }
        />
      )}
    </View>
  );
}

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.screen },
  emptyList: { flexGrow: 1 },
  separator: { height: 14 },
  cell: { flex: 1 },
  columnGap: { gap: 14 },
});
