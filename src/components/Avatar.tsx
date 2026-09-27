import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { colors } from '../theme';

type Props = { uri?: string | null; name?: string; size?: number };

// Photo de profil ronde ; à défaut, les initiales ou une silhouette.
export function Avatar({ uri, name, size = 40 }: Props) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={[box, styles.image]} />;
  const initials = name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <View style={[box, styles.fallback]}>
      {initials ? (
        <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.55} color={colors.navySoft} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surface },
  fallback: { backgroundColor: '#E3E3E3', alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.navy, fontWeight: '700' },
});
