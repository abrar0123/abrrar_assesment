import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Genre, Movie, imageUrl } from '@/src/api/tmdb';
import { CachedImage } from '@/src/components/CachedImage';
import { colors, fonts } from '@/src/theme';

interface Props {
  movie: Movie;
  genres: Genre[];
  onPress: (movie: Movie) => void;
}

// Compact search-result row: thumbnail, title, first genre and a "more" affordance.
export const MovieRow = memo(function MovieRow({ movie, genres, onPress }: Props) {
  const uri = imageUrl(movie.backdrop_path ?? movie.poster_path, 'w300');
  const genre = genres.find((g) => g.id === movie.genre_ids?.[0])?.name;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(movie)}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={movie.title}
    >
      <View style={styles.thumb}>
        <CachedImage uri={uri} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        {genre ? <Text style={styles.genre}>{genre}</Text> : null}
      </View>
      <Ionicons name="ellipsis-horizontal" size={22} color={colors.accent} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  thumb: {
    width: 130,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.textFaint,
  },
  info: { flex: 1, marginHorizontal: 21 },
  title: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  genre: { fontFamily: fonts.medium, fontSize: 12, color: colors.textFaint, marginTop: 4 },
});
