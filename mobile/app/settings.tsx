import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getServerUrl, setServerUrl } from '@/lib/api';
import { colors } from '@/constants/colors';

export default function SettingsScreen() {
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getServerUrl().then(setUrl);
  }, []);

  const save = async () => {
    if (!url.trim()) return Alert.alert('Erro', 'URL não pode ser vazia.');
    try {
      await setServerUrl(url.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.label}>URL do Servidor</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="http://192.168.1.100:3333"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hint}>
          Informe o IP do seu servidor caseiro na rede local.{'\n'}
          Exemplo: http://192.168.1.100:3333
        </Text>

        <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={save}>
          <Text style={styles.saveBtnText}>{saved ? 'Salvo!' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: colors.card, color: colors.text, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  hint: { fontSize: 13, color: colors.textDim, marginTop: 10, lineHeight: 20 },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 28,
  },
  saveBtnDone: { backgroundColor: colors.green },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
