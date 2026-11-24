import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme/colors';

const ROLE_LABEL = { SHOP_ADMIN: 'Shop admin', FRONT_DESK: 'Front desk', TECHNICIAN: 'Technician' };

export default function HomeScreen() {
  const { user, shop, role, logout } = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.hello}>Welcome back</Text>
      <Text style={styles.name}>{user?.fullName}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>SHOP</Text>
        <Text style={styles.cardValue}>{shop?.shopName || 'No shop yet'}</Text>
        {shop && <Text style={styles.cardHint}>{shop.shopCode}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>YOUR ROLE</Text>
        <Text style={styles.cardValue}>{ROLE_LABEL[role] || 'None'}</Text>
        <Text style={styles.cardHint}>{user?.email}</Text>
      </View>

      <View style={[styles.card, styles.placeholder]}>
        <Text style={styles.placeholderTitle}>Your tickets will appear here</Text>
        <Text style={styles.cardHint}>Ticket list and status updates arrive in milestone 5.</Text>
      </View>

      <Pressable onPress={logout} style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.7 }]}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hello: { color: colors.muted, fontSize: 14 },
  name: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, color: '#94A3B8' },
  cardValue: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 6 },
  cardHint: { fontSize: 13, color: colors.muted, marginTop: 2 },
  placeholder: { borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', paddingVertical: 28 },
  placeholderTitle: { fontWeight: '600', color: colors.text, marginBottom: 4 },
  signOut: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  signOutText: { color: colors.text, fontWeight: '600' },
});
