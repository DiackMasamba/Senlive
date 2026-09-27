import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components/AppText';
import { type PaymentMethod, useSession } from '../context/session';
import { useWallet } from '../context/wallet';
import { payCoinPack } from '../lib/paydunya';
import { COIN_FCFA, coinPacks, MIN_WITHDRAW_DIAMONDS, packBonus, REFERRAL_RATE } from '../data/coins';
import { colors, formatFcfa, radius } from '../theme';

const payMethods: { id: PaymentMethod; label: string }[] = [
  { id: 'wave', label: 'Wave' },
  { id: 'orange-money', label: 'Orange Money' },
  { id: 'carte', label: 'Carte' },
];

// Portefeuille : recharge de pièces, gains du créateur en diamants, retrait et parrainage.
export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user, openLogin } = useSession();
  const { coins, diamonds, history, referralCode, buyPack, withdraw } = useWallet();
  const [packId, setPackId] = useState(coinPacks[3].id);
  const [method, setMethod] = useState<PaymentMethod>('wave');
  const [payout, setPayout] = useState<'wave' | 'orange-money'>('wave');
  const [notice, setNotice] = useState('');

  const pack = coinPacks.find((p) => p.id === packId) ?? coinPacks[0];
  const canWithdraw = diamonds >= MIN_WITHDRAW_DIAMONDS;

  const flash = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 2500);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Retour">
          <Ionicons name="arrow-back" size={24} color={colors.navy} />
        </Pressable>
        <Text style={styles.topTitle}>Portefeuille</Text>
      </View>

      {!user ? (
        <View style={styles.gate}>
          <Ionicons name="wallet-outline" size={34} color={colors.navy} />
          <Text style={styles.gateTitle}>Connecte-toi pour recharger</Text>
          <Text style={styles.gateText}>Achète des pièces avec Wave ou Orange Money et offre des cadeaux pendant les lives.</Text>
          <Pressable style={styles.button} onPress={openLogin}>
            <Text style={styles.buttonText}>Connexion</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.balance}>
            <View style={styles.balanceRing} />
            <Text style={styles.kicker}>MES PIÈCES</Text>
            <Text style={styles.balanceValue}>
              {coins.toLocaleString('fr-FR')} <Text style={styles.balanceUnit}>pièces</Text>
            </Text>
            <Text style={styles.balanceSub}>Valeur : {formatFcfa(coins * COIN_FCFA)}</Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.section}>RECHARGER</Text>
            <View style={styles.packs}>
              {coinPacks.map((p) => {
                const active = p.id === packId;
                const bonus = packBonus(p);
                return (
                  <Pressable key={p.id} style={styles.packCell} onPress={() => setPackId(p.id)}>
                    <View style={[styles.pack, active && styles.packActive]}>
                      {bonus > 0 && <Text style={styles.bonus}>+{bonus} %</Text>}
                      <Text style={styles.packCoins}>{p.coins.toLocaleString('fr-FR')}</Text>
                      <Text style={styles.packLabel}>pièces</Text>
                      <Text style={styles.packPrice}>{formatFcfa(p.price)}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.methods}>
              {payMethods.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => setMethod(m.id)}
                  style={[styles.method, method === m.id && styles.methodActive]}
                >
                  <Text style={[styles.methodText, method === m.id && styles.methodTextActive]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={styles.button}
              onPress={async () => {
                const result = await payCoinPack(pack.id, method);
                if (result === 'demo' || result === 'completed') {
                  buyPack(pack, method);
                  flash(`+${pack.coins.toLocaleString('fr-FR')} pièces ajoutées`);
                } else if (result === 'pending') flash('Paiement en attente de confirmation');
                else flash('Paiement non abouti');
              }}
            >
              <Text style={styles.buttonText}>Payer {formatFcfa(pack.price)}</Text>
            </Pressable>
            <Text style={styles.note}>Démo : aucun paiement n'est prélevé. Les pièces ne sont ni remboursables ni transférables.</Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.section}>MES GAINS DE CRÉATEUR</Text>
            <View style={styles.earnRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.earnValue}>
                  {diamonds.toLocaleString('fr-FR')} <Text style={styles.earnUnit}>diamants</Text>
                </Text>
                <Text style={styles.earnSub}>
                  {formatFcfa(diamonds * COIN_FCFA)} · retrait dès {formatFcfa(MIN_WITHDRAW_DIAMONDS * COIN_FCFA)}
                </Text>
              </View>
              <Ionicons name="diamond-outline" size={26} color={colors.navy} />
            </View>
            <View style={styles.progress}>
              <View style={[styles.progressFill, { width: `${Math.min(100, (diamonds / MIN_WITHDRAW_DIAMONDS) * 100)}%` }]} />
            </View>
            <View style={styles.methods}>
              {payMethods.slice(0, 2).map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => setPayout(m.id as 'wave' | 'orange-money')}
                  style={[styles.method, payout === m.id && styles.methodActive]}
                >
                  <Text style={[styles.methodText, payout === m.id && styles.methodTextActive]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.button, !canWithdraw && styles.buttonDisabled]}
              disabled={!canWithdraw}
              onPress={() => withdraw(payout) && flash('Retrait demandé, reçu sous 7 jours')}
            >
              <Text style={[styles.buttonText, !canWithdraw && styles.buttonTextDisabled]}>
                Retirer vers {payout === 'wave' ? 'Wave' : 'Orange Money'}
              </Text>
            </Pressable>
            <Text style={styles.note}>
              Tu reçois 50 % de chaque cadeau offert pendant tes lives. Lance un live dans l'onglet Go Live pour essayer.
            </Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.section}>PARRAINAGE</Text>
            <View style={styles.refRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.refLabel}>Ton code</Text>
                <Text style={styles.refCode} selectable>
                  {referralCode}
                </Text>
              </View>
              <Ionicons name="people-outline" size={26} color={colors.navy} />
            </View>
            <Text style={styles.note}>
              Tes amis entrent ce code à l'inscription. Tu gagnes {REFERRAL_RATE * 100} % de leurs recharges en diamants pendant 6 mois.
            </Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.section}>HISTORIQUE</Text>
            {history.length === 0 ? (
              <Text style={styles.empty}>Aucune opération pour l'instant.</Text>
            ) : (
              history.map((h) => (
                <View key={h.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel} numberOfLines={1}>
                      {h.label}
                    </Text>
                    <Text style={styles.rowDate}>
                      {h.at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={[styles.rowAmount, (h.coins ?? h.diamonds ?? 0) < 0 && styles.negative]}>
                    {h.coins !== undefined
                      ? `${h.coins > 0 ? '+' : ''}${h.coins} pièces`
                      : `${(h.diamonds ?? 0) > 0 ? '+' : ''}${h.diamonds} diamants`}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {notice ? (
        <View style={[styles.toast, { bottom: insets.bottom + 24 }]}>
          <Text style={styles.toastText}>{notice}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topTitle: { color: colors.navy, fontSize: 17, fontWeight: '700' },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 8, backgroundColor: colors.white },
  gateTitle: { color: colors.navy, fontSize: 17, fontWeight: '700', marginTop: 4 },
  gateText: { color: colors.textMuted, fontSize: 13.5, textAlign: 'center', lineHeight: 19, marginBottom: 8 },
  content: { gap: 8 },
  balance: { margin: 14, marginBottom: 6, borderRadius: 14, backgroundColor: colors.navy, padding: 16, overflow: 'hidden' },
  balanceRing: {
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
  balanceValue: { color: colors.white, fontSize: 30, fontWeight: '700', marginTop: 4 },
  balanceUnit: { fontSize: 15, fontWeight: '400' },
  balanceSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5 },
  block: { backgroundColor: colors.white, padding: 14, gap: 10 },
  section: { color: colors.textMuted, fontSize: 12.5, fontWeight: '600', letterSpacing: 0.3 },
  packs: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  packCell: { width: '33.333%', padding: 4 },
  pack: { alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  packActive: { borderColor: colors.navy, borderWidth: 2, backgroundColor: colors.surface },
  bonus: {
    position: 'absolute',
    top: -8,
    backgroundColor: colors.live,
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  packCoins: { color: colors.navy, fontSize: 18, fontWeight: '700' },
  packLabel: { color: colors.textMuted, fontSize: 11 },
  packPrice: { color: colors.navy, fontSize: 12.5, fontWeight: '600', marginTop: 4 },
  methods: { flexDirection: 'row', gap: 8 },
  method: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  methodText: { color: colors.navy, fontSize: 13 },
  methodTextActive: { color: colors.white, fontWeight: '600' },
  button: {
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  buttonDisabled: { backgroundColor: '#EEEEEE' },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  buttonTextDisabled: { color: '#9E9E9E' },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  earnRow: { flexDirection: 'row', alignItems: 'center' },
  earnValue: { color: colors.navy, fontSize: 22, fontWeight: '700' },
  earnUnit: { fontSize: 14, fontWeight: '400' },
  earnSub: { color: colors.textMuted, fontSize: 12.5 },
  progress: { height: 5, borderRadius: 3, backgroundColor: colors.surface, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: colors.navy },
  refRow: { flexDirection: 'row', alignItems: 'center' },
  refLabel: { color: colors.textMuted, fontSize: 12 },
  refCode: { color: colors.navy, fontSize: 22, fontWeight: '700', letterSpacing: 2 },
  empty: { color: colors.textMuted, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.navy, fontSize: 13.5 },
  rowDate: { color: colors.textMuted, fontSize: 11.5 },
  rowAmount: { color: colors.navy, fontSize: 13, fontWeight: '600' },
  negative: { color: colors.textMuted },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toastText: { color: colors.white, fontSize: 13.5, fontWeight: '600' },
});
