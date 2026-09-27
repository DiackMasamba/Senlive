import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Header } from '../../components/Header';
import { useSession } from '../../context/session';
import { categories } from '../../data/mock';
import { colors, radius } from '../../theme';

// Écran de préparation d'un live (chapitre 4 du cahier des charges).
// La diffusion vidéo WebRTC sera branchée au lot 2.
export default function GoLiveScreen() {
  const { user, openLogin } = useSession();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0].id);
  const [premium, setPremium] = useState(false);
  const [started, setStarted] = useState(false);

  if (!user) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.gate}>
          <View style={styles.gateIcon}>
            <Ionicons name="radio" size={44} color={colors.navy} />
          </View>
          <Text style={styles.gateTitle}>Lance ton premier live</Text>
          <Text style={styles.gateText}>Connecte-toi avec ton numéro pour passer en direct devant ta communauté.</Text>
          <Pressable style={styles.primary} onPress={openLogin}>
            <Text style={styles.primaryText}>Connexion</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          <Ionicons name="videocam-outline" size={48} color="rgba(255,255,255,0.8)" />
          <Text style={styles.previewText}>{started ? 'Tu es en direct' : 'Aperçu caméra'}</Text>
          {started && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>EN DIRECT</Text>
            </View>
          )}
        </View>

        <Text style={styles.label}>Titre du live</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          maxLength={80}
          placeholder="Ex : Soirée sabar depuis Dakar"
          placeholderTextColor={colors.navySoft}
          style={styles.input}
        />
        <Text style={styles.counter}>{title.length}/80</Text>

        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.chips}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCategory(c.id)}
              style={[styles.chip, category === c.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, category === c.id && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Live Premium</Text>
            <Text style={styles.hint}>Réservé aux abonnés Senlive Premium</Text>
          </View>
          <Switch value={premium} onValueChange={setPremium} trackColor={{ true: colors.navy }} thumbColor={colors.yellow} />
        </View>

        <Pressable
          style={[styles.primary, started ? styles.stop : null, !title.trim() && !started && styles.disabled]}
          disabled={!title.trim() && !started}
          onPress={() => setStarted((s) => !s)}
        >
          <Ionicons name={started ? 'stop-circle-outline' : 'radio'} size={22} color={colors.white} />
          <Text style={styles.primaryText}>{started ? 'Terminer le live' : 'Passer en direct'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  gateIcon: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
    marginBottom: 8,
  },
  gateTitle: { color: colors.navy, fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  gateText: { color: colors.textMuted, fontSize: 16, textAlign: 'center', lineHeight: 22 },
  preview: {
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 22,
  },
  previewText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  liveBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: colors.live,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveBadgeText: { color: colors.white, fontWeight: '800', fontSize: 12 },
  label: { color: colors.navy, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  hint: { color: colors.textMuted, fontSize: 13 },
  input: {
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.navy,
  },
  counter: { alignSelf: 'flex-end', color: colors.textMuted, fontSize: 12, marginTop: 4, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { color: colors.navy, fontSize: 14 },
  chipTextActive: { color: colors.yellow, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  stop: { backgroundColor: colors.live },
  disabled: { opacity: 0.4 },
  primaryText: { color: colors.white, fontSize: 18, fontWeight: '600' },
});
