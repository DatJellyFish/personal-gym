import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, WorkoutSession } from '@/lib/api';
import { colors } from '@/constants/colors';
import { activityLabel, formatDate, formatDuration, formatPace, typeLabel } from '@/lib/format';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: session, isLoading } = useQuery<WorkoutSession>({
    queryKey: ['session', id],
    queryFn: () => api.get(`/sessions/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/sessions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      router.back();
    },
  });

  if (isLoading || !session) {
    return <View style={styles.container}><Text style={styles.loading}>Carregando...</Text></View>;
  }

  const confirmDelete = () => {
    Alert.alert('Deletar Sessão', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const cardio = session.cardio?.[0];
  const pace = cardio?.distance_km && cardio?.duration_seconds
    ? (cardio.duration_seconds / 60) / cardio.distance_km
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{session.name}</Text>
          <Text style={styles.type}>{typeLabel(session.type)}</Text>
          {session.plan_name && <Text style={styles.plan}>Plano: {session.plan_name}</Text>}
          <Text style={styles.date}>{formatDate(session.started_at)}</Text>
        </View>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={colors.red} />
        </TouchableOpacity>
      </View>

      <View style={styles.badges}>
        {session.completed_at ? (
          <View style={[styles.badge, { backgroundColor: colors.greenDim }]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.green} />
            <Text style={[styles.badgeText, { color: colors.green }]}>Concluído</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: colors.orangeDim }]}>
            <Text style={[styles.badgeText, { color: colors.orange }]}>Em andamento</Text>
          </View>
        )}
        {session.duration_minutes ? (
          <View style={[styles.badge, { backgroundColor: colors.card }]}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.badgeText, { color: colors.textMuted }]}>
              {formatDuration(session.duration_minutes * 60)}
            </Text>
          </View>
        ) : null}
      </View>

      {session.notes ? <Text style={styles.notes}>{session.notes}</Text> : null}

      {session.type === 'cardio' && cardio ? (
        <>
          <Text style={styles.sectionTitle}>{activityLabel(cardio.activity)}</Text>
          <View style={styles.cardioStats}>
            {cardio.distance_km != null && (
              <View style={styles.cardioStat}>
                <Text style={styles.cardioValue}>{cardio.distance_km.toFixed(2)}</Text>
                <Text style={styles.cardioLabel}>km</Text>
              </View>
            )}
            {cardio.duration_seconds != null && (
              <View style={styles.cardioStat}>
                <Text style={styles.cardioValue}>{formatDuration(cardio.duration_seconds)}</Text>
                <Text style={styles.cardioLabel}>tempo</Text>
              </View>
            )}
            {pace != null && (
              <View style={styles.cardioStat}>
                <Text style={styles.cardioValue}>{formatPace(pace)}</Text>
                <Text style={styles.cardioLabel}>ritmo</Text>
              </View>
            )}
            {cardio.avg_heart_rate != null && (
              <View style={styles.cardioStat}>
                <Text style={styles.cardioValue}>{cardio.avg_heart_rate}</Text>
                <Text style={styles.cardioLabel}>bpm</Text>
              </View>
            )}
          </View>
          {cardio.notes ? <Text style={styles.notes}>{cardio.notes}</Text> : null}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Exercícios</Text>
          {session.exercises?.map((ex) => (
            <View key={ex.name} style={styles.exCard}>
              <Text style={styles.exName}>{ex.name}</Text>
              <View style={styles.setHeader}>
                <Text style={[styles.setCol, styles.setLabel]}>Série</Text>
                <Text style={[styles.setCol, styles.setLabel]}>Kg</Text>
                <Text style={[styles.setCol, styles.setLabel]}>Reps</Text>
                <Text style={[styles.setCol, styles.setLabel]}>Volume</Text>
              </View>
              {ex.sets.map((s, i) => (
                <View key={i} style={styles.setRow}>
                  <Text style={[styles.setCol, styles.setValue]}>{s.set}</Text>
                  <Text style={[styles.setCol, styles.setValue]}>{s.weight ?? '—'}</Text>
                  <Text style={[styles.setCol, styles.setValue]}>{s.reps ?? '—'}</Text>
                  <Text style={[styles.setCol, styles.setValue]}>
                    {s.weight && s.reps ? `${(s.weight * s.reps).toFixed(0)}kg` : '—'}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  loading: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  type: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 4 },
  plan: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  date: { fontSize: 12, color: colors.textDim, marginTop: 2 },
  deleteBtn: { padding: 8 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  notes: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic', marginBottom: 16, lineHeight: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  cardioStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 },
  cardioStat: {},
  cardioValue: { fontSize: 26, fontWeight: '800', color: colors.green },
  cardioLabel: { fontSize: 12, color: colors.textMuted },
  exCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  exName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  setHeader: { flexDirection: 'row', marginBottom: 4 },
  setRow: { flexDirection: 'row', paddingVertical: 4 },
  setCol: { flex: 1, textAlign: 'center' },
  setLabel: { fontSize: 11, color: colors.textDim, fontWeight: '600' },
  setValue: { fontSize: 14, color: colors.text },
});
