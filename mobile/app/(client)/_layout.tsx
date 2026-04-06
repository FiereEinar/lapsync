import { Drawer } from 'expo-router/drawer';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Home, Calendar, Trophy, Activity, User, LogOut } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

export default function ClientLayout() {
  const { logout } = useAuthStore();

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: 'hsl(180, 30%, 15%)' }}>
          <View className="p-4 border-b border-sidebar-border mb-2 mt-4 mx-2">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-success shadow-sm rounded-lg flex items-center justify-center">
                <Text className="text-success-foreground font-bold text-lg">L</Text>
              </View>
              <View>
                <Text className="font-bold text-sidebar-foreground text-base">LapSync</Text>
                <Text className="text-xs text-sidebar-foreground opacity-70">Runner Portal</Text>
              </View>
            </View>
          </View>
          <DrawerItemList {...props} />
          <View className="flex-1" />
          <TouchableOpacity 
            onPress={logout} 
            className="p-4 mx-4 rounded-md flex-row items-center mt-auto mb-8 bg-destructive/20 border border-destructive/30"
          >
            <LogOut size={20} color="hsl(0, 62%, 50%)" />
            <Text className="ml-4 text-destructive font-semibold text-base">Log Out</Text>
          </TouchableOpacity>
        </DrawerContentScrollView>
      )}
      screenOptions={{
        headerStyle: { backgroundColor: 'hsl(180, 30%, 10%)', borderBottomWidth: 1, borderBottomColor: 'hsl(180, 20%, 25%)' },
        headerTintColor: 'hsl(0, 0%, 95%)',
        drawerStyle: { backgroundColor: 'hsl(180, 30%, 15%)', width: 280 },
        drawerActiveBackgroundColor: 'hsl(180, 30%, 20%)',
        drawerActiveTintColor: 'hsl(142, 76%, 36%)', 
        drawerInactiveTintColor: 'hsl(0, 0%, 95%)',
        drawerLabelStyle: { fontSize: 16, fontWeight: '600' }
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          drawerIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          drawerLabel: 'Events',
          title: 'Events',
          drawerIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="leaderboard"
        options={{
          drawerLabel: 'Leaderboard',
          title: 'Leaderboard',
          drawerIcon: ({ color }) => <Trophy size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="race"
        options={{
          drawerLabel: 'Live Race',
          title: 'Live Race',
          drawerIcon: ({ color }) => <Activity size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
          drawerIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Drawer>
  );
}
