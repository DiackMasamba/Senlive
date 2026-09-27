import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { colors } from '../theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
};

// Tuile carrée à bord fin, comme les raccourcis de l'accueil.
export function Tile({ icon, label, onPress }: Props) {
  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <View style={styles.box}>
        <Ionicons name={icon} size={30} color={colors.navy} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '25%', alignItems: 'center', gap: 8, marginBottom: 18 },
  box: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.navy, fontSize: 14, textAlign: 'center' },
});
