import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="plan/[id]" options={{ title: 'Plano de Treino' }} />
        <Stack.Screen name="plan/new" options={{ title: 'Novo Plano' }} />
        <Stack.Screen name="session/[id]" options={{ title: 'Sessão' }} />
        <Stack.Screen name="workout/start" options={{ title: 'Iniciar Treino', presentation: 'modal' }} />
        <Stack.Screen name="workout/active" options={{ title: 'Treino em Andamento', headerBackVisible: false }} />
        <Stack.Screen name="cardio/log" options={{ title: 'Registrar Cardio', presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ title: 'Configurações' }} />
      </Stack>
    </QueryClientProvider>
  );
}
