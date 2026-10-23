import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Skeleton } from '@/src/components/Skeleton';
import { colors } from '@/src/theme';

// Same shape as the detail screen (poster, then genres and overview) while it loads.
export function MovieDetailSkeleton({ landscape }: { landscape: boolean }) {
  const { width, height } = useWindowDimensions();

  const details = (
    <View style={styles.body}>
      <Skeleton width={90} height={18} radius={4} />
      <View style={styles.chips}>
        {[70, 60, 80].map((w) => (
          <Skeleton key={w} width={w} height={24} radius={16} />
        ))}
      </View>
      <Skeleton width={110} height={18} radius={4} style={styles.overviewTitle} />
      {[100, 95, 98, 60].map((w, i) => (
        <Skeleton key={i} width={`${w}%`} height={12} radius={4} style={styles.line} />
      ))}
    </View>
  );

  return (
    <View
      style={[styles.container, landscape && styles.row]}
      accessibilityLabel="Loading movie"
      accessibilityRole="progressbar"
    >
      <Skeleton
        radius={0}
        width={landscape ? '45%' : '100%'}
        height={landscape ? '100%' : Math.min(width * 1.16, height * 0.6)}
      />
      {details}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row' },
  body: { flex: 1, paddingHorizontal: 40, paddingTop: 27 },
  chips: { flexDirection: 'row', gap: 6, marginTop: 14 },
  overviewTitle: { marginTop: 40 },
  line: { marginTop: 10 },
});
