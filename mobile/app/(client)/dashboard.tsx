import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Calendar, Cpu, Activity } from 'lucide-react-native';
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
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="hsl(173, 50%, 50%)" />
      </View>
    );
  }

  const upcomingRegistrations = registrations.filter((r: any) => r.status === 'registered' || r.status === 'pending');

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      <View className="mb-8 mt-2">
        <Text className="text-3xl font-extrabold text-foreground mb-2">Welcome Back!</Text>
        <Text className="text-muted-foreground text-base">{user?.name}, track your events and performance.</Text>
      </View>

      <View className="flex-row gap-4 mb-4">
        <Card className="flex-1">
          <CardHeader className="pb-2 flex-row justify-between items-center">
            <Text className="font-semibold text-muted-foreground text-sm tracking-wide uppercase">Events</Text>
            <Calendar size={18} color="hsl(173, 50%, 50%)" />
          </CardHeader>
          <CardContent className="pt-0">
            <Text className="text-4xl font-bold text-foreground mt-2 mb-1">{registrations.length}</Text>
            <Text className="text-xs text-muted-foreground">{upcomingRegistrations.length} upcoming</Text>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2 flex-row justify-between items-center">
            <Text className="font-semibold text-muted-foreground text-sm tracking-wide uppercase">Hardware</Text>
            <Cpu size={18} color="hsl(173, 50%, 50%)" />
          </CardHeader>
          <CardContent className="pt-0">
            <Text className="text-2xl font-bold text-foreground mb-1 mt-4">Ready</Text>
            <Text className="text-xs text-muted-foreground">Pickup at counter</Text>
          </CardContent>
        </Card>
      </View>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Registered Events</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex flex-col gap-4">
            {registrations.length === 0 ? (
                <Text className="text-muted-foreground text-center mt-2">You have no registered events yet.</Text>
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
                <View key={reg._id || idx} className="p-4 bg-muted/20 border border-border rounded-lg">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-foreground font-semibold flex-1 mr-2 text-base" numberOfLines={1}>{eventName}</Text>
                    <Badge variant="success">Registered</Badge>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center bg-background px-2 py-1.5 rounded-md border border-border">
                      <Activity size={12} color="#64748b" style={{ marginRight: 6 }} />
                      <Text className="text-muted-foreground text-xs font-medium">{distance}</Text>
                    </View>
                    <View className="flex-row items-center bg-background px-2 py-1.5 rounded-md border border-border">
                      <Calendar size={12} color="#64748b" style={{ marginRight: 6 }} />
                      <Text className="text-muted-foreground text-xs font-medium">{date}</Text>
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
