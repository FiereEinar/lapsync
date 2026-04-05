import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatCard } from '../../src/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/Card';
import { Users, CalendarCheck, Cpu, Calendar, MapPin, Plus } from 'lucide-react-native';
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
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="hsl(var(--primary))" />
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
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      <View className="mb-6 mt-2">
        <Text className="text-3xl font-extrabold text-foreground mb-2">Dashboard</Text>
        <Text className="text-muted-foreground text-base">Welcome back! Overview of the platform.</Text>
      </View>

      <StatCard 
        title="Total Participants" 
        value={totalParticipants} 
        subtitle="Across all events" 
        icon={({ size, color }: any) => <Users size={size} color={color} />} 
      />
      <StatCard 
        title="Active Events" 
        value={activeEvents} 
        subtitle="Currently running" 
        icon={({ size, color }: any) => <CalendarCheck size={size} color={color} />} 
      />
      <StatCard 
        title="Hardware Units" 
        value="0" 
        subtitle="Tracking temporarily unavailable" 
        icon={({ size, color }: any) => <Cpu size={size} color={color} />} 
      />

      <Card className="mb-6 mt-4">
        <CardHeader className="py-5 pb-2">
          <View className="flex-row items-center justify-between w-full">
             <CardTitle>Upcoming Events</CardTitle>
             <TouchableOpacity>
               <Text className="text-primary text-sm font-semibold">View All</Text>
             </TouchableOpacity>
          </View>
        </CardHeader>
        <CardContent>
          <View className="flex flex-col gap-4 mt-2">
            {latestEvents.length === 0 ? (
                <Text className="text-muted-foreground text-center">No events found.</Text>
            ) : null}
            {latestEvents.map((event: any, index: number) => {
              const date = new Date(event.startDate).toLocaleDateString();
              let participants = 0;
              if (event.raceCategories) {
                 participants = event.raceCategories.reduce((acc: number, cur: any) => acc + (cur.registeredCount || 0), 0);
              }
              const displayLocation = typeof event.location === 'object' ? `${event.location?.venue || ''} ${event.location?.city || ''}`.trim() : event.location;
              return (
                <View key={event._id || index} className="flex-row items-center justify-between p-4 bg-muted/20 border border-border rounded-lg">
                  <View className="flex-1 pr-4">
                    <Text className="text-foreground font-semibold text-base mb-2" numberOfLines={1}>{event.name}</Text>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center">
                        <Calendar size={14} color="#64748b" style={{ marginRight: 6 }} />
                        <Text className="text-muted-foreground text-xs">{date}</Text>
                      </View>
                      <View className="flex-row items-center flex-1 pr-2">
                        <MapPin size={14} color="#64748b" style={{ marginRight: 6 }} />
                        <Text className="text-muted-foreground text-xs" numberOfLines={1}>{displayLocation}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="items-end pl-2 border-l border-border/50">
                    <Text className="text-2xl font-bold text-foreground">{participants}</Text>
                    <Text className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Runners</Text>
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
          <TouchableOpacity className="bg-primary rounded-md py-3 flex-row justify-center items-center shadow-sm">
            <Plus size={18} color="hsl(var(--primary-foreground))" />
            <Text className="text-primary-foreground font-semibold ml-2 text-base">Create New Event</Text>
          </TouchableOpacity>
          <TouchableOpacity className="border border-input bg-background rounded-md py-3 flex-row justify-center items-center shadow-sm">
            <Users size={18} color="hsl(var(--foreground))" />
            <Text className="text-foreground font-semibold ml-2 text-base">Manage Participants</Text>
          </TouchableOpacity>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
