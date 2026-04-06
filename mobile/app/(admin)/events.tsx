import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import EventCard from '../../src/components/cards/EventCard';
import { CreateEventModal } from '../../src/components/modals/CreateEventModal';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Search, Filter, Plus } from 'lucide-react-native';
import api from '../../src/api/axios';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/event');
      setEvents(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="flex-row items-center justify-between mb-8 mt-2">
          <View>
            <Text className="text-3xl font-extrabold text-foreground mb-1">Events</Text>
            <Text className="text-muted-foreground text-sm">Manage all your race events</Text>
          </View>
          <Button onPress={() => setModalVisible(true)} size="icon" className="w-12 h-12 rounded-xl">
            <Plus size={20} color="hsl(0, 0%, 100%)" />
          </Button>
        </View>

        <View className="flex-row items-center gap-3 mb-6">
          <View className="relative flex-1">
            <View className="absolute left-3 top-3.5 z-10">
               <Search size={18} color="hsl(0, 0%, 70%)" />
            </View>
            <Input placeholder="Search events..." className="pl-10 h-12" />
          </View>
          <Button variant="outline" className="px-4 h-12">
             <Filter size={18} color="hsl(0, 0%, 95%)" />
          </Button>
        </View>

        {loading ? (
           <ActivityIndicator size="large" color="hsl(173, 50%, 50%)" className="mt-8" />
        ) : (
           <View className="flex flex-col">
             {events.length === 0 ? (
                 <Text className="text-muted-foreground text-center mt-4">No events found.</Text>
             ) : (
                 events.map((event: any) => (
                    <EventCard key={event._id} event={event} onRefresh={fetchEvents} />
                 ))
             )}
           </View>
        )}
      </ScrollView>

      <CreateEventModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSuccess={() => { setModalVisible(false); fetchEvents(); }} 
      />
    </View>
  );
}
