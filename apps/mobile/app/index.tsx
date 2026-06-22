import { useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';

export default function Index() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avia Tech Academy</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0d9488', // teal-600
  },
});
