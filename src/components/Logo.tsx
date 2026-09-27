import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = { size?: number };

// Logo Senlive : pastille bleu nuit, mot-symbole jaune et point rouge « en direct ».
export function Logo({ size = 1 }: Props) {
  return (
    <View style={[styles.badge, { paddingHorizontal: 22 * size, paddingVertical: 14 * size, borderRadius: 26 * size }]}>
      <Text style={[styles.word, { fontSize: 40 * size }]}>senlive</Text>
      <View style={[styles.dot, { width: 12 * size, height: 12 * size, borderRadius: 6 * size, top: 12 * size, right: 12 * size }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.navy,
    alignSelf: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  word: {
    color: colors.yellow,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.live,
  },
});
