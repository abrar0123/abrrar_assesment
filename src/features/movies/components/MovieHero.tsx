import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { imageUrl } from '@/src/api/tmdb';
import { CachedImage } from '@/src/components/CachedImage';
import { Button } from '@/src/components/Button';
import { colors, fonts, spacing } from '@/src/theme';

interface Props {
  title: string;
  posterPath: string | null;
  releaseLabel: string;
  hasTrailer: boolean;
  onBack: () => void;
  onGetTickets: () => void;
  onWatchTrailer: () => void;
  // Size is decided by the screen: full-width in portrait, a side panel in landscape.
  style?: StyleProp<ViewStyle>;
}

// Full-bleed poster with title, release date and the two call-to-action buttons.
export function MovieHero({
  title,
  posterPath,
  releaseLabel,
  hasTrailer,
  onBack,
  onGetTickets,
  onWatchTrailer,
  style,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.hero, style]}>
      <CachedImage uri={imageUrl(posterPath, 'w780')} />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.25, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.nav, { paddingTop: insets.top + 8, paddingLeft: 20 }]}>
        <Pressable onPress={onBack} hitSlop={12} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </Pressable>
        <Text style={styles.navTitle}>Watch</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.actions}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.date}>{releaseLabel}</Text>
          <Button title="Get Tickets" onPress={onGetTickets} style={styles.button} />
          <Button
            title={hasTrailer ? 'Watch Trailer' : 'No Trailer Available'}
            variant="outline"
            icon={<Ionicons name="play" size={14} color={colors.white} />}
            disabled={!hasTrailer}
            onPress={onWatchTrailer}
            style={[styles.button, styles.secondButton]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.tabBar, justifyContent: 'space-between', overflow: 'hidden' },
  nav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  navTitle: { fontFamily: fonts.medium, fontSize: 16, color: colors.white },
  bottom: { alignItems: 'center', paddingHorizontal: spacing.screen, paddingBottom: 34 },
  actions: { width: '100%', maxWidth: 243, alignItems: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 22, color: colors.white, textAlign: 'center' },
  date: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
    marginTop: 6,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: { alignSelf: 'stretch' },
  secondButton: { marginTop: 10 },
});
