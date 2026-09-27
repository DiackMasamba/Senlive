import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { Wordmark } from './Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../context/session';
import { categories } from '../data/mock';
import { colors } from '../theme';

type Href = '/compte' | '/abonnement' | '/golive' | '/explorer';
type Item = { icon: keyof typeof Ionicons.glyphMap; label: string; href?: Href };

const accountItems: Item[] = [
  { icon: 'person-outline', label: 'Mon profil', href: '/compte' },
  { icon: 'star-outline', label: 'Mon abonnement', href: '/abonnement' },
  { icon: 'videocam-outline', label: 'Devenir créateur', href: '/golive' },
  { icon: 'settings-outline', label: 'Mes paramètres', href: '/compte' },
];

const moreItems: Item[] = [
  { icon: 'thumbs-up-outline', label: "Noter l'application" },
  { icon: 'share-social-outline', label: "Partager l'application" },
];

// Menu latéral compact, inspiré de Jumia : sections en capitales et lignes serrées.
export function SideMenu() {
  const insets = useSafeAreaInsets();
  const { menuVisible, closeMenu, user, openLogin, signOut } = useSession();

  const go = (href?: Href) => {
    closeMenu();
    if (href) router.navigate(href);
  };

  const Row = ({ item }: { item: Item }) => (
    <Pressable style={styles.row} onPress={() => go(item.href)}>
      <Ionicons name={item.icon} size={21} color={colors.navy} />
      <Text style={styles.rowLabel}>{item.label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
      <View style={styles.root}>
        <View style={[styles.panel, { paddingTop: insets.top }]}>
          <View style={styles.top}>
            <Pressable onPress={closeMenu} hitSlop={10} accessibilityLabel="Fermer le menu">
              <Ionicons name="close" size={26} color={colors.navy} />
            </Pressable>
            <Wordmark />
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
            <Pressable style={styles.sectionLink}>
              <Text style={styles.sectionTitle}>BESOIN D'AIDE ?</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.navy} />
            </Pressable>

            <Pressable style={styles.sectionLink} onPress={() => (user ? go('/compte') : openLogin())}>
              <Text style={styles.sectionTitle}>{user ? `COMPTE ${user.phone}` : 'VOTRE COMPTE SENLIVE'}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.navy} />
            </Pressable>
            {accountItems.map((item) => (
              <Row key={item.label} item={item} />
            ))}
            <Pressable style={styles.row} onPress={user ? signOut : openLogin}>
              <Ionicons name={user ? 'log-out-outline' : 'log-in-outline'} size={21} color={colors.navy} />
              <Text style={styles.rowLabel}>{user ? 'Déconnexion' : 'Connexion'}</Text>
            </Pressable>

            <View style={[styles.sectionHead, styles.divider]}>
              <Text style={styles.sectionTitle}>CATÉGORIES</Text>
              <Pressable onPress={() => go('/explorer')} hitSlop={8}>
                <Text style={styles.more}>Voir tout</Text>
              </Pressable>
            </View>
            {categories.map((c) => (
              <Row key={c.id} item={{ icon: c.icon as Item['icon'], label: c.label, href: '/explorer' }} />
            ))}

            <View style={styles.divider} />
            {moreItems.map((item) => (
              <Row key={item.label} item={item} />
            ))}
            <Text style={styles.footer}>Sénégal · Français · Version 1.0</Text>
          </ScrollView>
        </View>
        <Pressable style={styles.scrim} onPress={closeMenu} accessibilityLabel="Fermer le menu" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  panel: { width: '85%', maxWidth: 360, backgroundColor: colors.white },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 4,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, marginTop: 6 },
  sectionTitle: { color: colors.textMuted, fontSize: 12.5, fontWeight: '600', letterSpacing: 0.3 },
  more: { color: colors.navy, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 9 },
  rowLabel: { flex: 1, color: colors.navy, fontSize: 14.5 },
  footer: { color: colors.textMuted, fontSize: 12, paddingHorizontal: 18, marginTop: 14 },
});
