import { useWindowDimensions } from 'react-native';
import { spacing } from '@/src/theme';

const TABLET_MIN_WIDTH = 600;

// Layout facts derived from the current window, so screens adapt on rotation and on tablets.
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= TABLET_MIN_WIDTH;

  // How many columns of at least `minItemWidth` fit in the screen's content width.
  const columnsFor = (minItemWidth: number, gap: number = spacing.screen) =>
    Math.max(1, Math.floor((width - spacing.screen * 2 + gap) / (minItemWidth + gap)));

  return { width, height, isLandscape, isTablet, columnsFor };
}
