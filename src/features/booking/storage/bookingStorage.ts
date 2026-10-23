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

// Each change reads, edits and rewrites the whole list, so overlapping changes would
// overwrite each other. Run them one at a time, in the order they were requested.
let queue: Promise<unknown> = Promise.resolve();

function updateBookings<T>(change: (list: Booking[]) => { list: Booking[]; result: T }): Promise<T> {
  const run = queue.then(async () => {
    const { list, result } = change(await getBookings());
    await writeBookings(list);
    return result;
  });
  queue = run.catch(() => {}); // a failed write must not block later ones
  return run;
}

export async function addBooking(input: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  const booking: Booking = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  return updateBookings((list) => ({ list: [booking, ...list], result: booking }));
}

export function cancelBooking(id: string): Promise<void> {
  return updateBookings((list) => ({ list: list.filter((b) => b.id !== id), result: undefined }));
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
