import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatCard } from '../../src/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/Card';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../src/api/axios';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/event');
        setEvents(res.data.data || []);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  let totalParticipants = 0;
  let activeEvents = 0;
  
  events.forEach((ev: any) => {
    if (ev.status === 'running' || ev.status === 'active' || ev.status === 'ongoing') activeEvents++;
    if (ev.raceCategories) {
      ev.raceCategories.forEach((cat: any) => {
        totalParticipants += (cat.registeredCount || 0);
      });
    }
  });

  const latestEvents = events.slice(0, 3);

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerStyle={{ padding: 20 }}>
      <View className="mb-6 mt-4">
        <Text className="text-3xl font-extrabold text-white mb-2">Dashboard</Text>
        <Text className="text-zinc-400 text-base">Welcome back! Overview of the platform.</Text>
      </View>

      <StatCard 
        title="Total Participants" 
        value={totalParticipants} 
        subtitle="Across all events" 
        icon={({ size, color }: any) => <MaterialIcons name="groups" size={size} color={color} />} 
      />
      <StatCard 
        title="Active Events" 
        value={activeEvents} 
        subtitle="Currently running" 
        icon={({ size, color }: any) => <MaterialIcons name="event-available" size={size} color={color} />} 
      />
      <StatCard 
        title="Hardware Units" 
        value="0" 
        subtitle="Tracking temporarily unavailable" 
        icon={({ size, color }: any) => <MaterialIcons name="memory" size={size} color={color} />} 
      />

      <Card className="mb-6 mt-2">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <TouchableOpacity>
            <Text className="text-blue-500 text-sm font-semibold">View All</Text>
          </TouchableOpacity>
        </CardHeader>
        <CardContent>
          <View className="flex flex-col gap-4">
            {latestEvents.length === 0 ? (
                <Text className="text-zinc-500 text-center">No events found.</Text>
            ) : null}
            {latestEvents.map((event: any, index: number) => {
              const date = new Date(event.startDate).toLocaleDateString();
              let participants = 0;
              if (event.raceCategories) {
                 participants = event.raceCategories.reduce((acc: number, cur: any) => acc + (cur.registeredCount || 0), 0);
              }
              return (
                <View key={event._id || index} className="flex-row items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <View className="flex-1 pr-4">
                    <Text className="text-white font-semibold text-base mb-2" numberOfLines={1}>{event.name}</Text>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center">
                        <MaterialIcons name="event" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
                        <Text className="text-zinc-400 text-xs">{date}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons name="location-pin" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
                        <Text className="text-zinc-400 text-xs" numberOfLines={1}>{typeof event.location === 'object' ? `${event.location?.venue || ''} ${event.location?.city || ''}`.trim() : event.location}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-blue-500">{participants}</Text>
                    <Text className="text-zinc-500 text-xs">Runners</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TouchableOpacity className="bg-blue-600 rounded-lg py-3 flex-row justify-center items-center">
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2 text-base">Create New Event</Text>
          </TouchableOpacity>
          <TouchableOpacity className="border border-zinc-800 bg-zinc-900 rounded-lg py-3 flex-row justify-center items-center">
            <MaterialIcons name="group" size={20} color="#d4d4d8" />
            <Text className="text-zinc-300 font-semibold ml-2 text-base">Manage Participants</Text>
          </TouchableOpacity>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
