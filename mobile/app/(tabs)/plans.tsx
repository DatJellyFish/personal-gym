import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, WorkoutPlan } from '@/lib/api';
import { colors } from '@/constants/colors';
import { typeLabel } from '@/lib/format';

const typeColor: Record<string, string> = {
  strength: colors.primary,
  cardio: colors.green,
  mixed: colors.orange,
};

export default function PlansScreen() {
  const { data: plans, isLoading, refetch } = useQuery<WorkoutPlan[]>({
    queryKey: ['plans'],
    queryFn: () => api.get('/plans'),
  });

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/plan/new')}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.newBtnText}>Novo Plano</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum plano criado ainda.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/plan/${item.id}`)}>
              <View style={[styles.typeBar, { backgroundColor: typeColor[item.type] ?? colors.primary }]} />
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
                ) : null}
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>{typeLabel(item.type)}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>{item.exercise_count} exercícios</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, paddingBottom: 32 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, marginBottom: 16,
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: colors.card, borderRadius: 12, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  typeBar: { width: 4, alignSelf: 'stretch' },
  cardContent: { flex: 1, padding: 14 },
  cardName: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  metaText: { fontSize: 12, color: colors.textMuted },
  metaDot: { color: colors.textDim },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
