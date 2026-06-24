import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, WorkoutPlan } from '@/lib/api';
import { colors } from '@/constants/colors';
import { formatDate, typeLabel } from '@/lib/format';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: plan, isLoading } = useQuery<WorkoutPlan>({
    queryKey: ['plan', id],
    queryFn: () => api.get(`/plans/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/plans/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plans'] });
      router.back();
    },
  });

  if (isLoading || !plan) {
    return <View style={styles.container}><Text style={styles.loading}>Carregando...</Text></View>;
  }

  const confirmDelete = () => {
    Alert.alert('Deletar Plano', `Tem certeza que deseja deletar "${plan.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{plan.name}</Text>
          <Text style={styles.type}>{typeLabel(plan.type)}</Text>
        </View>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={colors.red} />
        </TouchableOpacity>
      </View>

      {plan.description ? <Text style={styles.desc}>{plan.description}</Text> : null}
      <Text style={styles.updated}>Atualizado em {formatDate(plan.updated_at)}</Text>

      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => router.push({ pathname: '/workout/start', params: { planId: id } })}
      >
        <Ionicons name="play" size={18} color="#fff" />
        <Text style={styles.startBtnText}>Iniciar com este Plano</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Exercícios ({plan.exercises?.length ?? 0})</Text>
      {plan.exercises?.length === 0 && <Text style={styles.empty}>Nenhum exercício no plano.</Text>}
      {plan.exercises?.map((ex, i) => (
        <View key={ex.id} style={styles.exerciseCard}>
          <View style={styles.exerciseNumber}>
            <Text style={styles.exerciseNumberText}>{i + 1}</Text>
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            <View style={styles.exerciseMeta}>
              {ex.sets ? <Text style={styles.metaChip}>{ex.sets} séries</Text> : null}
              {ex.reps ? <Text style={styles.metaChip}>{ex.reps} reps</Text> : null}
              {ex.weight ? <Text style={styles.metaChip}>{ex.weight}kg</Text> : null}
              {ex.rest_seconds ? <Text style={styles.metaChip}>{ex.rest_seconds}s descanso</Text> : null}
            </View>
            {ex.notes ? <Text style={styles.exerciseNotes}>{ex.notes}</Text> : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  loading: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, flex: 1 },
  type: { fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: 4 },
  deleteBtn: { padding: 8 },
  desc: { fontSize: 14, color: colors.textMuted, marginBottom: 8, lineHeight: 20 },
  updated: { fontSize: 12, color: colors.textDim, marginBottom: 20 },
  startBtn: {
    backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginBottom: 28,
  },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  exerciseCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: colors.border,
  },
  exerciseNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryDim, alignItems: 'center', justifyContent: 'center',
  },
  exerciseNumberText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '600', color: colors.text },
  exerciseMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  metaChip: {
    backgroundColor: colors.surface, color: colors.textMuted,
    fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  exerciseNotes: { fontSize: 12, color: colors.textDim, marginTop: 6, fontStyle: 'italic' },
});
