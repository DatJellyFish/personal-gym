import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { api, WorkoutPlan } from '@/lib/api';
import { colors } from '@/constants/colors';
import { typeLabel } from '@/lib/format';

export default function StartWorkoutScreen() {
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const [name, setName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(planId ? Number(planId) : null);

  const { data: plans } = useQuery<WorkoutPlan[]>({
    queryKey: ['plans'],
    queryFn: () => api.get('/plans'),
  });

  const { data: plan } = useQuery<WorkoutPlan>({
    queryKey: ['plan', selectedPlan],
    queryFn: () => api.get(`/plans/${selectedPlan}`),
    enabled: !!selectedPlan,
  });

  const start = () => {
    const sessionName = name.trim() || plan?.name || 'Treino';
    if (!sessionName) return Alert.alert('Erro', 'Dê um nome ao treino.');
    router.replace({
      pathname: '/workout/active',
      params: { planId: selectedPlan ?? '', name: sessionName },
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nome do Treino</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={plan?.name || 'Ex: Treino A - Peito'}
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Plano (opcional)</Text>
        <View style={styles.planList}>
          <TouchableOpacity
            style={[styles.planOption, !selectedPlan && styles.planOptionActive]}
            onPress={() => setSelectedPlan(null)}
          >
            <Text style={[styles.planOptionText, !selectedPlan && styles.planOptionTextActive]}>Sem plano</Text>
          </TouchableOpacity>
          {plans?.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.planOption, selectedPlan === p.id && styles.planOptionActive]}
              onPress={() => setSelectedPlan(p.id)}
            >
              <Text style={[styles.planOptionText, selectedPlan === p.id && styles.planOptionTextActive]}>
                {p.name}
              </Text>
              <Text style={styles.planType}>{typeLabel(p.type)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {plan?.exercises && plan.exercises.length > 0 && (
          <>
            <Text style={styles.label}>Exercícios do Plano</Text>
            {plan.exercises.map((ex) => (
              <View key={ex.id} style={styles.exPreview}>
                <Text style={styles.exPreviewName}>{ex.name}</Text>
                <Text style={styles.exPreviewMeta}>
                  {[ex.sets && `${ex.sets}x`, ex.reps, ex.weight && `${ex.weight}kg`].filter(Boolean).join(' · ')}
                </Text>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.startBtn} onPress={start}>
          <Text style={styles.startBtnText}>Iniciar Treino</Text>
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
  planList: { gap: 8 },
  planOption: {
    backgroundColor: colors.card, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  planOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  planOptionText: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  planOptionTextActive: { color: colors.primary },
  planType: { fontSize: 12, color: colors.textDim },
  exPreview: {
    backgroundColor: colors.surface, borderRadius: 8, padding: 10, marginBottom: 6,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  exPreviewName: { fontSize: 14, color: colors.text, fontWeight: '500' },
  exPreviewMeta: { fontSize: 12, color: colors.textMuted },
  startBtn: {
    backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 28,
  },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
