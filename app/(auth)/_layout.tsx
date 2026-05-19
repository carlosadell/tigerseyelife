import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../lib/brand';

export default function AuthLayout() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.tigerGold} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/today" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: COLORS.onyx },
        headerShown: false,
      }}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: COLORS.onyx,
    flex: 1,
    justifyContent: 'center',
  },
});
