import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../context/session';
import { colors, radius } from '../theme';

type Item = { icon: keyof typeof Ionicons.glyphMap; label: string; href?: '/compte' | '/abonnement' | '/golive' };

const items: Item[] = [
  { icon: 'person-outline', label: 'Mon profil', href: '/compte' },
  { icon: 'star-outline', label: 'Mon abonnement', href: '/abonnement' },
  { icon: 'videocam-outline', label: 'Devenir créateur', href: '/golive' },
  { icon: 'settings-outline', label: 'Mes paramètres', href: '/compte' },
  { icon: 'headset-outline', label: 'Aide & Support' },
  { icon: 'thumbs-up-outline', label: "Noter l'application" },
  { icon: 'share-social-outline', label: "Partager l'application" },
];

export function SideMenu() {
  const insets = useSafeAreaInsets();
  const { menuVisible, closeMenu, user, openLogin, signOut } = useSession();

  const go = (href?: Item['href']) => {
    closeMenu();
    if (href) router.navigate(href);
  };

  return (
    <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
      <View style={styles.root}>
        <View style={styles.panel}>
          <View style={[styles.top, { paddingTop: insets.top + 20 }]}>
            <View style={styles.langPill}>
              <Text style={styles.langText}>Sénégal</Text>
              <Ionicons name="chevron-down" size={16} color={colors.navy} />
              <Text style={styles.langSep}>|</Text>
              <Text style={styles.langText}>FR</Text>
            </View>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={34} color={colors.navySoft} />
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={14} color={colors.yellow} />
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Text style={styles.guest}>{user ? user.phone : 'Invité'}</Text>
                {user ? (
                  <Pressable style={styles.loginButton} onPress={signOut}>
                    <Ionicons name="log-out-outline" size={18} color={colors.white} />
                    <Text style={styles.loginText}>Déconnexion</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.loginButton} onPress={openLogin}>
                    <Ionicons name="person-outline" size={18} color={colors.white} />
                    <Text style={styles.loginText}>Connexion</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <Text style={styles.version}>Version 1.0</Text>
          </View>
          <ScrollView contentContainerStyle={styles.list}>
            {items.map((item) => (
              <Pressable key={item.label} style={styles.row} onPress={() => go(item.href)}>
                <View style={styles.rowIcon}>
                  <Ionicons name={item.icon} size={24} color={colors.navy} />
                </View>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={22} color={colors.navy} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <Pressable style={styles.scrim} onPress={closeMenu} accessibilityLabel="Fermer le menu" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  panel: {
    width: '85%',
    maxWidth: 380,
    backgroundColor: colors.white,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  scrim: { flex: 1, backgroundColor: 'rgba(11,45,111,0.82)' },
  top: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomRightRadius: 24,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    backgroundColor: colors.yellowPale,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  langText: { color: colors.navy, fontSize: 16, fontWeight: '500' },
  langSep: { color: colors.navy, marginHorizontal: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 22 },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#DDE6F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guest: { color: colors.navy, fontSize: 17 },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loginText: { color: colors.white, fontSize: 16, fontWeight: '500' },
  version: { alignSelf: 'flex-end', color: colors.navy, fontSize: 13, marginTop: 18 },
  list: { paddingVertical: 20, paddingHorizontal: 20, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 6 },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, color: colors.navy, fontSize: 17 },
});
