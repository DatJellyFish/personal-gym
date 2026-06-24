import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, PR } from '@/lib/api';
import { colors } from '@/constants/colors';
import { activityLabel, formatDate, formatDuration, formatPace } from '@/lib/format';

type CardioEntry = {
  started_at: string;
  name: string;
  activity: string;
  distance_km: number | null;
  duration_seconds: number | null;
  avg_heart_rate: number | null;
  pace_min_per_km: number | null;
};

export default function StatsScreen() {
  const { data: prs, isLoading: loadPrs } = useQuery<PR[]>({
    queryKey: ['prs'],
    queryFn: () => api.get('/stats/prs'),
  });
  const { data: cardio, isLoading: loadCardio } = useQuery<CardioEntry[]>({
    queryKey: ['cardio'],
    queryFn: () => api.get('/stats/cardio'),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Records Pessoais (PRs)</Text>
      {loadPrs ? (
        <ActivityIndicator color={colors.primary} />
      ) : prs?.length === 0 ? (
        <Text style={styles.empty}>Nenhum PR registrado ainda.</Text>
      ) : (
        prs?.map((pr) => (
          <TouchableOpacity
            key={pr.name}
            style={styles.prCard}
            onPress={() => router.push(`/stats/exercise/${encodeURIComponent(pr.name)}`)}
          >
            <View style={styles.prLeft}>
              <Text style={styles.prName}>{pr.name}</Text>
              <Text style={styles.prSessions}>{pr.sessions_count} sessão(ões)</Text>
            </View>
            <View style={styles.prRight}>
              <Text style={styles.prWeight}>{pr.max_weight}kg</Text>
              {pr.reps_at_max ? (
                <Text style={styles.prReps}>x{pr.reps_at_max}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Histórico de Cardio</Text>
      {loadCardio ? (
        <ActivityIndicator color={colors.primary} />
      ) : cardio?.length === 0 ? (
        <Text style={styles.empty}>Nenhuma atividade cardio registrada.</Text>
      ) : (
        cardio?.map((c, i) => (
          <View key={i} style={styles.cardioCard}>
            <View style={styles.cardioHeader}>
              <Text style={styles.cardioActivity}>{activityLabel(c.activity)}</Text>
              <Text style={styles.cardioDate}>{formatDate(c.started_at)}</Text>
            </View>
            <View style={styles.cardioStats}>
              {c.distance_km != null && (
                <View style={styles.cardioStat}>
                  <Text style={styles.cardioStatValue}>{c.distance_km.toFixed(2)}</Text>
                  <Text style={styles.cardioStatLabel}>km</Text>
                </View>
              )}
              {c.duration_seconds != null && (
                <View style={styles.cardioStat}>
                  <Text style={styles.cardioStatValue}>{formatDuration(c.duration_seconds)}</Text>
                  <Text style={styles.cardioStatLabel}>tempo</Text>
                </View>
              )}
              {c.pace_min_per_km != null && (
                <View style={styles.cardioStat}>
                  <Text style={styles.cardioStatValue}>{formatPace(c.pace_min_per_km)}</Text>
                  <Text style={styles.cardioStatLabel}>ritmo</Text>
                </View>
              )}
              {c.avg_heart_rate != null && (
                <View style={styles.cardioStat}>
                  <Text style={styles.cardioStatValue}>{c.avg_heart_rate}</Text>
                  <Text style={styles.cardioStatLabel}>bpm</Text>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginVertical: 16 },

  prCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  prLeft: { flex: 1 },
  prName: { fontSize: 15, fontWeight: '600', color: colors.text },
  prSessions: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  prRight: { alignItems: 'flex-end' },
  prWeight: { fontSize: 20, fontWeight: '800', color: colors.primary },
  prReps: { fontSize: 12, color: colors.textMuted },

  cardioCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  cardioHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardioActivity: { fontSize: 15, fontWeight: '600', color: colors.text },
  cardioDate: { fontSize: 12, color: colors.textMuted },
  cardioStats: { flexDirection: 'row', gap: 20 },
  cardioStat: {},
  cardioStatValue: { fontSize: 18, fontWeight: '700', color: colors.green },
  cardioStatLabel: { fontSize: 11, color: colors.textMuted },
});
