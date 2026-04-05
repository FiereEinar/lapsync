import { Drawer } from 'expo-router/drawer';
import { useAuthStore } from '../../src/store/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

export default function AdminLayout() {
  const { logout } = useAuthStore();

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
          <View className="p-4 border-b border-zinc-800 mb-2 mt-4 ml-2 mr-2">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Text className="text-white font-bold text-lg">L</Text>
              </View>
              <View>
                <Text className="font-bold text-white text-base">LapSync</Text>
                <Text className="text-xs text-zinc-400">Event Management</Text>
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
        drawerActiveTintColor: '#3b82f6',
        drawerInactiveTintColor: '#a1a1aa',
        drawerLabelStyle: { fontSize: 16, fontWeight: '600' }
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
          drawerIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
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
        name="participants"
        options={{
          drawerLabel: 'Participants',
          title: 'Participants',
          drawerIcon: ({ color }) => <MaterialIcons name="people" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="devices"
        options={{
          drawerLabel: 'Devices',
          title: 'Devices',
          drawerIcon: ({ color }) => <MaterialIcons name="computer" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="rfid-tags"
        options={{
          drawerLabel: 'RFID Tags',
          title: 'RFID Tags',
          drawerIcon: ({ color }) => <MaterialIcons name="sensors" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="reports"
        options={{
          drawerLabel: 'Reports',
          title: 'Reports',
          drawerIcon: ({ color }) => <MaterialIcons name="assignment" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
          drawerIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Drawer>
  );
}
