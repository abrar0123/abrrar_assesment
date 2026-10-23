import { Stack } from 'expo-router';
import { colors } from '@/src/theme';

// Nested stack so search results keep the tab bar visible, as in the design.
export default function WatchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
  );
}
