import AsyncStorage from '@react-native-async-storage/async-storage';
import { addBooking, bookedSeatIds, cancelBooking, getBookings } from '../storage/bookingStorage';

const input = {
  movieId: '42',
  title: 'Hope',
  posterPath: null,
  date: '2026-10-22',
  hallId: 'h1',
  hallName: 'Hall 1',
  time: '12:30',
  seats: [{ id: '5-6', row: 5, number: 6, kind: 'regular' as const }],
  total: 50,
};

beforeEach(() => AsyncStorage.clear());

describe('bookingStorage', () => {
  it('saves bookings newest first', async () => {
    const first = await addBooking(input);
    const second = await addBooking({ ...input, title: 'Whalefall' });
    expect((await getBookings()).map((b) => b.id)).toEqual([second.id, first.id]);
  });

  it('cancels a booking by id', async () => {
    const booking = await addBooking(input);
    await cancelBooking(booking.id);
    expect(await getBookings()).toEqual([]);
  });

  it('returns seat ids booked for one show only', async () => {
    await addBooking(input);
    await addBooking({ ...input, hallId: 'h2', seats: [{ id: '1-1', row: 1, number: 1, kind: 'regular' }] });
    expect(await bookedSeatIds('42', '2026-10-22', 'h1')).toEqual(new Set(['5-6']));
  });

  it('keeps every booking when saves and cancels overlap', async () => {
    const kept = await addBooking({ ...input, title: 'Kept' });
    const doomed = await addBooking({ ...input, title: 'Doomed' });

    await Promise.all([
      addBooking({ ...input, title: 'A' }),
      addBooking({ ...input, title: 'B' }),
      cancelBooking(doomed.id),
    ]);

    expect((await getBookings()).map((b) => b.title).sort()).toEqual(['A', 'B', kept.title]);
  });

  it('treats corrupt storage as empty instead of crashing', async () => {
    await AsyncStorage.setItem('bookings:v1', '{not json');
    expect(await getBookings()).toEqual([]);
  });
});
