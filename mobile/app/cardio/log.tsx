import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { api } from '@/lib/api';
import { colors } from '@/constants/colors';
import { activityLabel } from '@/lib/format';

const ACTIVITIES = ['running', 'cycling', 'walking', 'swimming', 'rowing', 'elliptical'];

export default function LogCardioScreen() {
  const qc = useQueryClient();
  const [activity, setActivity] = useState('running');
  const [name, setName] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [durationSec, setDurationSec] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const totalSec =
        (durationMin ? Number(durationMin) * 60 : 0) + (durationSec ? Number(durationSec) : 0);

      const sessionName = name.trim() || activityLabel(activity);
      const res = await api.post<{ id: number }>('/sessions', {
        name: sessionName,
        type: 'cardio',
        cardio: {
          activity,
          distance_km: distanceKm ? Number(distanceKm) : null,
          duration_seconds: totalSec || null,
          avg_heart_rate: heartRate ? Number(heartRate) : null,
          notes: notes || null,
        },
      });
      await api.put(`/sessions/${res.id}/complete`, {
        duration_minutes: durationMin ? Number(durationMin) : null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['cardio'] });
      router.back();
    },
    onError: (err: Error) => Alert.alert('Erro', err.message),
  });

  const save = () => {
    if (!distanceKm && !durationMin && !durationSec) {
      return Alert.alert('Erro', 'Informe ao menos distância ou duração.');
    }
    mutation.mutate();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Atividade</Text>
        <View style={styles.activityGrid}>
          {ACTIVITIES.map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.activityBtn, activity === a && styles.activityBtnActive]}
              onPress={() => setActivity(a)}
            >
              <Text style={[styles.activityBtnText, activity === a && styles.activityBtnTextActive]}>
                {activityLabel(a)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nome da Atividade (opcional)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Corrida matinal"
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Distância (km)</Text>
        <TextInput
          style={styles.input}
          value={distanceKm}
          onChangeText={setDistanceKm}
          keyboardType="decimal-pad"
          placeholder="Ex: 5.2"
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Duração</Text>
        <View style={styles.durationRow}>
          <View style={styles.durationField}>
            <TextInput
              style={styles.input}
              value={durationMin}
              onChangeText={setDurationMin}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textDim}
            />
            <Text style={styles.durationUnit}>min</Text>
          </View>
          <View style={styles.durationField}>
            <TextInput
              style={styles.input}
              value={durationSec}
              onChangeText={setDurationSec}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textDim}
            />
            <Text style={styles.durationUnit}>seg</Text>
          </View>
        </View>

        <Text style={styles.label}>FC Média (bpm)</Text>
        <TextInput
          style={styles.input}
          value={heartRate}
          onChangeText={setHeartRate}
          keyboardType="numeric"
          placeholder="Ex: 155"
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Como foi o treino?"
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={mutation.isPending}>
          <Text style={styles.saveBtnText}>{mutation.isPending ? 'Salvando...' : 'Salvar Atividade'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: colors.card, color: colors.text, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  activityBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  activityBtnActive: { backgroundColor: colors.greenDim, borderColor: colors.green },
  activityBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  activityBtnTextActive: { color: colors.green },
  durationRow: { flexDirection: 'row', gap: 12 },
  durationField: { flex: 1 },
  durationUnit: { fontSize: 12, color: colors.textDim, textAlign: 'center', marginTop: 4 },
  saveBtn: {
    backgroundColor: colors.green, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
