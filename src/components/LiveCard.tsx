import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { formatViewers, type Live } from '../data/mock';
import { colors, radius } from '../theme';

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
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>EN DIRECT</Text>
        </View>
        {live.premium && (
          <View style={styles.premium}>
            <Ionicons name="star" size={12} color={colors.navy} />
          </View>
        )}
        <View style={styles.viewers}>
          <Ionicons name="eye-outline" size={13} color={colors.white} />
          <Text style={styles.viewersText}>{formatViewers(live.viewers)}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {live.title}
      </Text>
      <Text style={styles.host} numberOfLines={1}>{live.handle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  thumb: {
    height: 190,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: { color: 'rgba(255,255,255,0.9)', fontSize: 44, fontWeight: '900' },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.live,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  liveText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  premium: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewers: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  viewersText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  title: { color: colors.navy, fontSize: 12.5, fontWeight: '600', lineHeight: 18 },
  host: { color: colors.textMuted, fontSize: 12 },
});
