import { Drawer } from 'expo-router/drawer';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Home, Calendar, Trophy, Activity, User, LogOut } from 'lucide-react-native';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';

export default function ClientLayout() {
  const { logout } = useAuthStore();

  const confirmLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout }
    ]);
  };

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: 'hsl(220, 20%, 8%)' }}>
          {/* Sidebar Header */}
          <View className="mx-4 mb-4 mt-4 overflow-hidden rounded-2xl">
            <LinearGradient
              colors={['hsla(152, 60%, 42%, 0.2)', 'hsla(152, 60%, 42%, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16 }}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden">
                  <LinearGradient
                    colors={['hsl(152, 60%, 42%)', 'hsl(152, 70%, 32%)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text className="text-white font-extrabold text-lg">L</Text>
                  </LinearGradient>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-white text-base tracking-wide">LapSync</Text>
                  <Text className="text-xs text-white/50 font-medium">Runner Portal</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View className="mx-2">
            <Text className="px-4 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-[2px]">Navigation</Text>
          </View>
          <DrawerItemList {...props} />
          <View className="flex-1" />
          <TouchableOpacity 
            onPress={confirmLogout} 
            className="mx-4 mb-8 rounded-xl flex-row items-center py-3.5 px-4"
            style={{ backgroundColor: 'hsla(0, 62%, 50%, 0.1)', borderWidth: 1, borderColor: 'hsla(0, 62%, 50%, 0.15)' }}
            activeOpacity={0.7}
          >
            <LogOut size={18} color="hsl(0, 62%, 55%)" />
            <Text style={{ color: 'hsl(0, 62%, 55%)' }} className="ml-3 font-semibold text-sm">Log Out</Text>
          </TouchableOpacity>
        </DrawerContentScrollView>
      )}
      screenOptions={{
        headerStyle: { backgroundColor: 'hsl(220, 20%, 8%)' },
        headerTintColor: 'hsl(210, 20%, 95%)',
        headerShadowVisible: false,
        drawerStyle: { backgroundColor: 'hsl(220, 20%, 8%)', width: 280 },
        drawerActiveBackgroundColor: 'hsla(152, 60%, 42%, 0.1)',
        drawerActiveTintColor: 'hsl(152, 60%, 42%)', 
        drawerInactiveTintColor: 'hsla(210, 20%, 95%, 0.6)',
        drawerLabelStyle: { fontSize: 14, fontWeight: '600', marginLeft: -8 },
        drawerItemStyle: { borderRadius: 12, marginHorizontal: 8, paddingVertical: 2 },
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          drawerIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          drawerLabel: 'Events',
          title: 'Events',
          drawerIcon: ({ color }) => <Calendar size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="leaderboard"
        options={{
          drawerLabel: 'Leaderboard',
          title: 'Leaderboard',
          drawerIcon: ({ color }) => <Trophy size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="race"
        options={{
          drawerLabel: 'Live Race',
          title: 'Live Race',
          drawerIcon: ({ color }) => <Activity size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
          drawerIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />
    </Drawer>
  );
}
