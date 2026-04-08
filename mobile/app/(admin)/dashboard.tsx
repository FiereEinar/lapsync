import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatCard } from '../../src/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/Card';
import { Users, CalendarCheck, Cpu, Calendar, MapPin, Plus, ChevronRight, TrendingUp, Zap } from 'lucide-react-native';
import { CreateEventModal } from '../../src/components/modals/CreateEventModal';
import { useRouter } from 'expo-router';
import api from '../../src/api/axios';

export default function AdminDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="hsl(173, 50%, 50%)" />
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
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={['hsla(173, 50%, 50%, 0.15)', 'hsla(173, 50%, 50%, 0.02)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 }}
        >
          <View className="mb-2">
            <Text className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Dashboard</Text>
            <Text className="text-2xl font-extrabold text-foreground">Welcome back! 👋</Text>
            <Text className="text-muted-foreground text-sm mt-1">Here's your platform overview</Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Stats Grid - 2 columns */}
          <View className="flex-row gap-3 mb-1">
            <View className="flex-1">
              <StatCard 
                title="Participants" 
                value={totalParticipants} 
                subtitle="Across all events" 
                icon={({ size, color }: any) => <Users size={size} color={color} />}
                accentColor="hsl(173, 50%, 50%)"
                gradientColors={['hsla(173, 50%, 50%, 0.12)', 'hsla(173, 50%, 50%, 0.03)']}
              />
            </View>
            <View className="flex-1">
              <StatCard 
                title="Active" 
                value={activeEvents} 
                subtitle="Running now" 
                icon={({ size, color }: any) => <CalendarCheck size={size} color={color} />}
                accentColor="hsl(152, 60%, 42%)"
                gradientColors={['hsla(152, 60%, 42%, 0.12)', 'hsla(152, 60%, 42%, 0.03)']}
              />
            </View>
          </View>
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <StatCard 
                title="Total Events" 
                value={events.length} 
                subtitle="All time" 
                icon={({ size, color }: any) => <TrendingUp size={size} color={color} />}
                accentColor="hsl(250, 60%, 60%)"
                gradientColors={['hsla(250, 60%, 60%, 0.12)', 'hsla(250, 60%, 60%, 0.03)']}
              />
            </View>
            <View className="flex-1">
              <StatCard 
                title="Hardware" 
                value="0" 
                subtitle="Unavailable" 
                icon={({ size, color }: any) => <Cpu size={size} color={color} />}
                accentColor="hsl(40, 90%, 52%)"
                gradientColors={['hsla(40, 90%, 52%, 0.12)', 'hsla(40, 90%, 52%, 0.03)']}
              />
            </View>
          </View>

          {/* Upcoming Events */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <View className="flex-row items-center justify-between w-full">
                <View className="flex-row items-center gap-2">
                  <View className="bg-primary/10 p-1.5 rounded-lg">
                    <Calendar size={14} color="hsl(173, 50%, 50%)" />
                  </View>
                  <CardTitle>Upcoming Events</CardTitle>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push("/(admin)/events")}
                  className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-primary text-xs font-bold mr-1">View All</Text>
                  <ChevronRight size={12} color="hsl(173, 50%, 50%)" />
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              <View className="flex flex-col gap-3">
                {latestEvents.length === 0 ? (
                    <View className="py-8 items-center">
                      <Calendar size={32} color="hsl(215, 12%, 58%)" />
                      <Text className="text-muted-foreground text-center mt-3 text-sm">No events found yet</Text>
                    </View>
                ) : null}
                {latestEvents.map((event: any, index: number) => {
                  const date = new Date(event.startDate || event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  let participants = 0;
                  if (event.raceCategories) {
                     participants = event.raceCategories.reduce((acc: number, cur: any) => acc + (cur.registeredCount || 0), 0);
                  }
                  const displayLocation = typeof event.location === 'object' ? `${event.location?.venue || ''} ${event.location?.city || ''}`.trim() : event.location;
                  return (
                    <View key={event._id || index} className="flex-row items-center p-4 bg-muted/30 rounded-xl overflow-hidden">
                      {/* Date badge */}
                      <View className="bg-primary/10 rounded-xl p-3 mr-4 items-center justify-center" style={{ minWidth: 52 }}>
                        <Text className="text-primary text-lg font-extrabold">{date.split(' ')[1]}</Text>
                        <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">{date.split(' ')[0]}</Text>
                      </View>
                      {/* Info */}
                      <View className="flex-1 pr-3">
                        <Text className="text-foreground font-bold text-base mb-1.5" numberOfLines={1}>{event.name}</Text>
                        <View className="flex-row items-center gap-1 opacity-70">
                          <MapPin size={11} color="hsl(215, 12%, 58%)" />
                          <Text className="text-muted-foreground text-xs" numberOfLines={1}>{displayLocation || 'TBA'}</Text>
                        </View>
                      </View>
                      {/* Participants count */}
                      <View className="items-center">
                        <Text className="text-xl font-extrabold text-foreground">{participants}</Text>
                        <Text className="text-muted-foreground text-[9px] uppercase tracking-widest font-bold">Runners</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <View className="flex-row items-center gap-2">
                <View className="bg-primary/10 p-1.5 rounded-lg">
                  <Zap size={14} color="hsl(173, 50%, 50%)" />
                </View>
                <CardTitle>Quick Actions</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <TouchableOpacity 
                onPress={() => setModalVisible(true)} 
                className="overflow-hidden rounded-xl"
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['hsl(173, 50%, 48%)', 'hsl(173, 60%, 38%)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                >
                  <View className="bg-white/20 p-1.5 rounded-lg mr-3">
                    <Plus size={16} color="#fff" />
                  </View>
                  <Text className="text-white font-bold text-base">Create New Event</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push("/(admin)/participants")} 
                className="border border-border/80 bg-muted/20 rounded-xl py-3.5 flex-row justify-center items-center"
                activeOpacity={0.8}
              >
                <Users size={16} color="hsl(173, 50%, 50%)" />
                <Text className="text-foreground font-semibold ml-2.5 text-sm">Manage Participants</Text>
              </TouchableOpacity>
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      <CreateEventModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSuccess={() => { setModalVisible(false); fetchData(); }} 
      />
    </View>
  );
}
