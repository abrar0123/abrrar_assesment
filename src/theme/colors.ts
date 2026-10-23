// Palette taken from the design. Use these tokens instead of hex values in components.
export const colors = {
  background: '#F6F6FA',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',

  text: '#202C43',
  textMuted: '#8F8F8F',
  textFaint: '#DBDBDF',
  placeholder: 'rgba(32,44,67,0.3)',

  accent: '#61C3F2',
  danger: '#E26CA5',

  tabBar: '#2E2739',
  tabInactive: '#827D88',

  input: '#EFEFEF',
  border: '#EFEFEF',
  hairline: 'rgba(0,0,0,0.11)',
  divider: 'rgba(0,0,0,0.05)',
  chip: 'rgba(166,166,166,0.1)',
  track: 'rgba(166,166,166,0.25)',
  skeleton: '#E4E4EA',

  seatSelected: '#CD9D0F',
  seatVip: '#564CA3',
  seatRegular: '#61C3F2',
  seatUnavailable: '#A6A6A6',
} as const;

// Chip colors for genres on the detail screen, cycled in order.
export const genreChipColors = ['#15D2BC', '#E26CA5', '#564CA3', '#CD9D0F'] as const;
