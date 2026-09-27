import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/AppText';
import { Header } from '../../components/Header';
import { useSession } from '../../context/session';
import { colors, radius } from '../../theme';

export default function AccountScreen() {
  const { user, subscription, openLogin, signOut } = useSession();

  const rows: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }[] = [
    { icon: 'create-outline', label: 'Modifier mon profil' },
    { icon: 'star-outline', label: subscription ? 'Mon abonnement Premium' : 'Passer Premium', onPress: () => router.navigate('/abonnement') },
    { icon: 'videocam-outline', label: 'Devenir créateur', onPress: () => router.navigate('/golive') },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'shield-checkmark-outline', label: 'Confidentialité et blocages' },
    { icon: 'document-text-outline', label: 'Conditions générales' },
  ];

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.navySoft} />
          </View>
          <Text style={styles.name}>{user ? user.name : 'Invité'}</Text>
          <Text style={styles.phone}>{user ? user.phone : 'Connecte-toi pour suivre tes créateurs'}</Text>
          <View style={styles.counters}>
            {[
              ['0', 'Abonnés'],
              [user ? '5' : '0', 'Suivis'],
              ['0', 'Lives'],
            ].map(([n, l]) => (
              <View key={l} style={styles.counter}>
                <Text style={styles.counterValue}>{n}</Text>
                <Text style={styles.counterLabel}>{l}</Text>
              </View>
            ))}
          </View>
          {!user && (
            <Pressable style={styles.login} onPress={openLogin}>
              <Ionicons name="person-outline" size={18} color={colors.white} />
              <Text style={styles.loginText}>Connexion</Text>
            </Pressable>
          )}
        </View>

        {rows.map((r) => (
          <Pressable key={r.label} style={styles.row} onPress={r.onPress}>
            <View style={styles.rowIcon}>
              <Ionicons name={r.icon} size={22} color={colors.navy} />
            </View>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.navy} />
          </Pressable>
        ))}

        {user && (
          <Pressable style={styles.logout} onPress={signOut}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  profile: {
    alignItems: 'center',
    backgroundColor: colors.yellowPale,
    borderRadius: radius.lg,
    padding: 22,
    marginBottom: 20,
    gap: 4,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DDE6F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: { color: colors.navy, fontSize: 20, fontWeight: '800' },
  phone: { color: colors.textMuted, fontSize: 14 },
  counters: { flexDirection: 'row', gap: 32, marginTop: 14 },
  counter: { alignItems: 'center' },
  counterValue: { color: colors.navy, fontSize: 20, fontWeight: '800' },
  counterLabel: { color: colors.textMuted, fontSize: 13 },
  login: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  loginText: { color: colors.white, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  rowIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, color: colors.navy, fontSize: 16 },
  logout: { marginTop: 20, alignItems: 'center', padding: 14 },
  logoutText: { color: colors.live, fontSize: 16, fontWeight: '600' },
});
