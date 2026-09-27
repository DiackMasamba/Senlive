import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text, TextInput } from '../../components/AppText';
import { Header } from '../../components/Header';
import { useSession } from '../../context/session';
import { categories } from '../../data/mock';
import { pickImage } from '../../lib/pickImage';
import { colors, radius } from '../../theme';

// Écran de préparation d'un live (chapitre 4 du cahier des charges).
// La diffusion vidéo WebRTC sera branchée au lot 2.
export default function GoLiveScreen() {
  const { user, avatar, myLive, openLogin, startLive, endLive } = useSession();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0].id);
  const [premium, setPremium] = useState(false);
  const [cover, setCover] = useState<string | null>(null);

  if (!user) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.gate}>
          <View style={styles.gateIcon}>
            <Ionicons name="radio" size={30} color={colors.navy} />
          </View>
          <Text style={styles.gateTitle}>Lance ton premier live</Text>
          <Text style={styles.gateText}>Connecte-toi avec ton numéro pour passer en direct devant ta communauté.</Text>
          <Pressable style={[styles.primary, styles.gateButton]} onPress={openLogin}>
            <Text style={styles.primaryText}>Connexion</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const chooseCover = async () => {
    const uri = await pickImage([4, 5]);
    if (uri) setCover(uri);
  };

  const toggleLive = () => {
    if (myLive) return endLive();
    const handle = user.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
    startLive({
      id: 'moi',
      title: title.trim(),
      host: user.name,
      handle: `@${handle || 'moi'}`,
      category,
      viewers: 1,
      premium,
      color: '#2B2B2B',
      thumbnail: cover ?? undefined,
      avatar: avatar ?? undefined,
    });
  };

  const live = Boolean(myLive);

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.preview} onPress={live ? undefined : chooseCover} accessibilityLabel="Choisir la photo de couverture">
          {cover ? (
            <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="image-outline" size={34} color="rgba(255,255,255,0.8)" />
              <Text style={styles.previewText}>Ajouter une photo de couverture</Text>
              <Text style={styles.previewHint}>Elle s'affiche sur la carte de ton live</Text>
            </>
          )}
          {live && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>EN DIRECT</Text>
            </View>
          )}
          {cover && !live && (
            <View style={styles.changeCover}>
              <Ionicons name="camera" size={14} color={colors.white} />
              <Text style={styles.changeCoverText}>Changer</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.label}>TITRE DU LIVE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          maxLength={80}
          placeholder="Ex : Soirée sabar depuis Dakar"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          editable={!live}
        />
        <Text style={styles.counter}>{title.length}/80</Text>

        <Text style={styles.label}>CATÉGORIE</Text>
        <View style={styles.chips}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => !live && setCategory(c.id)}
              style={[styles.chip, category === c.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, category === c.id && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Live Premium</Text>
            <Text style={styles.hint}>Réservé aux abonnés Senlive Premium</Text>
          </View>
          <Switch value={premium} onValueChange={setPremium} disabled={live} trackColor={{ true: colors.navy }} />
        </View>

        <Pressable
          style={[styles.primary, live && styles.stop, !title.trim() && !live && styles.disabled]}
          disabled={!title.trim() && !live}
          onPress={toggleLive}
        >
          <Ionicons name={live ? 'stop-circle-outline' : 'radio'} size={19} color={colors.white} />
          <Text style={styles.primaryText}>{live ? 'Terminer le live' : 'Passer en direct'}</Text>
        </Pressable>
        {live && (
          <Pressable onPress={() => router.navigate('/')} hitSlop={8}>
            <Text style={styles.link}>Voir mon live sur l'accueil</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 14, paddingBottom: 24 },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  gateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gateTitle: { color: colors.navy, fontSize: 18, fontWeight: '700' },
  gateText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  gateButton: { alignSelf: 'stretch', marginTop: 12 },
  preview: {
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 18,
    overflow: 'hidden',
  },
  previewText: { color: colors.white, fontSize: 14, fontWeight: '600', marginTop: 4 },
  previewHint: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.live,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  liveBadgeText: { color: colors.white, fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },
  changeCover: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changeCoverText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  label: { color: colors.textMuted, fontSize: 12.5, fontWeight: '600', letterSpacing: 0.3, marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.navy,
  },
  counter: { alignSelf: 'flex-end', color: colors.textMuted, fontSize: 11, marginTop: 4, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { color: colors.navy, fontSize: 13 },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: 18,
  },
  switchLabel: { color: colors.navy, fontSize: 14.5, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 12 },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    backgroundColor: colors.navy,
    borderRadius: 10,
  },
  stop: { backgroundColor: colors.live },
  disabled: { opacity: 0.35 },
  primaryText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  link: { color: colors.navy, fontSize: 13, textAlign: 'center', textDecorationLine: 'underline', marginTop: 14 },
});
