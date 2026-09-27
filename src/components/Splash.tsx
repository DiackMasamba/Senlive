import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Logo } from './Logo';

// Écran de démarrage : fond jaune, halos concentriques et logo au centre.
export function Splash() {
  return (
    <View style={styles.container}>
      <View style={[styles.halo, { width: 520, height: 520, opacity: 0.25 }]} />
      <View style={[styles.halo, { width: 400, height: 400, opacity: 0.4 }]} />
      <View style={[styles.halo, { width: 290, height: 290, opacity: 0.6 }]} />
      <Logo size={1.2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 100,
  },
  halo: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.yellowLight,
  },
});
