import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Genre, imageUrl } from '@/src/api/tmdb';
import { CachedImage } from '@/src/components/CachedImage';
import { colors, fonts } from '@/src/theme';

interface Props {
  genre: Genre;
  imagePath?: string | null;
  onPress: (genre: Genre) => void;
}

export const GenreTile = memo(function GenreTile({ genre, imagePath, onPress }: Props) {
  const uri = imageUrl(imagePath, 'w300');
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(genre)}
      style={styles.tile}
      accessibilityRole="button"
      accessibilityLabel={genre.name}
    >
      <CachedImage uri={uri} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.gradient} />
      <Text style={styles.name} numberOfLines={1}>
        {genre.name}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.tabBar,
    justifyContent: 'flex-end',
  },
  gradient: { ...StyleSheet.absoluteFillObject, top: '40%' },
  name: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 16,
    marginHorizontal: 10,
    marginBottom: 16,
  },
});
