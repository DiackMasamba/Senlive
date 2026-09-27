import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../context/session';
import { colors, radius } from '../theme';

export function Header() {
  const insets = useSafeAreaInsets();
  const { user, openLogin, openMenu } = useSession();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Pressable onPress={openMenu} hitSlop={12} accessibilityLabel="Ouvrir le menu">
        <Ionicons name="menu" size={34} color={colors.navy} />
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.welcome}>{user ? 'Salut !' : 'Bienvenue !'}</Text>
        {user ? (
          <Text style={styles.phone}>{user.phone}</Text>
        ) : (
          <Pressable style={styles.loginPill} onPress={openLogin}>
            <Ionicons name="person-outline" size={16} color={colors.navy} />
            <Text style={styles.loginText}>Connexion</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable hitSlop={8} accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={27} color={colors.navy} />
        </Pressable>
        <Pressable hitSlop={8} onPress={() => router.navigate('/explorer')} accessibilityLabel="Rechercher">
          <Ionicons name="search-outline" size={27} color={colors.navy} />
        </Pressable>
        <Pressable hitSlop={8} onPress={() => router.navigate('/explorer')} accessibilityLabel="Catégories">
          <Ionicons name="grid-outline" size={25} color={colors.navy} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.yellow,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 16,
  },
  center: { flex: 1 },
  welcome: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  phone: { color: colors.navy, fontSize: 15, fontWeight: '600', marginTop: 2 },
  loginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 4,
  },
  loginText: { color: colors.navy, fontSize: 15, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 14, alignItems: 'center' },
});
