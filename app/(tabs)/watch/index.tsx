import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Genre, Movie, getUpcoming } from '@/src/api/tmdb';
import { movieKeys, staleTimes } from '@/src/api/query';
import {
  GenreGrid,
  MovieCard,
  MovieCardSkeletons,
  MovieRow,
  MovieRowSkeletons,
  SearchBar,
  useGenreImages,
  useGenres,
  useMovieSearch,
  usePagedMovies,
} from '@/src/features/movies';
import { EmptyView, ErrorView } from '@/src/components/StatusViews';
import { SectionLabel } from '@/src/components/SectionLabel';
import { useResponsive } from '@/src/hooks/useResponsive';
import { colors, fonts, spacing } from '@/src/theme';

const CARD_MIN_WIDTH = 320;
const GENRE_MIN_WIDTH = 150;
const RESULT_MIN_WIDTH = 340;

// Watch tab: upcoming movies, or — in search mode — a genre grid / live top results.
export default function WatchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listBottom = useBottomTabBarHeight() + spacing.screen;
  const { columnsFor } = useResponsive();
  const cardColumns = columnsFor(CARD_MIN_WIDTH);
  const resultColumns = columnsFor(RESULT_MIN_WIDTH);
  const genreColumns = Math.max(2, columnsFor(GENRE_MIN_WIDTH, 10));

  const [searchMode, setSearchMode] = useState(false);
  const search = useMovieSearch();
  const upcoming = usePagedMovies({
    queryKey: movieKeys.upcoming(),
    fetchPage: getUpcoming,
    staleTime: staleTimes.upcoming,
  });
  const genres = useGenres();
  const genreImages = useGenreImages(genres.genres, searchMode);

  const openMovie = useCallback((m: Movie) => router.push(`/movie/${m.id}`), [router]);
  const openGenre = useCallback(
    (g: Genre) =>
      router.push({ pathname: '/watch/results', params: { genreId: String(g.id), genreName: g.name } }),
    [router],
  );

  const submitSearch = () => {
    const q = search.query.trim();
    if (!q) return;
    Keyboard.dismiss();
    router.push({ pathname: '/watch/results', params: { q } });
  };

  // First tap clears the text; a second tap leaves search mode.
  const closeSearch = () => {
    if (search.query) return search.clear();
    Keyboard.dismiss();
    setSearchMode(false);
  };

  const renderUpcoming = () => {
    if (upcoming.error) return <ErrorView message={upcoming.error} onRetry={upcoming.refresh} />;
    return (
      <FlatList
        key={`upcoming-${cardColumns}`} // numColumns can't change on the fly
        data={upcoming.movies}
        numColumns={cardColumns}
        keyExtractor={(m) => String(m.id)}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <MovieCard movie={item} onPress={openMovie} />
          </View>
        )}
        columnWrapperStyle={cardColumns > 1 ? styles.columnGap : undefined}
        ItemSeparatorComponent={CardSeparator}
        contentContainerStyle={[styles.list, { paddingBottom: listBottom }]}
        onEndReached={upcoming.loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={upcoming.refreshing} onRefresh={upcoming.refresh} />}
        ListEmptyComponent={
          upcoming.loading ? (
            <MovieCardSkeletons columns={cardColumns} />
          ) : (
            <EmptyView message="No upcoming movies right now." />
          )
        }
        ListFooterComponent={
          upcoming.loadingMore ? <ActivityIndicator style={styles.footer} color={colors.accent} /> : null
        }
      />
    );
  };

  const renderSearch = () => {
    if (!search.debouncedQuery) {
      if (genres.error) return <ErrorView message={genres.error} onRetry={genres.retry} />;
      return (
        <GenreGrid
          genres={genres.genres}
          images={genreImages}
          loading={genres.loading}
          columns={genreColumns}
          bottomInset={listBottom}
          onPress={openGenre}
        />
      );
    }

    if (search.error) return <ErrorView message={search.error} onRetry={search.retry} />;
    return (
      <FlatList
        key={`results-${resultColumns}`}
        data={search.results}
        numColumns={resultColumns}
        keyExtractor={(m) => String(m.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.list, { paddingBottom: listBottom }]}
        columnWrapperStyle={resultColumns > 1 ? styles.columnGap : undefined}
        ListHeaderComponent={<SectionLabel>Top Results</SectionLabel>}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <MovieRow movie={item} genres={genres.genres} onPress={openMovie} />
          </View>
        )}
        ListEmptyComponent={
          search.loading ? (
            <MovieRowSkeletons />
          ) : (
            <EmptyView
              icon="search-outline"
              message={`No movies match “${search.debouncedQuery}”. Try a different title.`}
            />
          )
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {searchMode ? (
          <SearchBar
            value={search.query}
            onChangeText={search.setQuery}
            onSubmit={submitSearch}
            onClose={closeSearch}
            loading={search.isSearching}
          />
        ) : (
          <View style={styles.titleBar}>
            <Text style={styles.title} accessibilityRole="header">
              Watch
            </Text>
            <Pressable onPress={() => setSearchMode(true)} hitSlop={10} accessibilityLabel="Search movies">
              <Ionicons name="search" size={22} color={colors.text} />
            </Pressable>
          </View>
        )}
      </View>
      {searchMode ? renderSearch() : renderUpcoming()}
    </View>
  );
}

const CardSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.surface },
  titleBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
  },
  title: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  list: { padding: spacing.screen, flexGrow: 1 },
  cell: { flex: 1 },
  columnGap: { gap: spacing.screen },
  separator: { height: 20 },
  footer: { marginTop: 20 },
});
