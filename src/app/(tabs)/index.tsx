import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/AppText';
import { Header } from '../../components/Header';
import { LiveCard } from '../../components/LiveCard';
import { Logo } from '../../components/Logo';
import { SectionTitle } from '../../components/SectionTitle';
import { Tile } from '../../components/Tile';
import { useSession } from '../../context/session';
import { categories } from '../../data/mock';
import { useLives } from '../../data/useLives';
import { colors, radius, shadow } from '../../theme';

export default function HomeScreen() {
  const { lives } = useLives();
  const { user, subscription, openLogin } = useSession();
  const [hidden, setHidden] = useState(true);

  const requireLogin = (action: () => void) => (user ? action() : openLogin());

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.heroBlob, { width: 260, height: 260, right: -60, top: -40 }]} />
          <View style={[styles.heroBlob, { width: 160, height: 160, left: -40, top: 40, opacity: 0.5 }]} />
          <Text style={styles.heroText}>Les lives du Sénégal,{'\n'}en direct.</Text>
          <View style={styles.regionPill}>
            <Text style={styles.regionText}>Sénégal</Text>
            <Ionicons name="chevron-down" size={16} color={colors.navy} />
            <Text style={styles.regionText}> | FR</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardShape} />
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardLabel}>Mon abonnement</Text>
              <View style={styles.statusRow}>
                <Text style={styles.status}>
                  {hidden ? '********' : subscription ? 'Premium actif' : 'Gratuit'}
                </Text>
                <Pressable style={styles.eye} onPress={() => setHidden((h) => !h)} accessibilityLabel="Afficher le statut">
                  <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.navy} />
                </Pressable>
              </View>
            </View>
            <Logo size={0.55} />
          </View>

          <View style={styles.stats}>
            {[
              { icon: 'radio-outline' as const, label: 'LIVES', value: user ? '12' : '-' },
              { icon: 'time-outline' as const, label: 'HEURES', value: user ? '8 h' : '-' },
              { icon: 'people-outline' as const, label: 'SUIVIS', value: user ? '5' : '-' },
            ].map((s, i) => (
              <View key={s.label} style={styles.stat}>
                <View style={styles.statHead}>
                  <Ionicons name={s.icon} size={24} color={colors.navy} />
                  <View>
                    <Text style={styles.statLabel}>{s.label}</Text>
                    <Text style={styles.statValue}>{s.value}</Text>
                  </View>
                </View>
                <View style={styles.progress}>
                  <View style={[styles.progressFill, { width: user ? `${30 + i * 20}%` : 6 }]} />
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.details} onPress={() => router.navigate('/abonnement')}>
            <Text style={styles.detailsText}>{subscription ? 'Voir détails' : "S'abonner"}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.tiles}>
          <Tile icon="radio-outline" label="Go Live" onPress={() => requireLogin(() => router.navigate('/golive'))} />
          <Tile icon="star-outline" label="Premium" onPress={() => router.navigate('/abonnement')} />
          <Tile icon="people-outline" label="Créateurs" onPress={() => router.navigate('/explorer')} />
          <Tile icon="gift-outline" label="Parrainage" onPress={() => requireLogin(() => {})} />
        </View>

        <SectionTitle light="Lives" strong="en cours" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liveRow}>
          {lives.map((live) => (
            <LiveCard key={live.id} live={live} width={160} />
          ))}
        </ScrollView>

        <View style={{ height: 28 }} />
        <SectionTitle light="Toutes les" strong="catégories" />
        <View style={styles.tiles}>
          {categories.map((c) => (
            <Tile key={c.id} icon={c.icon as keyof typeof Ionicons.glyphMap} label={c.label} onPress={() => router.navigate('/explorer')} />
          ))}
        </View>

        <View style={styles.promo}>
          <View style={styles.promoBlob} />
          <Text style={styles.promoLight}>Parrainez et gagnez</Text>
          <Text style={styles.promoStrong}>un mois Premium offert</Text>
          <Pressable style={styles.promoButton} onPress={() => requireLogin(() => {})}>
            <Text style={styles.promoButtonText}>Invitez maintenant</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: {
    height: 230,
    backgroundColor: colors.navy,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 26,
  },
  heroBlob: { position: 'absolute', borderRadius: 999, backgroundColor: colors.navySoft, opacity: 0.35 },
  heroText: { color: colors.white, fontSize: 26, fontWeight: '900', fontStyle: 'italic', lineHeight: 30, marginTop: 44 },
  regionPill: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  regionText: { color: colors.navy, fontSize: 14, fontWeight: '500' },
  card: {
    marginTop: -80,
    marginHorizontal: 20,
    backgroundColor: colors.yellow,
    borderRadius: 32,
    padding: 22,
    overflow: 'hidden',
    ...shadow,
  },
  cardShape: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    right: -170,
    top: -40,
    backgroundColor: colors.yellowLight,
    opacity: 0.6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel: { color: colors.navy, fontSize: 17 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  status: { color: colors.navy, fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  eye: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: 14, marginTop: 20 },
  stat: { flex: 1, gap: 10 },
  statHead: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  statLabel: { color: colors.navy, fontSize: 13, fontWeight: '700' },
  statValue: { color: colors.navy, fontSize: 13 },
  progress: { height: 4, borderRadius: 2, backgroundColor: 'rgba(11,45,111,0.15)' },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: colors.navy },
  details: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 18,
  },
  detailsText: { color: colors.white, fontSize: 16, fontWeight: '500' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, marginTop: 26 },
  liveRow: { paddingHorizontal: 20, gap: 14 },
  promo: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.yellowPale,
    padding: 22,
    overflow: 'hidden',
  },
  promoBlob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -70,
    bottom: -90,
    backgroundColor: colors.yellow,
  },
  promoLight: { color: colors.navySoft, fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  promoStrong: { color: colors.navy, fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  promoButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  promoButtonText: { color: colors.white, fontSize: 15 },
});
