import { Tabs } from "expo-router";
import {
  Home,
  Calendar,
  Users,
  Cpu,
  Settings,
} from "lucide-react-native";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "hsl(220, 20%, 8%)",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "hsl(210, 20%, 95%)",
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          height: Platform.OS === "ios" ? 84 : 68,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
          paddingTop: 8,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: "hsl(173, 50%, 42%)",
        tabBarInactiveTintColor: "#B0B8C1",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Calendar size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="participants"
        options={{
          title: "Participants",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Users size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: "Devices",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Cpu size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Settings size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      {/* Hidden routes - not shown in tab bar */}
      <Tabs.Screen
        name="rfid-tags"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="event/[id]"
        options={{
          href: null,
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: "hsla(173, 50%, 50%, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
