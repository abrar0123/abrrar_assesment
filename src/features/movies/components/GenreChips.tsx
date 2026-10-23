import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Genre } from '@/src/api/tmdb';
import { colors, fonts, genreChipColors } from '@/src/theme';

export function GenreChips({ genres }: { genres: Genre[] }) {
  return (
    <View style={styles.chips}>
      {genres.map((g, i) => (
        <View
          key={g.id}
          style={[styles.chip, { backgroundColor: genreChipColors[i % genreChipColors.length] }]}
        >
          <Text style={styles.text}>{g.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontFamily: fonts.semibold, fontSize: 12, color: colors.white },
});
