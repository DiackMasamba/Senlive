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
    <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
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
            <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="button">
              <View style={styles.centerButton}>
                <Ionicons name="radio" size={34} color={colors.navy} />
              </View>
              <Text style={[styles.label, styles.centerLabel]}>{meta.label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="button">
            <Ionicons
              name={focused ? meta.iconActive : meta.icon}
              size={28}
              color={focused ? colors.yellow : colors.white}
            />
            <Text numberOfLines={1} style={[styles.label, focused && { color: colors.yellow }]}>{meta.label}</Text>
          </Pressable>
        );
      })}
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
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 12,
  },
  item: { flex: 1, alignItems: 'center', gap: 6 },
  label: { color: colors.white, fontSize: 11.5 },
  centerButton: {
    width: 76,
    height: 76,
    marginTop: -46,
    borderRadius: 26,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
    borderWidth: 4,
    borderColor: colors.white,
  },
  centerLabel: { marginTop: -2 },
});
