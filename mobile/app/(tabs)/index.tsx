import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, Stats, WorkoutSession } from '@/lib/api';
import { colors } from '@/constants/colors';
import { formatRelative, typeLabel } from '@/lib/format';

function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}<Text style={styles.statUnit}>{unit}</Text></Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { data: stats, isLoading: loadingStats } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => api.get('/stats/overview'),
  });

  const { data: sessions } = useQuery<WorkoutSession[]>({
    queryKey: ['sessions', 'recent'],
    queryFn: () => api.get('/sessions?limit=5'),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Personal Gym</Text>
          <Text style={styles.sub}>Bora treinar 💪</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {loadingStats ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : stats ? (
        <View style={styles.statsRow}>
          <StatCard label="Esta semana" value={stats.sessions_this_week} unit=" treinos" />
          <StatCard label="Este mês" value={stats.sessions_this_month} unit=" treinos" />
          <StatCard label="Volume total" value={stats.total_volume_kg.toLocaleString('pt-BR')} unit="kg" />
          <StatCard label="Distância total" value={stats.total_distance_km} unit="km" />
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/workout/start')}>
          <Ionicons name="barbell" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Iniciar Treino</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.green }]} onPress={() => router.push('/cardio/log')}>
          <Ionicons name="footsteps" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Registrar Cardio</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Treinos Recentes</Text>
      {sessions?.length === 0 && (
        <Text style={styles.empty}>Nenhum treino registrado ainda.</Text>
      )}
      {sessions?.map((s) => (
        <TouchableOpacity key={s.id} style={styles.sessionCard} onPress={() => router.push(`/session/${s.id}`)}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>{s.name}</Text>
            <Text style={styles.sessionMeta}>{typeLabel(s.type)} · {formatRelative(s.started_at)}</Text>
          </View>
          {s.completed_at ? (
            <View style={[styles.badge, { backgroundColor: colors.greenDim }]}>
              <Text style={[styles.badgeText, { color: colors.green }]}>Concluído</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: colors.orangeDim }]}>
              <Text style={[styles.badgeText, { color: colors.orange }]}>Em andamento</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  settingsBtn: { padding: 8 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.card,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statUnit: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 16 },
  sessionCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 15, fontWeight: '600', color: colors.text },
  sessionMeta: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
