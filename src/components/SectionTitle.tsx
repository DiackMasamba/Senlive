import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

// Titre en deux tons : premier mot bleu clair, suite bleu nuit, en italique gras.
export function SectionTitle({ light, strong }: { light: string; strong: string }) {
  return (
    <Text style={styles.title}>
      <Text style={styles.light}>{light} </Text>
      {strong}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  light: { color: colors.navySoft },
});
