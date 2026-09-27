import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../context/session';
import { colors } from '../theme';

// Mot-symbole compact « senlive » avec le point rouge « en direct ».
export function Wordmark() {
  return (
    <View style={styles.wordmark}>
      <Text style={styles.word}>senlive</Text>
      <View style={styles.dot} />
    </View>
  );
}

export function Header() {
  const insets = useSafeAreaInsets();
  const { user, openLogin, openMenu } = useSession();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Pressable onPress={openMenu} hitSlop={12} accessibilityLabel="Ouvrir le menu">
        <Ionicons name="menu" size={28} color={colors.navy} />
      </Pressable>

      <View style={styles.center}>
        <Wordmark />
      </View>

      <View style={styles.actions}>
        <Pressable hitSlop={8} onPress={() => router.navigate('/explorer')} accessibilityLabel="Rechercher">
          <Ionicons name="search-outline" size={25} color={colors.navy} />
        </Pressable>
        <Pressable hitSlop={8} accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={25} color={colors.navy} />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => (user ? router.navigate('/compte') : openLogin())}
          accessibilityLabel={user ? 'Mon compte' : 'Connexion'}
        >
          <Ionicons name={user ? 'person-circle-outline' : 'person-outline'} size={25} color={colors.navy} />
          {user && <View style={styles.online} />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  center: { flex: 1 },
  wordmark: { flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'flex-start' },
  word: { color: colors.navy, fontSize: 24, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.live, marginTop: 6, marginLeft: 2 },
  actions: { flexDirection: 'row', gap: 18, alignItems: 'center' },
  online: {
    position: 'absolute',
    right: -1,
    bottom: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
