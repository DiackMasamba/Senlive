import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header } from '../../components/Header';
import { type PaymentMethod, useSession } from '../../context/session';
import { SUBSCRIPTION_PRICE } from '../../data/mock';
import { colors, formatFcfa, radius, shadow } from '../../theme';

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
        <View style={styles.offer}>
          <View style={styles.offerBlob} />
          <Text style={styles.offerName}>Senlive Premium</Text>
          <Text style={styles.price}>
            {formatFcfa(SUBSCRIPTION_PRICE)}
            <Text style={styles.per}> / mois</Text>
          </Text>
          {perks.map((p) => (
            <View key={p} style={styles.perk}>
              <Ionicons name="checkmark-circle" size={20} color={colors.navy} />
              <Text style={styles.perkText}>{p}</Text>
            </View>
          ))}
        </View>

        {subscription ? (
          <View style={styles.active}>
            <Ionicons name="star" size={28} color={colors.yellow} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Premium actif</Text>
              <Text style={styles.activeText}>
                Prochaine échéance le {subscription.renewsOn.toLocaleDateString('fr-FR')} via{' '}
                {methods.find((m) => m.id === subscription.method)?.label}
              </Text>
            </View>
            <Pressable onPress={cancelSubscription}>
              <Text style={styles.cancel}>Résilier</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Choisis ton moyen de paiement</Text>
            {methods.map((m) => {
              const selected = method === m.id;
              return (
                <Pressable key={m.id} onPress={() => setMethod(m.id)} style={[styles.method, selected && styles.methodSelected]}>
                  <View style={[styles.methodIcon, { backgroundColor: m.color }]}>
                    <Ionicons name={m.icon} size={22} color={colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodLabel}>{m.label}</Text>
                    <Text style={styles.methodHint}>{m.hint}</Text>
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={selected ? colors.navy : colors.border}
                  />
                </Pressable>
              );
            })}
            <Pressable style={styles.pay} onPress={() => (user ? subscribe(method) : openLogin())}>
              <Text style={styles.payText}>
                {user ? `Payer ${formatFcfa(SUBSCRIPTION_PRICE)}` : 'Connecte-toi pour t’abonner'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </Pressable>
            <Text style={styles.note}>
              Rappel 3 jours avant chaque échéance. Sans paiement, tu gardes l’accès 3 jours de plus. Résiliable à tout moment.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  offer: {
    backgroundColor: colors.yellow,
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
    gap: 8,
    ...shadow,
  },
  offerBlob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -110,
    top: -70,
    backgroundColor: colors.yellowLight,
  },
  offerName: { color: colors.navy, fontSize: 18, fontWeight: '600' },
  price: { color: colors.navy, fontSize: 34, fontWeight: '900', marginBottom: 8 },
  per: { fontSize: 16, fontWeight: '500' },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkText: { color: colors.navy, fontSize: 15 },
  sectionTitle: { color: colors.navy, fontSize: 18, fontWeight: '800', marginTop: 28, marginBottom: 12 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
  },
  methodSelected: { borderColor: colors.navy, backgroundColor: colors.yellowPale },
  methodIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { color: colors.navy, fontSize: 16, fontWeight: '700' },
  methodHint: { color: colors.textMuted, fontSize: 13 },
  pay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingVertical: 16,
    marginTop: 12,
  },
  payText: { color: colors.white, fontSize: 17, fontWeight: '600' },
  note: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  active: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 24,
    padding: 18,
    borderRadius: radius.md,
    backgroundColor: colors.navy,
  },
  activeTitle: { color: colors.yellow, fontSize: 18, fontWeight: '800' },
  activeText: { color: colors.white, fontSize: 14, marginTop: 2 },
  cancel: { color: colors.yellowLight, textDecorationLine: 'underline' },
});
