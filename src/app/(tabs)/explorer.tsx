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
        <Ionicons name="search-outline" size={19} color={colors.navySoft} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un live ou un créateur"
          placeholderTextColor={colors.navySoft}
          style={styles.input}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsBar}>
        {[{ id: null, label: 'Tout' }, ...categories].map((c) => {
          const active = category === c.id;
          return (
            <Pressable key={c.label} onPress={() => setCategory(c.id)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView style={{ backgroundColor: colors.surface }} contentContainerStyle={styles.grid}>
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
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, height: 44, fontSize: 14, color: colors.navy, outlineStyle: 'none' } as object,
  chipsBar: { flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: 14, gap: 8, paddingBottom: 10, alignItems: 'center' },
  chip: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { color: colors.navy, fontSize: 13, lineHeight: 16 },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 9, paddingBottom: 24, backgroundColor: colors.surface, paddingTop: 5 },
  cell: { width: '50%', padding: 5 },
  empty: { color: colors.textMuted, padding: 20, fontSize: 15 },
});
