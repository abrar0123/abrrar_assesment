import { formatLongDate, formatShortDate, parseDate, toISODate } from '../dates';

describe('dates', () => {
  it('parses TMDb dates as local dates (no time-zone shift)', () => {
    const d = parseDate('2021-12-22');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2021, 11, 22]);
  });

  it('formats long and short labels like the design', () => {
    expect(formatLongDate('2021-12-22')).toBe('December 22, 2021');
    expect(formatShortDate(new Date(2021, 2, 5))).toBe('5 Mar');
  });

  it('round-trips ISO dates', () => {
    expect(toISODate(parseDate('2026-01-09'))).toBe('2026-01-09');
  });
});
