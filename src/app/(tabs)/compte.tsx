import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/AppText';
import { Avatar } from '../../components/Avatar';
import { Header } from '../../components/Header';
import { pickImage } from '../../lib/pickImage';
import { useSession } from '../../context/session';
import { colors, radius } from '../../theme';

export default function AccountScreen() {
  const { user, subscription, avatar, setAvatar, openLogin, signOut } = useSession();

  const changePhoto = async () => {
    if (!user) return openLogin();
    const uri = await pickImage([1, 1]);
    if (uri) setAvatar(uri);
  };

  type Row = { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void };
  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'MON COMPTE',
      rows: [
        { icon: 'camera-outline', label: avatar ? 'Changer ma photo' : 'Ajouter une photo de profil', onPress: changePhoto },
        { icon: 'create-outline', label: 'Modifier mon profil' },
        { icon: 'star-outline', label: subscription ? 'Mon abonnement Premium' : 'Passer Premium', onPress: () => router.navigate('/abonnement') },
        { icon: 'videocam-outline', label: 'Devenir créateur', onPress: () => router.navigate('/golive') },
      ],
    },
    {
      title: 'PARAMÈTRES',
      rows: [
        { icon: 'notifications-outline', label: 'Notifications' },
        { icon: 'shield-checkmark-outline', label: 'Confidentialité et blocages' },
        { icon: 'document-text-outline', label: 'Conditions générales' },
      ],
    },
  ];

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <Pressable onPress={changePhoto} accessibilityLabel="Changer la photo de profil">
            <Avatar uri={avatar} name={user?.name} size={52} />
            <View style={styles.camera}>
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user ? user.name : 'Invité'}</Text>
            <Text style={styles.phone} numberOfLines={1}>
              {user ? user.phone : 'Connecte-toi pour suivre tes créateurs'}
            </Text>
          </View>
          {!user && (
            <Pressable style={styles.login} onPress={openLogin} accessibilityLabel="Connexion">
              <Ionicons name="log-in-outline" size={20} color={colors.white} />
            </Pressable>
          )}
        </View>
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

        {sections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.rows.map((r) => (
              <Pressable key={r.label} style={styles.row} onPress={r.onPress}>
                <Ionicons name={r.icon} size={21} color={colors.navy} />
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        ))}

        <Pressable style={styles.row} onPress={user ? signOut : openLogin}>
          <Ionicons name={user ? 'log-out-outline' : 'log-in-outline'} size={21} color={user ? colors.live : colors.navy} />
          <Text style={[styles.rowLabel, user && { color: colors.live }]}>{user ? 'Déconnexion' : 'Connexion'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10 },
  camera: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.navy,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.navy, fontSize: 16, fontWeight: '700' },
  phone: { color: colors.textMuted, fontSize: 12.5 },
  login: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  counter: { alignItems: 'center' },
  counterValue: { color: colors.navy, fontSize: 16, fontWeight: '700' },
  counterLabel: { color: colors.textMuted, fontSize: 12 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.3,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { flex: 1, color: colors.navy, fontSize: 14.5 },
});
