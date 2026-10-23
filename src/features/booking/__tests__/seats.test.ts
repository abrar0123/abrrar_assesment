import { HALLS, Seat, buildSeatMap } from '../data/cinema';
import { markBooked, sortSeats, summarizeBookedSeats, totalPrice } from '../utils/seats';

const seat = (row: number, number: number, kind: Seat['kind'] = 'regular'): Seat => ({
  id: `${row}-${number}`,
  row,
  number,
  kind,
  available: true,
});

describe('seat helpers', () => {
  it('marks previously booked seats as unavailable', () => {
    const rows = markBooked(buildSeatMap('seed'), new Set(['3-4']));
    const target = rows[2].blocks.flat().find((s) => s.id === '3-4');
    expect(target?.available).toBe(false);
  });

  it('returns the same rows when nothing is booked', () => {
    const rows = buildSeatMap('seed');
    expect(markBooked(rows, new Set())).toBe(rows);
  });

  it('sorts front-to-back, then left-to-right', () => {
    expect(sortSeats([seat(5, 2), seat(1, 9), seat(5, 1)]).map((s) => s.id)).toEqual(['1-9', '5-1', '5-2']);
  });

  it('totals regular and VIP prices', () => {
    const hall = HALLS[0]; // $50 regular, $150 VIP
    expect(totalPrice([seat(5, 6), seat(10, 7, 'vip')], hall)).toBe(200);
  });

  it('summarizes booked seats for the dashboard', () => {
    expect(summarizeBookedSeats([seat(5, 6), seat(10, 7, 'vip')])).toBe('2 seats (1 VIP) · R5-6, R10-7');
    expect(summarizeBookedSeats([seat(3, 1)])).toBe('1 seat · R3-1');
  });
});
