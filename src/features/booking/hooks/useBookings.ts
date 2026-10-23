import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Booking, cancelBooking, getBookings } from '../storage/bookingStorage';

// Saved bookings, reloaded whenever the screen gains focus so new bookings show up immediately.
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setBookings(await getBookings());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const cancel = useCallback(
    async (id: string) => {
      await cancelBooking(id);
      await load();
    },
    [load],
  );

  return { bookings, loading: bookings === null, refreshing, refresh, cancel };
}
