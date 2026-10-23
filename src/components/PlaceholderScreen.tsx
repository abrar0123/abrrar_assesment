import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from './ScreenHeader';
import { colors, fonts } from '@/src/theme';

// Stand-in for tabs that are outside the scope of this assessment.
export function PlaceholderScreen({ title, icon }: { title: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.container}>
      <ScreenHeader title={title} />
      <View style={styles.body}>
        <Ionicons name={icon} size={44} color={colors.textFaint} />
        <Text style={styles.text}>{title} is coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  text: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 12 },
});
