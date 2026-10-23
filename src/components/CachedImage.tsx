import React from 'react';
import { StyleProp, StyleSheet } from 'react-native';
import { Image, ImageStyle } from 'expo-image';

interface Props {
  uri: string | undefined;
  style?: StyleProp<ImageStyle>;
}

// expo-image with a disk cache: posters and backdrops seen once still render offline.
export function CachedImage({ uri, style = StyleSheet.absoluteFill }: Props) {
  if (!uri) return null;
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={uri}
      transition={150}
      accessible={false}
    />
  );
}
