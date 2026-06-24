import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { colors } from '@/constants/colors';

type Exercise = { name: string; sets: string; reps: string; weight: string; rest_seconds: string; notes: string };

const emptyEx = (): Exercise => ({ name: '', sets: '3', reps: '12', weight: '', rest_seconds: '60', notes: '' });

export default function NewPlanScreen() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'strength' | 'cardio' | 'mixed'>('strength');
  const [exercises, setExercises] = useState<Exercise[]>([emptyEx()]);

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/plans', {
        name,
        description: description || null,
        type,
        exercises: exercises
          .filter((e) => e.name.trim())
          .map((e) => ({
            name: e.name.trim(),
            sets: e.sets ? Number(e.sets) : null,
            reps: e.reps || null,
            weight: e.weight ? Number(e.weight) : null,
            rest_seconds: e.rest_seconds ? Number(e.rest_seconds) : null,
            notes: e.notes || null,
          })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plans'] });
      router.back();
    },
    onError: (err: Error) => Alert.alert('Erro', err.message),
  });

  const updateEx = (i: number, field: keyof Exercise, value: string) => {
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex)));
  };
  const removeEx = (i: number) => setExercises((prev) => prev.filter((_, idx) => idx !== i));
  const addEx = () => setExercises((prev) => [...prev, emptyEx()]);

  const save = () => {
    if (!name.trim()) return Alert.alert('Erro', 'Nome do plano é obrigatório.');
    mutation.mutate();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nome do Plano *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Treino A - Peito e Tríceps" placeholderTextColor={colors.textDim} />

        <Text style={styles.label}>Descrição</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Descrição opcional..." placeholderTextColor={colors.textDim} multiline numberOfLines={3} />

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.typeRow}>
          {(['strength', 'cardio', 'mixed'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                {t === 'strength' ? 'Musculação' : t === 'cardio' ? 'Cardio' : 'Misto'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.exHeader}>
          <Text style={styles.label}>Exercícios</Text>
          <TouchableOpacity onPress={addEx} style={styles.addExBtn}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.addExText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {exercises.map((ex, i) => (
          <View key={i} style={styles.exCard}>
            <View style={styles.exCardHeader}>
              <Text style={styles.exIndex}>Exercício {i + 1}</Text>
              {exercises.length > 1 && (
                <TouchableOpacity onPress={() => removeEx(i)}>
                  <Ionicons name="close-circle" size={20} color={colors.red} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput style={styles.input} value={ex.name} onChangeText={(v) => updateEx(i, 'name', v)} placeholder="Nome do exercício" placeholderTextColor={colors.textDim} />
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.miniLabel}>Séries</Text>
                <TextInput style={styles.input} value={ex.sets} onChangeText={(v) => updateEx(i, 'sets', v)} keyboardType="numeric" placeholder="3" placeholderTextColor={colors.textDim} />
              </View>
              <View style={styles.col}>
                <Text style={styles.miniLabel}>Reps</Text>
                <TextInput style={styles.input} value={ex.reps} onChangeText={(v) => updateEx(i, 'reps', v)} placeholder="12" placeholderTextColor={colors.textDim} />
              </View>
              <View style={styles.col}>
                <Text style={styles.miniLabel}>Peso (kg)</Text>
                <TextInput style={styles.input} value={ex.weight} onChangeText={(v) => updateEx(i, 'weight', v)} keyboardType="numeric" placeholder="—" placeholderTextColor={colors.textDim} />
              </View>
            </View>
            <Text style={styles.miniLabel}>Descanso (seg)</Text>
            <TextInput style={styles.input} value={ex.rest_seconds} onChangeText={(v) => updateEx(i, 'rest_seconds', v)} keyboardType="numeric" placeholder="60" placeholderTextColor={colors.textDim} />
            <Text style={styles.miniLabel}>Observações</Text>
            <TextInput style={styles.input} value={ex.notes} onChangeText={(v) => updateEx(i, 'notes', v)} placeholder="Opcional..." placeholderTextColor={colors.textDim} />
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={mutation.isPending}>
          <Text style={styles.saveBtnText}>{mutation.isPending ? 'Salvando...' : 'Salvar Plano'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: 6, marginTop: 14 },
  miniLabel: { fontSize: 12, color: colors.textDim, marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: colors.card, color: colors.text, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  typeBtnActive: { backgroundColor: colors.primaryDim, borderColor: colors.primary },
  typeBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  typeBtnTextActive: { color: colors.primary },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 4 },
  addExBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addExText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  exCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  exCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  exIndex: { fontSize: 13, fontWeight: '700', color: colors.primary },
  row: { flexDirection: 'row', gap: 8 },
  col: { flex: 1 },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
