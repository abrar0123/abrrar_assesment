import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Movie, discoverByGenre, searchMovies } from '@/src/api/tmdb';
import { movieKeys, staleTimes } from '@/src/api/query';
import { MovieRow, MovieRowSkeletons, useGenres, usePagedMovies } from '@/src/features/movies';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { EmptyView, ErrorView } from '@/src/components/StatusViews';
import { useResponsive } from '@/src/hooks/useResponsive';
import { colors, spacing } from '@/src/theme';

const RESULT_MIN_WIDTH = 340;

type Params = { q?: string; genreId?: string; genreName?: string };

// Full, paginated result list for either a search query (`q`) or a genre (`genreId`).
export default function ResultsScreen() {
  const router = useRouter();
  const listBottom = useBottomTabBarHeight() + spacing.screen;
  const columns = useResponsive().columnsFor(RESULT_MIN_WIDTH);
  const { q = '', genreId, genreName } = useLocalSearchParams<Params>();

  const list = usePagedMovies(
    genreId
      ? {
          queryKey: movieKeys.byGenre(Number(genreId)),
          fetchPage: (page, signal) => discoverByGenre(Number(genreId), page, signal),
          staleTime: staleTimes.upcoming,
        }
      : {
          queryKey: movieKeys.search(q),
          fetchPage: (page, signal) => searchMovies(q, page, signal),
          staleTime: staleTimes.search,
        },
  );
  const { genres } = useGenres();

  const openMovie = useCallback((m: Movie) => router.push(`/movie/${m.id}`), [router]);

  const loadingTitle = genreName ? 'Loading…' : 'Searching…';
  const title = list.loading
    ? loadingTitle
    : `${list.total.toLocaleString()} ${list.total === 1 ? 'Result' : 'Results'} Found`;

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} subtitle={genreName} onBack={router.back} />
      {list.error ? (
        <ErrorView message={list.error} onRetry={list.refresh} />
      ) : (
        <FlatList
          key={`results-${columns}`} // numColumns can't change on the fly
          data={list.movies}
          numColumns={columns}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={[styles.list, { paddingBottom: listBottom }]}
          columnWrapperStyle={columns > 1 ? styles.columnGap : undefined}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <MovieRow movie={item} genres={genres} onPress={openMovie} />
            </View>
          )}
          onEndReached={list.loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
          ListEmptyComponent={
            list.loading ? (
              <MovieRowSkeletons />
            ) : (
              <EmptyView
                icon="search-outline"
                message={genreName ? `No ${genreName} movies found.` : `No movies match “${q}”.`}
              />
            )
          }
          ListFooterComponent={
            list.loadingMore ? <ActivityIndicator style={styles.footer} color={colors.accent} /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.screen, flexGrow: 1 },
  cell: { flex: 1 },
  columnGap: { gap: spacing.screen },
  footer: { marginTop: 20 },
});
