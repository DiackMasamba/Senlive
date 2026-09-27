import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { formatViewers, type Live } from '../data/mock';
import { colors } from '../theme';

type Props = { live: Live; width?: number };

export function LiveCard({ live, width }: Props) {
  const initials = live.host
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

  return (
    <Pressable style={[styles.card, width ? { width } : { flex: 1 }]} onPress={() => router.push(`/live/${live.id}`)}>
      <View style={[styles.thumb, { backgroundColor: live.color }]}>
        <Text style={styles.initials}>{initials}</Text>
        <View style={styles.topRow}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
          <View style={styles.viewers}>
            <Ionicons name="eye-outline" size={12} color={colors.white} />
            <Text style={styles.viewersText}>{formatViewers(live.viewers)}</Text>
          </View>
        </View>
        {live.premium && (
          <View style={styles.premium}>
            <Ionicons name="star" size={12} color={colors.navy} />
          </View>
        )}
        <View style={styles.handle}>
          <Text style={styles.handleText} numberOfLines={1}>
            {live.handle}
          </Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {live.title}
        </Text>
        <Text style={styles.host} numberOfLines={1}>
          {live.host}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  thumb: {
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: { color: 'rgba(255,255,255,0.9)', fontSize: 34, fontWeight: '900' },
  topRow: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveBadge: {
    backgroundColor: colors.live,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  liveText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  premium: {
    position: 'absolute',
    bottom: 7,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    maxWidth: '72%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  handleText: { color: colors.white, fontSize: 9, fontWeight: '600' },
  viewers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  viewersText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  info: { paddingHorizontal: 9, paddingVertical: 8 },
  title: { color: colors.navy, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  host: { color: colors.textMuted, fontSize: 11.5, marginTop: 1 },
});
