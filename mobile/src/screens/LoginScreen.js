import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { readError } from '../lib/api';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(readError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoGlyph}>Λ</Text>
            </View>
            <Text style={styles.logoText}>RepairTrack</Text>
          </View>

          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Staff sign in to manage repairs on the go.</Text>

          {error && (
            <View style={styles.alert}>
              <Text style={styles.alertText}>{error.message}</Text>
            </View>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, error?.fields?.email && styles.inputError]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@shop.com"
            placeholderTextColor={colors.muted}
          />
          {error?.fields?.email && <Text style={styles.fieldError}>{error.fields.email}</Text>}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, error?.fields?.password && styles.inputError]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="Your password"
            placeholderTextColor={colors.muted}
            onSubmitEditing={onSubmit}
          />
          {error?.fields?.password && <Text style={styles.fieldError}>{error.fields.password}</Text>}

          <Pressable
            onPress={onSubmit}
            disabled={busy}
            style={({ pressed }) => [styles.button, (pressed || busy) && { opacity: 0.8 }]}
          >
            {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Sign in</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 24, paddingTop: 48 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoGlyph: { color: colors.white, fontSize: 20, fontWeight: '700' },
  logoText: { fontSize: 20, fontWeight: '600', color: colors.text },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: 4, marginBottom: 24, color: colors.muted, fontSize: 15 },
  alert: { backgroundColor: colors.dangerSoft, borderRadius: 10, padding: 12, marginBottom: 16 },
  alertText: { color: colors.danger, fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 12, marginTop: 4 },
  button: {
    marginTop: 28,
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
