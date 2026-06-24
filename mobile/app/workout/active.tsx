import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, WorkoutPlan } from '@/lib/api';
import { colors } from '@/constants/colors';
import { formatDuration } from '@/lib/format';

type ExSet = { reps: string; weight: string; done: boolean };
type ExEntry = { name: string; sets: ExSet[] };

function buildFromPlan(plan: WorkoutPlan): ExEntry[] {
  return (plan.exercises ?? []).map((ex) => ({
    name: ex.name,
    sets: Array.from({ length: ex.sets ?? 3 }, () => ({
      reps: String(ex.reps ?? ''),
      weight: String(ex.weight ?? ''),
      done: false,
    })),
  }));
}

export default function ActiveWorkoutScreen() {
  const { planId, name } = useLocalSearchParams<{ planId?: string; name: string }>();
  const qc = useQueryClient();

  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [exercises, setExercises] = useState<ExEntry[]>([]);
  const [addingEx, setAddingEx] = useState(false);
  const [newExName, setNewExName] = useState('');

  const { data: plan } = useQuery<WorkoutPlan>({
    queryKey: ['plan', planId],
    queryFn: () => api.get(`/plans/${planId}`),
    enabled: !!planId,
  });

  useEffect(() => {
    if (plan && exercises.length === 0) {
      setExercises(buildFromPlan(plan));
    }
  }, [plan]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const finishMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ id: number }>('/sessions', {
        plan_id: planId ? Number(planId) : null,
        name,
        type: 'strength',
        started_at: new Date(startTime.current).toISOString(),
        exercises: exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets
            .filter((s) => s.done)
            .map((s, i) => ({
              set: i + 1,
              reps: s.reps ? Number(s.reps) : null,
              weight: s.weight ? Number(s.weight) : null,
            })),
        })),
      });
      await api.put(`/sessions/${res.id}/complete`, {
        duration_minutes: Math.floor(elapsed / 60),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['prs'] });
      router.replace('/(tabs)/history');
    },
    onError: (err: Error) => Alert.alert('Erro', err.message),
  });

  const confirmFinish = () => {
    Alert.alert('Finalizar Treino', 'Encerrar e salvar o treino?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Finalizar', onPress: () => finishMutation.mutate() },
    ]);
  };

  const updateSet = (ei: number, si: number, field: keyof ExSet, value: string | boolean) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === ei
          ? { ...ex, sets: ex.sets.map((s, j) => (j === si ? { ...s, [field]: value } : s)) }
          : ex
      )
    );
  };

  const addSet = (ei: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === ei ? { ...ex, sets: [...ex.sets, { reps: '', weight: '', done: false }] } : ex
      )
    );
  };

  const addExercise = () => {
    if (!newExName.trim()) return;
    setExercises((prev) => [
      ...prev,
      { name: newExName.trim(), sets: [{ reps: '', weight: '', done: false }] },
    ]);
    setNewExName('');
    setAddingEx(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.timerBar}>
        <Text style={styles.timerText}>{formatDuration(elapsed)}</Text>
        <Text style={styles.workoutName}>{name}</Text>
        <TouchableOpacity style={styles.finishBtn} onPress={confirmFinish} disabled={finishMutation.isPending}>
          <Text style={styles.finishBtnText}>{finishMutation.isPending ? '...' : 'Finalizar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {exercises.map((ex, ei) => (
          <View key={ei} style={styles.exCard}>
            <Text style={styles.exName}>{ex.name}</Text>
            <View style={styles.setHeader}>
              <Text style={[styles.setCol, styles.setColLabel]}>Série</Text>
              <Text style={[styles.setCol, styles.setColLabel]}>Kg</Text>
              <Text style={[styles.setCol, styles.setColLabel]}>Reps</Text>
              <Text style={[styles.setCheck, styles.setColLabel]}>✓</Text>
            </View>
            {ex.sets.map((s, si) => (
              <View key={si} style={[styles.setRow, s.done && styles.setRowDone]}>
                <Text style={[styles.setCol, styles.setNum]}>{si + 1}</Text>
                <TextInput
                  style={[styles.setCol, styles.setInput]}
                  value={s.weight}
                  onChangeText={(v) => updateSet(ei, si, 'weight', v)}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={colors.textDim}
                  editable={!s.done}
                />
                <TextInput
                  style={[styles.setCol, styles.setInput]}
                  value={s.reps}
                  onChangeText={(v) => updateSet(ei, si, 'reps', v)}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={colors.textDim}
                  editable={!s.done}
                />
                <TouchableOpacity
                  style={[styles.setCheck, s.done && styles.setCheckDone]}
                  onPress={() => updateSet(ei, si, 'done', !s.done)}
                >
                  <Ionicons name={s.done ? 'checkmark' : 'ellipse-outline'} size={20} color={s.done ? '#fff' : colors.textDim} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(ei)}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={styles.addSetText}>Adicionar Série</Text>
            </TouchableOpacity>
          </View>
        ))}

        {addingEx ? (
          <View style={styles.addExCard}>
            <TextInput
              style={styles.addExInput}
              value={newExName}
              onChangeText={setNewExName}
              placeholder="Nome do exercício"
              placeholderTextColor={colors.textDim}
              autoFocus
            />
            <View style={styles.addExActions}>
              <TouchableOpacity style={styles.addExCancel} onPress={() => setAddingEx(false)}>
                <Text style={{ color: colors.textMuted }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addExConfirm} onPress={addExercise}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addExBtn} onPress={() => setAddingEx(true)}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.addExBtnText}>Adicionar Exercício</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  timerBar: {
    backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  timerText: { fontSize: 20, fontWeight: '800', color: colors.primary, width: 70 },
  workoutName: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'center' },
  finishBtn: { backgroundColor: colors.green, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  finishBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  exCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  exName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  setHeader: { flexDirection: 'row', marginBottom: 4 },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  setRowDone: { opacity: 0.5 },
  setCol: { flex: 1, textAlign: 'center' },
  setColLabel: { fontSize: 12, color: colors.textDim, fontWeight: '600' },
  setNum: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  setInput: {
    backgroundColor: colors.surface, color: colors.text, borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 4, fontSize: 15, textAlign: 'center',
    marginHorizontal: 4,
  },
  setCheck: { flex: undefined, width: 40, alignItems: 'center', justifyContent: 'center', height: 36, borderRadius: 8 },
  setCheckDone: { backgroundColor: colors.green },
  addSetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8,
    paddingVertical: 6, justifyContent: 'center',
  },
  addSetText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  addExBtn: {
    backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    borderStyle: 'dashed', paddingVertical: 16, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  addExBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  addExCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  addExInput: {
    backgroundColor: colors.surface, color: colors.text, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 10,
  },
  addExActions: { flexDirection: 'row', gap: 8 },
  addExCancel: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.surface, alignItems: 'center',
  },
  addExConfirm: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center',
  },
});
