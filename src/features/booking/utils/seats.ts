import { Hall, Seat, SeatRow, seatPrice } from '../data/cinema';

export const MAX_SEATS_PER_BOOKING = 10;

// Marks seats from earlier bookings as unavailable.
export function markBooked(rows: SeatRow[], bookedIds: Set<string>): SeatRow[] {
  if (bookedIds.size === 0) return rows;
  return rows.map((r) => ({
    ...r,
    blocks: r.blocks.map((block) => block.map((s) => (bookedIds.has(s.id) ? { ...s, available: false } : s))),
  }));
}

// Front-to-back, left-to-right — the order seats are listed in chips and receipts.
export const sortSeats = (seats: Seat[]) => [...seats].sort((a, b) => a.row - b.row || a.number - b.number);

export const totalPrice = (seats: Seat[], hall: Hall) =>
  seats.reduce((sum, s) => sum + seatPrice(s, hall), 0);

export const describeSeats = (seats: Seat[]) => seats.map((s) => `Row ${s.row} Seat ${s.number}`).join('\n');

// "2 seats (1 VIP) · R5-6, R10-7"
export function summarizeBookedSeats(seats: Pick<Seat, 'row' | 'number' | 'kind'>[]) {
  const count = `${seats.length} ${seats.length === 1 ? 'seat' : 'seats'}`;
  const vip = seats.filter((s) => s.kind === 'vip').length;
  const list = seats.map((s) => `R${s.row}-${s.number}`).join(', ');
  return `${count}${vip > 0 ? ` (${vip} VIP)` : ''} · ${list}`;
}
