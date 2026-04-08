import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Calendar, Cpu, Activity, ChevronRight, Trophy } from 'lucide-react-native';
import api from '../../src/api/axios';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';

export default function ClientHome() {
  const { user } = useAuthStore();
  const router = useRouter();
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
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="hsl(173, 50%, 50%)" />
      </View>
    );
  }

  const upcomingRegistrations = registrations.filter((r: any) => r.status === 'registered' || r.status === 'pending');
  const firstName = user?.name?.split(' ')[0] || 'Runner';

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero Section */}
      <LinearGradient
        colors={['hsla(173, 50%, 50%, 0.15)', 'hsla(173, 50%, 50%, 0.02)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }}
      >
        <Text className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Home</Text>
        <Text className="text-2xl font-extrabold text-foreground">Hey, {firstName}! 👋</Text>
        <Text className="text-muted-foreground text-sm mt-1">Track your events and performance</Text>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Quick Stats - 2 Column */}
        <View className="flex-row gap-3 mb-4">
          <View
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
              flex: 1,
            }}
            className="rounded-2xl border border-border/60 bg-card overflow-hidden"
          >
            <LinearGradient
              colors={['hsla(173, 50%, 50%, 0.12)', 'hsla(173, 50%, 50%, 0.03)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16 }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">My Events</Text>
                <View className="bg-primary/15 p-2 rounded-xl">
                  <Calendar size={16} color="hsl(173, 50%, 50%)" />
                </View>
              </View>
              <Text className="text-3xl font-extrabold text-foreground tracking-tight">{registrations.length}</Text>
              <Text className="text-xs text-muted-foreground mt-1 font-medium">{upcomingRegistrations.length} upcoming</Text>
            </LinearGradient>
          </View>

          <View
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
              flex: 1,
            }}
            className="rounded-2xl border border-border/60 bg-card overflow-hidden"
          >
            <LinearGradient
              colors={['hsla(152, 60%, 42%, 0.12)', 'hsla(152, 60%, 42%, 0.03)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16 }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hardware</Text>
                <View style={{ backgroundColor: 'hsla(152, 60%, 42%, 0.15)' }} className="p-2 rounded-xl">
                  <Cpu size={16} color="hsl(152, 60%, 42%)" />
                </View>
              </View>
              <Text className="text-xl font-extrabold text-foreground tracking-tight mt-2">Ready</Text>
              <Text className="text-xs text-muted-foreground mt-1 font-medium">Pickup at counter</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Registered Events List */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <View className="flex-row items-center justify-between w-full">
              <View className="flex-row items-center gap-2">
                <View className="bg-primary/10 p-1.5 rounded-lg">
                  <Trophy size={14} color="hsl(173, 50%, 50%)" />
                </View>
                <CardTitle>My Registered Events</CardTitle>
              </View>
              <TouchableOpacity 
                onPress={() => router.push("/(client)/events")}
                className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full"
              >
                <Text className="text-primary text-xs font-bold mr-1">Browse</Text>
                <ChevronRight size={12} color="hsl(173, 50%, 50%)" />
              </TouchableOpacity>
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex flex-col gap-3">
              {registrations.length === 0 ? (
                <View className="py-8 items-center">
                  <Calendar size={32} color="hsl(215, 12%, 58%)" />
                  <Text className="text-muted-foreground text-center mt-3 text-sm">No events registered yet</Text>
                  <TouchableOpacity 
                    onPress={() => router.push("/(client)/events")}
                    className="mt-4 bg-primary/10 px-5 py-2.5 rounded-full"
                  >
                    <Text className="text-primary text-sm font-bold">Browse Events</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {registrations.map((reg: any, idx: number) => {
                const eventName = reg.event?.name || 'Unknown Event';
                let distance = 'Various';
                if (reg.event?.raceCategories) {
                   const cat = reg.event.raceCategories.find((c:any) => c._id === reg.raceCategory);
                   if (cat) distance = cat.distance + " km";
                }
                const rawDate = reg.event?.startDate ? new Date(reg.event.startDate) : null;
                const dateStr = rawDate ? rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA';
                
                return (
                  <View key={reg._id || idx} className="flex-row items-center p-4 bg-muted/30 rounded-xl overflow-hidden">
                    {/* Date badge */}
                    <View className="bg-primary/10 rounded-xl p-3 mr-4 items-center justify-center" style={{ minWidth: 52 }}>
                      {rawDate ? (
                        <>
                          <Text className="text-primary text-lg font-extrabold">{dateStr.split(' ')[1]}</Text>
                          <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">{dateStr.split(' ')[0]}</Text>
                        </>
                      ) : (
                        <Text className="text-primary text-xs font-bold">TBA</Text>
                      )}
                    </View>
                    {/* Info */}
                    <View className="flex-1 pr-3">
                      <Text className="text-foreground font-bold text-base mb-1.5" numberOfLines={1}>{eventName}</Text>
                      <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1 opacity-70">
                          <Activity size={11} color="hsl(215, 12%, 58%)" />
                          <Text className="text-muted-foreground text-xs font-medium">{distance}</Text>
                        </View>
                      </View>
                    </View>
                    {/* Status */}
                    <Badge variant="success">Registered</Badge>
                  </View>
                );
              })}
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
