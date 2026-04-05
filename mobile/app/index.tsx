import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function Index() {
  const { user } = useAuthStore();
  
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === 'admin') return <Redirect href="/(admin)/dashboard" />;
  
  return <Redirect href="/(client)/dashboard" />;
}
