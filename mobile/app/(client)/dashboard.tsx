import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { StatCard } from '../../src/components/StatCard';
import { Calendar, Cpu, Activity, ChevronRight, Trophy, Zap, CalendarCheck, MapPin } from 'lucide-react-native';
import api from '../../src/api/axios';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';
import { StatusBadge } from '../../src/components/StatusBadge';

export default function ClientHome() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, eventRes] = await Promise.all([
           api.get(`/registration`),
           api.get('/event')
        ]);
        setRegistrations(regRes.data.data || []);
        setEvents(eventRes.data.data || []);
      } catch (error) {
        console.error("Client Dash Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="hsl(173, 50%, 50%)" />
      </View>
    );
  }

  const upcomingRegistrations = registrations.filter((r: any) => r.event?.status === 'upcoming');
  const activeRegistrations = registrations.filter((r: any) => r.event?.status === 'active' || r.event?.status === 'running');
  const upcomingEvents = events.filter((e: any) => e.status === 'upcoming').slice(0, 3);

  const firstName = user?.name?.split(' ')[0] || 'Runner';

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      {/* Hero Section */}
      <View className="mb-6 mt-2">
        <Text className="text-3xl font-extrabold text-foreground mb-1">Welcome back{firstName ? `, ${firstName}` : ''}!</Text>
        <Text className="text-muted-foreground text-sm">Track your events and performance</Text>
      </View>

      {/* Quick Stats */}
      <StatCard 
        title="Registered Events" 
        value={registrations.length} 
        subtitle={`${activeRegistrations.length} active, ${upcomingRegistrations.length} upcoming`} 
        icon={({ size, color }: any) => <CalendarCheck size={size} color={color} />} 
      />
      
      <StatCard 
        title="Available Events" 
        value={events.length} 
        subtitle={`${upcomingEvents.length} upcoming`} 
        icon={({ size, color }: any) => <Calendar size={size} color={color} />} 
      />

      <StatCard 
        title="Active Now" 
        value={activeRegistrations.length} 
        subtitle="Events you're racing in" 
        icon={({ size, color }: any) => <Zap size={size} color={color} />} 
      />

      {/* My Registrations */}
      {registrations.length > 0 && (
          <Card className="mb-6 mt-4">
            <CardHeader className="py-5 pb-2">
              <View className="flex-row items-center justify-between w-full">
                 <View className="flex-row items-center gap-2">
                    <Trophy size={16} color="hsl(173, 50%, 50%)" />
                    <CardTitle>My Registrations</CardTitle>
                 </View>
                 <TouchableOpacity onPress={() => router.push("/(client)/events")} className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full">
                   <Text className="text-primary text-xs font-bold mr-1">Browse All</Text>
                   <ChevronRight size={12} color="hsl(173, 50%, 50%)" />
                 </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              <View className="flex flex-col gap-3 mt-2 mb-2">
                 {registrations.slice(0, 3).map((reg: any) => {
                    const event = reg.event;
                    if (!event) return null;
                    const rawDate = event.startDate || event.date;
                    const date = new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <View key={reg._id} className="flex-row items-center p-3 bg-muted/20 border border-border rounded-xl">
                        <View className="bg-primary/10 rounded-xl p-2 mr-3 min-w-[50px] items-center justify-center">
                           <Text className="text-primary text-lg font-extrabold">{date.split(' ')[1]}</Text>
                           <Text className="text-primary text-[10px] uppercase font-bold tracking-wider">{date.split(' ')[0]}</Text>
                        </View>
                        <View className="flex-1 pr-2">
                           <Text className="text-foreground font-bold text-base mb-1" numberOfLines={1}>{event.name}</Text>
                           <View className="flex-row items-center gap-2">
                              <Calendar size={12} color="hsl(0, 0%, 70%)" />
                              <Text className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">{new Date(rawDate).toLocaleDateString()}</Text>
                           </View>
                        </View>
                        <View className="items-end gap-1.5 flex-shrink-0">
                           <StatusBadge status={event.status || reg.status} />
                           <TouchableOpacity onPress={() => {}} className="bg-primary/10 px-3 py-1 rounded-md">
                              <Text className="text-primary text-xs font-bold">Details</Text>
                           </TouchableOpacity>
                        </View>
                      </View>
                    );
                 })}
              </View>
            </CardContent>
          </Card>
      )}

      {/* Upcoming Events */}
      <Card className="mb-6 mt-4">
        <CardHeader className="py-5 pb-2">
          <View className="flex-row items-center justify-between w-full">
             <View className="flex-row items-center gap-2">
                <Calendar size={16} color="hsl(173, 50%, 50%)" />
                <CardTitle>Upcoming Events</CardTitle>
             </View>
             <TouchableOpacity onPress={() => router.push("/(client)/events")} className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full">
               <Text className="text-primary text-xs font-bold mr-1">Browse All</Text>
               <ChevronRight size={12} color="hsl(173, 50%, 50%)" />
             </TouchableOpacity>
          </View>
        </CardHeader>
        <CardContent>
          <View className="flex flex-col gap-3 mt-2 mb-2">
             {upcomingEvents.length === 0 ? (
               <View className="py-6 items-center">
                 <Calendar size={28} color="hsl(0, 0%, 70%)" className="mb-2" />
                 <Text className="text-muted-foreground text-sm">No upcoming events found</Text>
               </View>
             ) : (
               upcomingEvents.map((event: any) => {
                  const rawDate = event.startDate || event.date;
                  const date = new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  let spotsLeft = 0;
                  if (event.raceCategories) {
                     spotsLeft = event.raceCategories.reduce((acc: number, cat: any) => acc + (cat.slots - (cat.registeredCount||0)), 0);
                  }
                  const loc = typeof event.location === 'object' ? event.location.city : event.location;
                  
                  return (
                    <View key={event._id} className="flex-row items-center p-3 bg-muted/20 border border-border rounded-xl">
                      <View className="bg-primary/10 rounded-xl p-2 mr-3 min-w-[50px] items-center justify-center">
                         <Text className="text-primary text-lg font-extrabold">{date.split(' ')[1]}</Text>
                         <Text className="text-primary text-[10px] uppercase font-bold tracking-wider">{date.split(' ')[0]}</Text>
                      </View>
                      <View className="flex-1 pr-2">
                         <Text className="text-foreground font-bold text-base mb-1" numberOfLines={1}>{event.name}</Text>
                         <View className="flex-row items-center gap-2">
                            <MapPin size={12} color="hsl(0, 0%, 70%)" />
                            <Text className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold" numberOfLines={1}>{loc}</Text>
                            <Text className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold ml-1">• {spotsLeft} spots</Text>
                         </View>
                      </View>
                      <TouchableOpacity onPress={() => router.push("/(client)/events")} className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-md flex-shrink-0">
                         <Text className="text-primary text-xs font-bold mr-1">View</Text>
                         <ChevronRight size={10} color="hsl(173, 50%, 50%)" />
                      </TouchableOpacity>
                    </View>
                  );
               })
             )}
          </View>
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <View className="flex-row gap-3 mb-8 px-2">
        <Button className="flex-1 py-4" onPress={() => router.push("/(client)/events")}>
          <Text className="text-primary-foreground font-bold text-base">Browse Events</Text>
        </Button>
      </View>
      
    </ScrollView>
  );
}
