import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/AppText';
import { Header } from '../../components/Header';
import { type PaymentMethod, useSession } from '../../context/session';
import { SUBSCRIPTION_PRICE } from '../../data/mock';
import { colors, formatFcfa } from '../../theme';

const methods: { id: PaymentMethod; label: string; hint: string; color: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'wave', label: 'Wave', hint: 'Paiement confirmé dans ton app Wave', color: '#1DC8F2', icon: 'water-outline' },
  { id: 'orange-money', label: 'Orange Money', hint: 'Confirmation par code secret', color: '#FF7900', icon: 'phone-portrait-outline' },
  { id: 'carte', label: 'Carte bancaire', hint: 'Visa ou Mastercard, renouvellement automatique', color: colors.navy, icon: 'card-outline' },
];

const perks = [
  'Tous les lives Premium en illimité',
  'Badge abonné dans le chat',
  'Replays des lives pendant 7 jours',
  'Tu soutiens directement tes créateurs',
];

// Paiement simulé : l'agrégateur (Wave, Orange Money, carte) sera branché au lot 3.
export default function SubscriptionScreen() {
  const { user, subscription, openLogin, subscribe, cancelSubscription } = useSession();
  const [method, setMethod] = useState<PaymentMethod>('wave');

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.block}>
          <View style={styles.offer}>
            <View style={styles.offerRing} />
            <Text style={styles.kicker}>SENLIVE PREMIUM</Text>
            <Text style={styles.price}>
              {formatFcfa(SUBSCRIPTION_PRICE)}
              <Text style={styles.per}> / mois</Text>
            </Text>
            <Text style={styles.offerSub}>Sans engagement, résiliable à tout moment</Text>
          </View>
          <View style={styles.perks}>
            {perks.map((p) => (
              <View key={p} style={styles.perk}>
                <Ionicons name="checkmark" size={17} color={colors.navy} />
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {subscription ? (
          <View style={[styles.block, styles.active]}>
            <View style={styles.activeIcon}>
              <Ionicons name="star" size={18} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Premium actif</Text>
              <Text style={styles.activeText}>
                Prochaine échéance le {subscription.renewsOn.toLocaleDateString('fr-FR')} via{' '}
                {methods.find((m) => m.id === subscription.method)?.label}
              </Text>
            </View>
            <Pressable onPress={cancelSubscription} hitSlop={8}>
              <Text style={styles.cancel}>Résilier</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>MOYEN DE PAIEMENT</Text>
            {methods.map((m) => {
              const selected = method === m.id;
              return (
                <Pressable key={m.id} onPress={() => setMethod(m.id)} style={styles.method}>
                  <View style={[styles.methodIcon, { backgroundColor: m.color }]}>
                    <Ionicons name={m.icon} size={18} color={colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodLabel}>{m.label}</Text>
                    <Text style={styles.methodHint} numberOfLines={1}>
                      {m.hint}
                    </Text>
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={21}
                    color={selected ? colors.navy : colors.border}
                  />
                </Pressable>
              );
            })}
            <View style={styles.payWrap}>
              <Pressable style={styles.pay} onPress={() => (user ? subscribe(method) : openLogin())}>
                <Text style={styles.payText}>
                  {user ? `Payer ${formatFcfa(SUBSCRIPTION_PRICE)}` : 'Connecte-toi pour t’abonner'}
                </Text>
              </Pressable>
              <Text style={styles.note}>
                Rappel 3 jours avant chaque échéance. Sans paiement, tu gardes l’accès 3 jours de plus.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: 24, gap: 8 },
  block: { backgroundColor: colors.white },
  offer: {
    margin: 14,
    marginBottom: 4,
    borderRadius: 14,
    backgroundColor: colors.navy,
    padding: 16,
    overflow: 'hidden',
  },
  offerRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 28,
    borderColor: 'rgba(255,255,255,0.07)',
    right: -50,
    top: -40,
  },
  kicker: { color: colors.live, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  price: { color: colors.white, fontSize: 26, fontWeight: '700', marginTop: 4 },
  per: { fontSize: 14, fontWeight: '400' },
  offerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5, marginTop: 2 },
  perks: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  perkText: { color: colors.navy, fontSize: 14 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.3,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  methodIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { color: colors.navy, fontSize: 14.5, fontWeight: '600' },
  methodHint: { color: colors.textMuted, fontSize: 12 },
  payWrap: { padding: 14 },
  pay: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    backgroundColor: colors.navy,
    borderRadius: 10,
  },
  payText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  note: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 17 },
  active: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  activeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTitle: { color: colors.navy, fontSize: 15, fontWeight: '700' },
  activeText: { color: colors.textMuted, fontSize: 12.5, marginTop: 1 },
  cancel: { color: colors.live, fontSize: 13, fontWeight: '600' },
});
