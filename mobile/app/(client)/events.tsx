import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import ClientEventCard from '../../src/components/cards/ClientEventCard';
import { Input } from '../../src/components/ui/Input';
import { Search } from 'lucide-react-native';
import api from '../../src/api/axios';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function ClientEvents() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [eventsRes, regRes] = await Promise.all([
         api.get('/event'),
         api.get('/registration')
      ]);
      setEvents(eventsRes.data.data || []);
      setRegistrations(regRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="mb-8 mt-2">
          <Text className="text-3xl font-extrabold text-foreground mb-1">Available Events</Text>
          <Text className="text-muted-foreground text-base">Register for upcoming running events</Text>
        </View>

        <View className="relative mb-8 shadow-sm">
          <View className="absolute left-3 top-3.5 z-10">
             <Search size={18} color="hsl(var(--muted-foreground))" />
          </View>
          <Input placeholder="Search events..." className="pl-10 h-12" />
        </View>

        {loading ? (
            <ActivityIndicator size="large" color="hsl(var(--success))" className="mt-8" />
        ) : (
            <View className="flex flex-col">
              {events.length === 0 ? (
                  <Text className="text-muted-foreground text-center mt-4">No events found.</Text>
              ) : (
                  events.map((event: any) => (
                      <ClientEventCard 
                          key={event._id} 
                          event={event} 
                          userRegistrations={registrations} 
                          onRegister={() => {}} 
                      />
                  ))
              )}
            </View>
        )}
      </ScrollView>
    </View>
  );
}
