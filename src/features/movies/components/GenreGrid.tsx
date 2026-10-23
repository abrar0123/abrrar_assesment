import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Genre } from '@/src/api/tmdb';
import { chunk } from '@/src/utils/arrays';
import { spacing } from '@/src/theme';
import { GenreTile } from './GenreTile';
import { GenreTileSkeletons } from './MovieSkeletons';

interface Props {
  genres: Genre[];
  images: Record<number, string | null>;
  loading: boolean;
  columns: number;
  bottomInset: number;
  onPress: (genre: Genre) => void;
}

export function GenreGrid({ genres, images, loading, columns, bottomInset, onPress }: Props) {
  const rows = useMemo(() => chunk(genres, columns), [genres, columns]);

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => String(row[0].id)}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      ItemSeparatorComponent={Separator}
      renderItem={({ item: row }) => (
        <View style={styles.row}>
          {row.map((g) => (
            <GenreTile key={g.id} genre={g} imagePath={images[g.id]} onPress={onPress} />
          ))}
          {/* Pad a short last row so its tiles keep the same width as the others. */}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <View key={i} style={styles.filler} />
          ))}
        </View>
      )}
      ListEmptyComponent={loading ? <GenreTileSkeletons columns={columns} /> : null}
    />
  );
}

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  content: { padding: spacing.screen },
  row: { flexDirection: 'row', gap: 10 },
  filler: { flex: 1 },
  separator: { height: 10 },
});
