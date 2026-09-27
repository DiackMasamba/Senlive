import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../../context/session';
import { chatSeed, formatViewers } from '../../data/mock';
import { useLives } from '../../data/useLives';
import { colors, radius } from '../../theme';

// Écran de visionnage : vidéo plein écran (simulée) et chat en surimpression.
export default function LiveScreen() {
  const { lives } = useLives();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, subscription, openLogin } = useSession();
  const live = lives.find((l) => l.id === id) ?? lives[0];
  const [messages, setMessages] = useState(chatSeed);
  const [draft, setDraft] = useState('');
  const [likes, setLikes] = useState(0);

  const locked = live.premium && !subscription;

  const send = () => {
    const text = draft.trim().slice(0, 200);
    if (!text) return;
    if (!user) return openLogin();
    setMessages((m) => [...m, { id: String(Date.now()), user: 'Moi', text }]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: live.color }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.shade} />

      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <View style={styles.hostPill}>
          <View style={styles.hostAvatar}>
            <Text style={styles.hostInitial}>{live.host[0]}</Text>
          </View>
          <View>
            <Text style={styles.hostName}>{live.host}</Text>
            <Text style={styles.hostHandle}>{live.handle}</Text>
          </View>
          <Pressable style={styles.follow} onPress={() => !user && openLogin()}>
            <Text style={styles.followText}>Suivre</Text>
          </Pressable>
        </View>
        <View style={styles.topRight}>
          <View style={styles.viewers}>
            <Ionicons name="eye-outline" size={14} color={colors.white} />
            <Text style={styles.viewersText}>{formatViewers(live.viewers)}</Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Fermer le live">
            <Ionicons name="close" size={30} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <View style={styles.titleRow}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>EN DIRECT</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {live.title}
        </Text>
      </View>

      {locked ? (
        <View style={styles.lock}>
          <Ionicons name="lock-closed" size={40} color={colors.navy} />
          <Text style={styles.lockTitle}>Live Premium</Text>
          <Text style={styles.lockText}>Abonne-toi à Senlive Premium pour regarder ce live en entier.</Text>
          <Pressable
            style={styles.lockButton}
            onPress={() => {
              router.back();
              router.navigate('/abonnement');
            }}
          >
            <Text style={styles.lockButtonText}>Voir l’offre</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          style={styles.chat}
          renderItem={({ item }) => (
            <View style={styles.message}>
              <Text style={styles.messageUser}>{item.user} </Text>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            placeholder={user ? 'Ajouter un commentaire…' : 'Connecte-toi pour commenter'}
            placeholderTextColor="rgba(255,255,255,0.7)"
            maxLength={200}
            style={styles.input}
            editable={!locked}
          />
          <Pressable style={styles.heart} onPress={() => setLikes((n) => n + 1)} accessibilityLabel="J'aime">
            <Ionicons name="heart" size={26} color={colors.live} />
            {likes > 0 && <Text style={styles.likes}>{likes}</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.25)' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 14 },
  hostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.pill,
    padding: 5,
    paddingRight: 6,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostInitial: { color: colors.navy, fontWeight: '900', fontSize: 16 },
  hostName: { color: colors.white, fontWeight: '700', fontSize: 14 },
  hostHandle: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  follow: { backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 4 },
  followText: { color: colors.navy, fontWeight: '700', fontSize: 13 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  viewers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  viewersText: { color: colors.white, fontWeight: '600', fontSize: 13 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 12 },
  liveBadge: { backgroundColor: colors.live, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  liveBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  title: { flex: 1, color: colors.white, fontWeight: '600', fontSize: 15 },
  lock: {
    flex: 1,
    margin: 28,
    marginVertical: 60,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  lockTitle: { color: colors.navy, fontSize: 22, fontWeight: '900', fontStyle: 'italic' },
  lockText: { color: colors.navy, fontSize: 15, textAlign: 'center' },
  lockButton: { marginTop: 10, backgroundColor: colors.navy, borderRadius: radius.pill, paddingHorizontal: 24, paddingVertical: 12 },
  lockButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  bottom: { paddingHorizontal: 14 },
  chat: { maxHeight: 220, marginBottom: 10 },
  message: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    maxWidth: '85%',
  },
  messageUser: { color: colors.yellow, fontWeight: '700', fontSize: 14 },
  messageText: { color: colors.white, fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.white,
    fontSize: 15,
  },
  heart: { alignItems: 'center' },
  likes: { color: colors.white, fontSize: 11, fontWeight: '700' },
});
