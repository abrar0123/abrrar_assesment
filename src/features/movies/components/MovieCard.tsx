import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Movie, imageUrl } from '@/src/api/tmdb';
import { CachedImage } from '@/src/components/CachedImage';
import { colors, fonts } from '@/src/theme';

interface Props {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

export const MOVIE_CARD_HEIGHT = 180;

// Large backdrop card used on the Watch list.
export const MovieCard = memo(function MovieCard({ movie, onPress }: Props) {
  const uri = imageUrl(movie.backdrop_path ?? movie.poster_path, 'w780');
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(movie)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={movie.title}
    >
      <CachedImage uri={uri} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.gradient} />
      <Text style={styles.title} numberOfLines={1}>
        {movie.title}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    height: MOVIE_CARD_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.tabBar,
    justifyContent: 'flex-end',
  },
  gradient: { ...StyleSheet.absoluteFillObject, top: '45%' },
  title: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 18,
    marginHorizontal: 20,
    marginBottom: 20,
  },
});
