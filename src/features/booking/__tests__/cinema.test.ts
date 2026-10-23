import {
  HALLS,
  SHOWING_DAYS,
  VIP_MULTIPLIER,
  buildSeatMap,
  findHall,
  seatPrice,
  showingDates,
} from '../data/cinema';
import { toISODate } from '@/src/utils/dates';

describe('buildSeatMap', () => {
  it('is deterministic for the same show', () => {
    expect(buildSeatMap('42-2026-10-22-h1')).toEqual(buildSeatMap('42-2026-10-22-h1'));
  });

  it('differs between shows', () => {
    expect(buildSeatMap('42-2026-10-22-h1')).not.toEqual(buildSeatMap('42-2026-10-22-h2'));
  });

  it('has 10 rows, numbers seats per row, and makes only the last row VIP', () => {
    const rows = buildSeatMap('seed');
    expect(rows).toHaveLength(10);

    rows.forEach(({ row, blocks }) => {
      const seats = blocks.flat();
      expect(seats.map((s) => s.number)).toEqual(seats.map((_, i) => i + 1));
      expect(new Set(seats.map((s) => s.kind))).toEqual(new Set([row === 10 ? 'vip' : 'regular']));
    });
  });
});

describe('showingDates', () => {
  it('starts today for released movies', () => {
    const dates = showingDates('2000-01-01');
    expect(dates).toHaveLength(SHOWING_DAYS);
    expect(toISODate(dates[0])).toBe(toISODate(new Date()));
  });

  it('starts on the release date for upcoming movies', () => {
    const next = new Date();
    next.setFullYear(next.getFullYear() + 1);
    const release = toISODate(next);
    expect(toISODate(showingDates(release)[0])).toBe(release);
  });
});

describe('pricing and halls', () => {
  it('charges VIP seats a multiple of the hall price', () => {
    const hall = HALLS[0];
    const base = { id: '1-1', row: 1, number: 1, available: true };
    expect(seatPrice({ ...base, kind: 'regular' }, hall)).toBe(hall.price);
    expect(seatPrice({ ...base, kind: 'vip' }, hall)).toBe(hall.price * VIP_MULTIPLIER);
  });

  it('falls back to the first hall for unknown ids', () => {
    expect(findHall('h2')).toBe(HALLS[1]);
    expect(findHall('nope')).toBe(HALLS[0]);
    expect(findHall(undefined)).toBe(HALLS[0]);
  });
});
