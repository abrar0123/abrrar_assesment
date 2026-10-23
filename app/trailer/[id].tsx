import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useIsOnline } from '@/src/hooks/useIsOnline';
import { useResponsive } from '@/src/hooks/useResponsive';
import { colors, fonts } from '@/src/theme';

const ASPECT = 16 / 9;

// Full-screen trailer player. Closes itself when the video finishes, or via Done.
export default function TrailerScreen() {
  const { videoKey } = useLocalSearchParams<{ videoKey: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useResponsive();
  const online = useIsOnline();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const onChangeState = useCallback(
    (state: string) => {
      if (state === 'ended') close();
    },
    [close],
  );

  // Largest 16:9 box that fits: full width in portrait, full height in landscape.
  const playerWidth = Math.min(width, height * ASPECT);
  const playerHeight = playerWidth / ASPECT;

  const renderContent = () => {
    if (!online) {
      return <Message icon="cloud-offline-outline" text="Trailers need an internet connection." />;
    }
    if (failed || !videoKey) {
      return <Message icon="alert-circle-outline" text="This trailer can’t be played right now." />;
    }
    return (
      <View style={{ width: playerWidth, height: playerHeight }}>
        <YoutubePlayer
          width={playerWidth}
          height={playerHeight}
          videoId={videoKey}
          play
          onReady={() => setReady(true)}
          onError={() => setFailed(true)}
          onChangeState={onChangeState}
          initialPlayerParams={{ preventFullScreen: false, rel: false }}
          webViewProps={{ allowsInlineMediaPlayback: true, mediaPlaybackRequiresUserAction: false }}
        />
        {!ready ? (
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            color={colors.accent}
            accessibilityLabel="Loading trailer"
          />
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      <View style={[styles.topBar, { paddingTop: insets.top + 8, paddingLeft: 20 }]}>
        <Pressable onPress={close} hitSlop={12} style={styles.doneButton} accessibilityRole="button">
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
      <View style={styles.center}>{renderContent()}</View>
    </View>
  );
}

function Message({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.message} accessibilityRole="alert">
      <Ionicons name={icon} size={40} color={colors.white} />
      <Text style={styles.messageText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  doneButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  doneText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  message: { alignItems: 'center', gap: 12, padding: 32 },
  messageText: { fontFamily: fonts.regular, fontSize: 14, color: colors.white, textAlign: 'center' },
});
