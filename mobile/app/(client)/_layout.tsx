import { Drawer } from 'expo-router/drawer';
import { useAuthStore } from '../../src/store/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

export default function ClientLayout() {
  const { logout } = useAuthStore();

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
          <View className="p-4 border-b border-zinc-800 mb-2 mt-4 ml-2 mr-2">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Text className="text-white font-bold text-lg">L</Text>
              </View>
              <View>
                <Text className="font-bold text-white text-base">LapSync</Text>
                <Text className="text-xs text-zinc-400">Runner Portal</Text>
              </View>
            </View>
          </View>
          <DrawerItemList {...props} />
          <View className="flex-1" />
          <TouchableOpacity 
            onPress={logout} 
            className="p-4 mx-4 rounded-lg flex-row items-center mt-auto mb-8 bg-red-500/10 border border-red-500/20"
          >
            <MaterialIcons name="logout" size={24} color="#ef4444" />
            <Text className="ml-6 text-red-500 font-semibold text-base">Log Out</Text>
          </TouchableOpacity>
        </DrawerContentScrollView>
      )}
      screenOptions={{
        headerStyle: { backgroundColor: '#09090b', borderBottomWidth: 1, borderBottomColor: '#27272a' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#09090b', width: 280 },
        drawerActiveBackgroundColor: '#18181b',
        drawerActiveTintColor: '#10b981', // emerald-500 to match runner portal theme
        drawerInactiveTintColor: '#a1a1aa',
        drawerLabelStyle: { fontSize: 16, fontWeight: '600' }
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          drawerIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          drawerLabel: 'Events',
          title: 'Events',
          drawerIcon: ({ color }) => <MaterialIcons name="event" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="leaderboard"
        options={{
          drawerLabel: 'Leaderboard',
          title: 'Leaderboard',
          drawerIcon: ({ color }) => <MaterialIcons name="leaderboard" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="race"
        options={{
          drawerLabel: 'Live Race',
          title: 'Live Race',
          drawerIcon: ({ color }) => <MaterialIcons name="run-circle" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
          drawerIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
    </Drawer>
  );
}
