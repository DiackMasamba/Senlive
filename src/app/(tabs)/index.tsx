import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/AppText';
import { Header } from '../../components/Header';
import { LiveCard } from '../../components/LiveCard';
import { useSession } from '../../context/session';
import { categories, SUBSCRIPTION_PRICE } from '../../data/mock';
import { useLives } from '../../data/useLives';
import { colors, formatFcfa, radius } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

// Bloc blanc avec un titre et « Voir tout », séparé des autres par un fond gris (comme Jumia).
function Section({ title, onMore, children }: { title: string; onMore?: () => void; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onMore && (
          <Pressable style={styles.more} onPress={onMore} hitSlop={8}>
            <Text style={styles.moreText}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.navy} />
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

export default function HomeScreen() {
  const { lives } = useLives();
  const { user, subscription, openLogin } = useSession();
  const requireLogin = (action: () => void) => (user ? action() : openLogin());
  const premiumLives = lives.filter((l) => l.premium);
  const toExplorer = () => router.navigate('/explorer');

  const shortcuts: { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: 'radio-outline', label: 'Go Live', onPress: () => requireLogin(() => router.navigate('/golive')) },
    { icon: 'star-outline', label: 'Premium', onPress: () => router.navigate('/abonnement') },
    { icon: 'people-outline', label: 'Créateurs', onPress: toExplorer },
    { icon: 'gift-outline', label: 'Parrainage', onPress: () => requireLogin(() => {}) },
  ];

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Pressable style={styles.search} onPress={toExplorer}>
            <Ionicons name="search-outline" size={19} color={colors.textMuted} />
            <Text style={styles.searchText}>Rechercher un live ou un créateur</Text>
          </Pressable>

          <Pressable style={styles.banner} onPress={() => router.navigate('/abonnement')}>
            <View style={styles.bannerRing} />
            <Text style={styles.bannerKicker}>{subscription ? 'PREMIUM ACTIF' : 'SENLIVE PREMIUM'}</Text>
            <Text style={styles.bannerTitle}>
              {subscription ? 'Profite de tous les lives' : 'Tous les lives en illimité'}
            </Text>
            <Text style={styles.bannerSub}>
              {subscription ? 'Merci de soutenir les créateurs' : `${formatFcfa(SUBSCRIPTION_PRICE)} / mois · Wave, Orange Money`}
            </Text>
            <View style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>{subscription ? 'Mon abonnement' : "S'abonner"}</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.navy} />
            </View>
          </Pressable>

          <View style={styles.shortcuts}>
            {shortcuts.map((s) => (
              <Pressable key={s.label} style={styles.shortcut} onPress={s.onPress}>
                <View style={styles.shortcutIcon}>
                  <Ionicons name={s.icon} size={22} color={colors.navy} />
                </View>
                <Text style={styles.shortcutLabel} numberOfLines={1}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Section title="En direct maintenant" onMore={toExplorer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {lives.map((live) => (
              <LiveCard key={live.id} live={live} width={150} />
            ))}
          </ScrollView>
        </Section>

        <Section title="Catégories" onMore={toExplorer}>
          <View style={styles.categories}>
            {categories.map((c) => (
              <Pressable key={c.id} style={styles.category} onPress={toExplorer}>
                <View style={styles.categoryIcon}>
                  <Ionicons name={c.icon as IconName} size={22} color={colors.navy} />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={1}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {premiumLives.length > 0 && (
          <Section title="Lives Premium" onMore={() => router.navigate('/abonnement')}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {premiumLives.map((live) => (
                <LiveCard key={live.id} live={live} width={150} />
              ))}
            </ScrollView>
          </Section>
        )}

        <Pressable style={styles.referral} onPress={() => requireLogin(() => {})}>
          <View style={styles.referralIcon}>
            <Ionicons name="gift-outline" size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.referralTitle}>Parraine un ami</Text>
            <Text style={styles.referralSub}>Gagne un mois Premium offert</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.navy} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: 24, gap: 8 },
  top: { backgroundColor: colors.white, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  searchText: { color: colors.textMuted, fontSize: 14 },
  banner: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: colors.navy,
    padding: 16,
    overflow: 'hidden',
  },
  bannerRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 28,
    borderColor: 'rgba(255,255,255,0.07)',
    right: -50,
    top: -40,
  },
  bannerKicker: { color: colors.live, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  bannerTitle: { color: colors.white, fontSize: 19, fontWeight: '700', marginTop: 4 },
  bannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5, marginTop: 2 },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  bannerButtonText: { color: colors.navy, fontSize: 13, fontWeight: '600' },
  shortcuts: { flexDirection: 'row', marginTop: 14 },
  shortcut: { flex: 1, alignItems: 'center', gap: 6 },
  shortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { color: colors.navy, fontSize: 12 },
  section: { backgroundColor: colors.white, paddingVertical: 12 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  sectionTitle: { color: colors.navy, fontSize: 16, fontWeight: '700' },
  more: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreText: { color: colors.navy, fontSize: 13, fontWeight: '500' },
  row: { paddingHorizontal: 14, gap: 10 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, rowGap: 12 },
  category: { width: '25%', alignItems: 'center', gap: 6 },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { color: colors.navy, fontSize: 12 },
  referral: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTitle: { color: colors.navy, fontSize: 14, fontWeight: '600' },
  referralSub: { color: colors.textMuted, fontSize: 12.5 },
});
