import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

const tabs: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  index: { label: 'Accueil', icon: 'home-outline', iconActive: 'home' },
  explorer: { label: 'Explorer', icon: 'compass-outline', iconActive: 'compass' },
  golive: { label: 'Go Live', icon: 'radio-outline', iconActive: 'radio' },
  abonnement: { label: 'Premium', icon: 'star-outline', iconActive: 'star' },
  compte: { label: 'Mon compte', icon: 'person-outline', iconActive: 'person' },
};

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 10 }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = tabs[route.name];
          if (!meta) return null;
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (route.name === 'golive') {
            return (
              <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="button" accessibilityLabel={meta.label}>
                <View style={[styles.centerButton, focused && styles.centerFocused]}>
                  <Ionicons name="radio" size={26} color={focused ? colors.white : colors.navy} />
                  <View style={styles.liveDot} />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="button">
              <View style={[styles.iconPill, focused && styles.iconPillActive]}>
                <Ionicons name={focused ? meta.iconActive : meta.icon} size={21} color={focused ? colors.white : colors.inactive} />
              </View>
              <Text numberOfLines={1} style={[styles.label, focused && styles.labelActive]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explorer" />
      <Tabs.Screen name="golive" />
      <Tabs.Screen name="abonnement" />
      <Tabs.Screen name="compte" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingTop: 6, backgroundColor: 'transparent' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 66,
    paddingHorizontal: 4,
    borderRadius: 33,
    backgroundColor: colors.navy,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconPill: { width: 46, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconPillActive: { backgroundColor: 'rgba(255,255,255,0.16)' },
  label: { color: colors.inactive, fontSize: 10.5 },
  labelActive: { color: colors.white, fontWeight: '600' },
  centerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFocused: { backgroundColor: colors.live },
  liveDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.live,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
