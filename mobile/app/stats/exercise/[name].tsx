import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '@/lib/api';
import { colors } from '@/constants/colors';
import { formatDate } from '@/lib/format';

type ExSession = {
  date: string;
  max_weight: number;
  sets: { set: number; reps: number; weight: number }[];
};

export default function ExerciseHistoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const decoded = decodeURIComponent(name);

  const { data, isLoading } = useQuery<ExSession[]>({
    queryKey: ['exercise-history', decoded],
    queryFn: () => api.get(`/stats/exercise/${encodeURIComponent(decoded)}`),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{decoded}</Text>

      {isLoading && <Text style={styles.loading}>Carregando...</Text>}
      {data?.length === 0 && <Text style={styles.empty}>Sem histórico ainda.</Text>}

      {data?.map((session, i) => (
        <View key={i} style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
            <Text style={styles.sessionMax}>{session.max_weight}kg max</Text>
          </View>
          <View style={styles.setHeader}>
            <Text style={[styles.setCol, styles.setLabel]}>Série</Text>
            <Text style={[styles.setCol, styles.setLabel]}>Kg</Text>
            <Text style={[styles.setCol, styles.setLabel]}>Reps</Text>
            <Text style={[styles.setCol, styles.setLabel]}>Volume</Text>
          </View>
          {session.sets.map((s, si) => (
            <View key={si} style={styles.setRow}>
              <Text style={[styles.setCol, styles.setValue]}>{s.set}</Text>
              <Text style={[styles.setCol, styles.setValue]}>{s.weight}</Text>
              <Text style={[styles.setCol, styles.setValue]}>{s.reps}</Text>
              <Text style={[styles.setCol, styles.setValue]}>{(s.weight * s.reps).toFixed(0)}kg</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 20 },
  loading: { color: colors.textMuted, textAlign: 'center', marginTop: 20 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 20 },
  sessionCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sessionDate: { fontSize: 14, color: colors.textMuted },
  sessionMax: { fontSize: 14, fontWeight: '700', color: colors.primary },
  setHeader: { flexDirection: 'row', marginBottom: 4 },
  setRow: { flexDirection: 'row', paddingVertical: 3 },
  setCol: { flex: 1, textAlign: 'center' },
  setLabel: { fontSize: 11, color: colors.textDim, fontWeight: '600' },
  setValue: { fontSize: 14, color: colors.text },
});
