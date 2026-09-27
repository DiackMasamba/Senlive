import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../../components/AppText';
import { Header } from '../../components/Header';
import { LiveCard } from '../../components/LiveCard';
import { categories } from '../../data/mock';
import { useLives } from '../../data/useLives';
import { colors, radius } from '../../theme';

export default function ExplorerScreen() {
  const { lives } = useLives();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lives.filter(
      (l) =>
        (!category || l.category === category) &&
        (!q || l.title.toLowerCase().includes(q) || l.host.toLowerCase().includes(q) || l.handle.includes(q)),
    );
  }, [lives, query, category]);

  return (
    <View style={styles.screen}>
      <Header />
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={colors.navySoft} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un live ou un créateur"
          placeholderTextColor={colors.navySoft}
          style={styles.input}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ flexGrow: 0 }}>
        {[{ id: null, label: 'Tout' }, ...categories].map((c) => {
          const active = category === c.id;
          return (
            <Pressable key={c.label} onPress={() => setCategory(c.id)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.grid}>
        {results.map((live) => (
          <View key={live.id} style={styles.cell}>
            <LiveCard live={live} />
          </View>
        ))}
        {results.length === 0 && <Text style={styles.empty}>Aucun live ne correspond à ta recherche.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.2,
    borderColor: colors.border,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.navy },
  chips: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { color: colors.navy, fontSize: 14 },
  chipTextActive: { color: colors.yellow, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, paddingBottom: 30 },
  cell: { width: '50%', padding: 6 },
  empty: { color: colors.textMuted, padding: 20, fontSize: 15 },
});
