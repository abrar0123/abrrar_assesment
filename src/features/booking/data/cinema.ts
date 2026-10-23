import { parseDate } from '@/src/utils/dates';

// TMDb has no showtime data, so halls, dates and seat availability are generated locally.
// Availability is seeded by movie + date + hall so it stays stable between visits.

export interface Hall {
  id: string;
  time: string;
  name: string;
  shortName: string;
  price: number;
  bonus: number;
}

export type SeatKind = 'regular' | 'vip';

export interface Seat {
  id: string;
  row: number;
  number: number;
  kind: SeatKind;
  available: boolean;
}

// Each row is split into blocks separated by aisles.
export type SeatRow = { row: number; blocks: Seat[][] };

export const HALLS: Hall[] = [
  { id: 'h1', time: '12:30', name: 'Cinetech + Hall 1', shortName: 'Hall 1', price: 50, bonus: 2500 },
  { id: 'h2', time: '13:30', name: 'Cinetech + Hall 2', shortName: 'Hall 2', price: 75, bonus: 3000 },
  { id: 'h3', time: '16:00', name: 'Cinetech + Hall 3', shortName: 'Hall 3', price: 60, bonus: 2800 },
  { id: 'h4', time: '19:45', name: 'Cinetech + Hall 4', shortName: 'Hall 4', price: 90, bonus: 3500 },
];

// Unknown ids (e.g. a stale deep link) fall back to the first hall.
export const findHall = (id: string | undefined) => HALLS.find((h) => h.id === id) ?? HALLS[0];

export const VIP_MULTIPLIER = 3;

// [left, center, right] seats per row; the last row is VIP.
const ROW_SHAPE: [number, number, number][] = [
  [2, 12, 2],
  [4, 14, 4],
  [4, 14, 4],
  [4, 14, 4],
  [5, 14, 5],
  [5, 14, 5],
  [5, 14, 5],
  [5, 14, 5],
  [5, 14, 5],
  [5, 14, 5],
];

export const SHOWING_DAYS = 7;

// Showing dates start at the release date, or today if the movie is already out.
export function showingDates(releaseDate?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let start = today;
  if (releaseDate) {
    const release = parseDate(releaseDate);
    if (release > today) start = release;
  }
  return Array.from({ length: SHOWING_DAYS }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}

// Small deterministic PRNG (mulberry32) so the same show always has the same taken seats.
function seededRandom(seedText: string) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) | 0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSeatMap(seedText: string): SeatRow[] {
  const random = seededRandom(seedText);
  return ROW_SHAPE.map((shape, rowIndex) => {
    const row = rowIndex + 1;
    const kind: SeatKind = row === ROW_SHAPE.length ? 'vip' : 'regular';
    let number = 0;
    const blocks = shape.map((count) =>
      Array.from({ length: count }, () => {
        number += 1;
        return { id: `${row}-${number}`, row, number, kind, available: random() > 0.3 };
      }),
    );
    return { row, blocks };
  });
}

export const seatPrice = (seat: Seat, hall: Hall) =>
  seat.kind === 'vip' ? hall.price * VIP_MULTIPLIER : hall.price;
