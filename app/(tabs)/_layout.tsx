import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: string }) => <Ionicons name={icon} size={20} color={color} />,
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="watch"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.tabInactive,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          borderTopLeftRadius: 27,
          borderTopRightRadius: 27,
          height: 64 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom || 10,
        },
        tabBarLabelStyle: { fontFamily: fonts.regular, fontSize: 10, marginTop: 4 },
      }}
    >
      <Tabs.Screen name="dashboard" options={tab('Dashboard', 'grid')} />
      <Tabs.Screen name="watch" options={tab('Watch', 'play-circle')} />
      <Tabs.Screen name="media-library" options={tab('Media Library', 'folder')} />
      <Tabs.Screen name="more" options={tab('More', 'list')} />
    </Tabs>
  );
}
