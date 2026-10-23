import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/src/components/Skeleton';
import { chunk } from '@/src/utils/arrays';
import { spacing } from '@/src/theme';
import { MOVIE_CARD_HEIGHT } from './MovieCard';

// Placeholders that match the real layouts, so loading never looks like a blank or broken screen.

function SkeletonGrid({
  count,
  columns,
  gap,
  height,
}: {
  count: number;
  columns: number;
  gap: number;
  height: number;
}) {
  const cells = Array.from({ length: count }, (_, i) => i);
  return (
    <View style={{ gap }}>
      {chunk(cells, columns).map((row, r) => (
        <View key={r} style={[styles.row, { gap }]}>
          {Array.from({ length: columns }, (_, c) => (
            <View key={c} style={styles.cell}>
              {row[c] !== undefined ? <Skeleton height={height} /> : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export const MovieCardSkeletons = ({ columns = 1 }: { columns?: number }) => (
  <View accessibilityLabel="Loading movies">
    <SkeletonGrid count={4 * columns} columns={columns} gap={spacing.screen} height={MOVIE_CARD_HEIGHT} />
  </View>
);

export const GenreTileSkeletons = ({ columns = 2 }: { columns?: number }) => (
  <View accessibilityLabel="Loading genres">
    <SkeletonGrid count={5 * columns} columns={columns} gap={10} height={100} />
  </View>
);

export function MovieRowSkeletons({ count = 5 }: { count?: number }) {
  return (
    <View accessibilityLabel="Loading results">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.listRow}>
          <Skeleton width={130} height={100} />
          <View style={styles.lines}>
            <Skeleton width="70%" height={16} radius={4} />
            <Skeleton width="35%" height={12} radius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { flex: 1 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  lines: { flex: 1, marginLeft: 21, gap: 8 },
});
