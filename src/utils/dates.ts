const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// TMDb dates are "YYYY-MM-DD"; parse as a local date so the day never shifts with time zone.
export function parseDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export const formatLongDate = (value: string | Date) => {
  const date = typeof value === 'string' ? parseDate(value) : value;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const formatShortDate = (date: Date) => `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;

export const toISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
