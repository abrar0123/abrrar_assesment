import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GenreChips, MovieDetailSkeleton, MovieHero, useMovieDetails } from '@/src/features/movies';
import { ErrorView } from '@/src/components/StatusViews';
import { useResponsive } from '@/src/hooks/useResponsive';
import { colors, fonts } from '@/src/theme';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height, isLandscape } = useResponsive();
  const { data, loading, error, retry } = useMovieDetails(id);

  if (!data) {
    if (loading) return <MovieDetailSkeleton landscape={isLandscape} />;
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={router.back} style={styles.errorBack} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <ErrorView message={error ?? "This movie couldn't be found."} onRetry={retry} />
      </View>
    );
  }

  const { movie, trailer, posterPath, releaseLabel } = data;

  const getTickets = () =>
    router.push({
      pathname: '/booking/[id]',
      params: {
        id: String(movie.id),
        title: movie.title,
        releaseDate: movie.release_date,
        posterPath: movie.poster_path ?? '',
      },
    });

  const watchTrailer = () =>
    trailer &&
    router.push({ pathname: '/trailer/[id]', params: { id: String(movie.id), videoKey: trailer.key } });

  const hero = (
    <MovieHero
      title={movie.title}
      posterPath={posterPath}
      releaseLabel={releaseLabel}
      hasTrailer={!!trailer}
      onBack={router.back}
      onGetTickets={getTickets}
      onWatchTrailer={watchTrailer}
      // Portrait: full-width poster on top. Landscape: poster column beside the details.
      style={isLandscape ? styles.heroLandscape : { height: Math.min(width * 1.16, height * 0.6) }}
    />
  );

  const body = (
    <View style={styles.body}>
      {movie.genres.length > 0 ? (
        <>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Genres
          </Text>
          <GenreChips genres={movie.genres} />
          <View style={styles.divider} />
        </>
      ) : null}

      <Text style={styles.sectionTitle} accessibilityRole="header">
        Overview
      </Text>
      <Text style={styles.overview}>{movie.overview || 'No overview available for this movie yet.'}</Text>
    </View>
  );

  return (
    <View style={[styles.container, isLandscape && styles.row]}>
      <StatusBar style="light" />
      {isLandscape ? (
        <>
          {hero}
          <ScrollView
            style={styles.flex}
            contentContainerStyle={{
              paddingTop: insets.top,
              paddingBottom: insets.bottom + 24,
              paddingRight: insets.right,
            }}
          >
            {body}
          </ScrollView>
        </>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} bounces={false}>
          {hero}
          {body}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  heroLandscape: { width: '45%', height: '100%' },
  errorBack: { padding: 20 },
  body: { paddingHorizontal: 40, paddingTop: 27 },
  sectionTitle: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, marginBottom: 14 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 22 },
  overview: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 20, color: colors.textMuted },
});
