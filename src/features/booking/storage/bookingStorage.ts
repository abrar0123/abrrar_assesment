import AsyncStorage from '@react-native-async-storage/async-storage';
import { SeatKind } from '../data/cinema';

// Confirmed bookings are kept on-device in AsyncStorage under a single key.
const STORAGE_KEY = 'bookings:v1';

export interface BookedSeat {
  id: string;
  row: number;
  number: number;
  kind: SeatKind;
}

export interface Booking {
  id: string;
  movieId: string;
  title: string;
  posterPath: string | null;
  date: string; // YYYY-MM-DD
  hallId: string;
  hallName: string;
  time: string;
  seats: BookedSeat[];
  total: number;
  createdAt: string; // ISO timestamp
}

export async function getBookings(): Promise<Booking[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: Booking[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    // Corrupt or unreadable storage shouldn't crash the app; treat it as empty.
    return [];
  }
}

async function writeBookings(list: Booking[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function addBooking(input: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  const booking: Booking = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const list = await getBookings();
  await writeBookings([booking, ...list]);
  return booking;
}

export async function cancelBooking(id: string) {
  const list = await getBookings();
  await writeBookings(list.filter((b) => b.id !== id));
}

// Seat ids already booked by the user for one show, so they render as taken.
export async function bookedSeatIds(movieId: string, date: string, hallId: string) {
  const list = await getBookings();
  return new Set(
    list
      .filter((b) => b.movieId === movieId && b.date === date && b.hallId === hallId)
      .flatMap((b) => b.seats.map((s) => s.id)),
  );
}
