import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, WorkoutSession } from '@/lib/api';
import { colors } from '@/constants/colors';
import { formatDate, formatDuration, typeLabel } from '@/lib/format';

export default function HistoryScreen() {
  const { data: sessions, isLoading, refetch } = useQuery<WorkoutSession[]>({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions?limit=100'),
  });

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(s) => String(s.id)}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={<Text style={styles.empty}>Nenhuma sessão registrada ainda.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/session/${item.id}`)}>
              <View style={styles.left}>
                <View style={[styles.typeIcon, { backgroundColor: item.type === 'cardio' ? colors.greenDim : colors.primaryDim }]}>
                  <Ionicons
                    name={item.type === 'cardio' ? 'footsteps' : 'barbell'}
                    size={18}
                    color={item.type === 'cardio' ? colors.green : colors.primary}
                  />
                </View>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {typeLabel(item.type)}
                  {item.duration_minutes ? ` · ${formatDuration(item.duration_minutes * 60)}` : ''}
                  {item.plan_name ? ` · ${item.plan_name}` : ''}
                </Text>
                <Text style={styles.date}>{formatDate(item.started_at)}</Text>
              </View>
              <View style={styles.right}>
                {item.completed_at ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.green} />
                ) : (
                  <Ionicons name="ellipsis-horizontal-circle" size={20} color={colors.orange} />
                )}
              </View>
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
  card: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  left: {},
  typeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  date: { fontSize: 11, color: colors.textDim, marginTop: 2 },
  right: {},
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
