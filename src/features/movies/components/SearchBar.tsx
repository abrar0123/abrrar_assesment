import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/src/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function SearchBar({ value, onChangeText, onSubmit, onClose, loading }: Props) {
  return (
    <View style={styles.bar}>
      <Ionicons name="search" size={22} color={colors.text} />
      <TextInput
        autoFocus
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="TV shows, movies and more"
        placeholderTextColor={colors.placeholder}
        returnKeyType="go"
        autoCorrect={false}
        style={styles.input}
        accessibilityLabel="Search movies"
      />
      {loading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
      <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close search">
        <Ionicons name="close" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 52,
    marginHorizontal: spacing.screen,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    backgroundColor: colors.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
});
