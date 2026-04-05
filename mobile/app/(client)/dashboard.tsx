import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../src/api/axios';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function ClientHome() {
  const { user } = useAuthStore();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/registration');
        setRegistrations(res.data.data || []);
      } catch (error) {
        console.error("Client Dash Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const upcomingRegistrations = registrations.filter((r: any) => r.status === 'registered' || r.status === 'pending');

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerStyle={{ padding: 20 }}>
      <View className="mb-8 mt-4">
        <Text className="text-3xl font-extrabold text-white mb-2">Welcome Back!</Text>
        <Text className="text-zinc-400 text-base">{user?.name}, track your events and performance.</Text>
      </View>

      <View className="flex-row gap-4 mb-4">
        <Card className="flex-1">
          <CardHeader className="pb-2 border-b-0">
            <Text className="font-semibold text-zinc-300 text-sm">Events</Text>
            <MaterialIcons name="event" size={20} color="#10b981" />
          </CardHeader>
          <CardContent className="pt-0 relative">
            <Text className="text-4xl font-bold text-white mb-1">{registrations.length}</Text>
            <Text className="text-xs text-zinc-500">{upcomingRegistrations.length} upcoming</Text>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2 border-b-0">
            <Text className="font-semibold text-zinc-300 text-sm">Hardware</Text>
            <MaterialIcons name="sensors" size={20} color="#10b981" />
          </CardHeader>
          <CardContent className="pt-0">
            <Text className="text-2xl font-bold text-white mb-1 mt-2">Ready</Text>
            <Text className="text-xs text-zinc-500 mt-2">Pickup at counter</Text>
          </CardContent>
        </Card>
      </View>

      <Card className="mb-8 border border-zinc-800">
        <CardHeader>
          <CardTitle>My Registered Events</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex flex-col gap-4">
            {registrations.length === 0 ? (
                <Text className="text-zinc-500 text-center">You have no registered events yet.</Text>
            ) : null}
            {registrations.map((reg: any, idx: number) => {
              const eventName = reg.event?.name || 'Unknown Event';
              let distance = 'Various Distances';
              if (reg.event?.raceCategories) {
                 const cat = reg.event.raceCategories.find((c:any) => c._id === reg.raceCategory);
                 if (cat) distance = cat.distance + " km";
              }
              const date = reg.event?.startDate ? new Date(reg.event.startDate).toLocaleDateString() : 'TBA';
              
              return (
                <View key={reg._id || idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white font-semibold flex-1 mr-2 text-base" numberOfLines={1}>{eventName}</Text>
                    <Badge variant="success">Registered</Badge>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center bg-zinc-950 px-2 py-1 rounded-md">
                      <MaterialIcons name="directions-run" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
                      <Text className="text-zinc-400 text-xs">{distance}</Text>
                    </View>
                    <View className="flex-row items-center bg-zinc-950 px-2 py-1 rounded-md">
                      <MaterialIcons name="event" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
                      <Text className="text-zinc-400 text-xs">{date}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
