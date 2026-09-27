import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './AppText';
import { gifts, type Gift } from '../data/gifts';
import { colors, formatFcfa } from '../theme';

type Props = { visible: boolean; host: string; onClose: () => void; onSend: (gift: Gift) => void };

// Feuille de choix d'un cadeau virtuel pour le créateur en direct.
export function GiftSheet({ visible, host, onClose, onSend }: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Gift>(gifts[0]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.grabber} />
        <Text style={styles.title}>Envoyer un cadeau</Text>
        <Text style={styles.subtitle}>Soutiens {host} pendant son live</Text>
        <View style={styles.grid}>
          {gifts.map((g) => {
            const active = g.id === selected.id;
            return (
              <Pressable key={g.id} style={styles.cell} onPress={() => setSelected(g)}>
                <View style={[styles.gift, active && styles.giftActive]}>
                  <Text style={styles.emoji}>{g.emoji}</Text>
                  <Text style={styles.label}>{g.label}</Text>
                  <Text style={styles.price}>{formatFcfa(g.price)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.button} onPress={() => onSend(selected)}>
          <Text style={styles.buttonText}>
            Envoyer {selected.emoji} · {formatFcfa(selected.price)}
          </Text>
        </Pressable>
        <Text style={styles.note}>Démo : aucun paiement n'est prélevé. Wave et Orange Money seront branchés plus tard.</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D6D6D6', marginBottom: 12 },
  title: { color: colors.navy, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 12.5, textAlign: 'center', marginTop: 2, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  cell: { width: '33.333%', padding: 4 },
  gift: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  giftActive: { borderColor: colors.navy, borderWidth: 2, backgroundColor: colors.surface },
  emoji: { fontSize: 30, lineHeight: 38 },
  label: { color: colors.navy, fontSize: 13, fontWeight: '600' },
  price: { color: colors.textMuted, fontSize: 11.5 },
  button: {
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  note: { color: colors.textMuted, fontSize: 11.5, textAlign: 'center', marginTop: 10, lineHeight: 16 },
});
