import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import EventCard from '../../src/components/cards/EventCard';
import { CreateEventModal } from '../../src/components/modals/CreateEventModal';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { StatCard } from '../../src/components/StatCard';
import { Search, Filter, Plus, Calendar, Users, CalendarCheck } from 'lucide-react-native';
import api from '../../src/api/axios';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    return events.filter(
      (ev: any) =>
        ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.location?.city || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const totalParticipants = events.reduce((sum: number, ev: any) => {
    return sum + (ev.raceCategories ? ev.raceCategories.reduce((s: number, cat: any) => s + (cat.registeredCount || 0), 0) : 0);
  }, 0);

  const activeEvents = events.filter((ev: any) => ev.status === 'active' || ev.status === 'running').length;
  const upcomingEvents = events.filter((ev: any) => ev.status === 'upcoming').length;

  if (loading) {
    return (
       <View className="flex-1 bg-background items-center justify-center">
          <ActivityIndicator size="large" color="hsl(173, 50%, 50%)" />
       </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Hero Section */}
        <View className="mb-6 mt-2 relative">
           <View className="bg-primary/10 rounded-2xl p-6 border border-primary/20 overflow-hidden">
             <Text className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">Events</Text>
             <Text className="text-2xl font-extrabold text-foreground mb-1">Manage Events</Text>
             <Text className="text-muted-foreground text-sm">Create, organize, and track all your race events</Text>
             <TouchableOpacity onPress={() => setModalVisible(true)} className="absolute top-6 right-6 bg-primary w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                <Plus size={20} color="hsl(0, 0%, 100%)" />
             </TouchableOpacity>
           </View>
        </View>

        {/* Stats */}
        <StatCard title="Total Events" value={events.length} subtitle={`${activeEvents} active, ${upcomingEvents} upcoming`} icon={({size, color}:any) => <Calendar size={size} color={color} />} />
        <StatCard title="Participants" value={totalParticipants} subtitle="Across all events" icon={({size, color}:any) => <Users size={size} color={color} />} />
        <StatCard title="Active Now" value={activeEvents} subtitle="Events currently running" icon={({size, color}:any) => <CalendarCheck size={size} color={color} />} />

        {/* Search */}
        <View className="flex-row items-center gap-3 mb-6 mt-2">
          <View className="relative flex-1">
            <View className="absolute left-3 top-3.5 z-10">
               <Search size={18} color="hsl(0, 0%, 70%)" />
            </View>
            <Input placeholder="Search events..." value={searchTerm} onChangeText={setSearchTerm} className="pl-10 h-12" />
          </View>
          <Button variant="outline" className="px-4 h-12">
             <Filter size={18} color="hsl(0, 0%, 95%)" />
          </Button>
        </View>

        {/* List */}
        <View className="flex flex-col">
          {filteredEvents.length === 0 ? (
              <View className="py-12 items-center">
                 <Calendar size={40} color="hsl(0, 0%, 70%)" className="mb-3 opacity-50" />
                 <Text className="text-muted-foreground text-center">No events found matching your search.</Text>
              </View>
          ) : (
              filteredEvents.map((event: any) => (
                 <EventCard key={event._id} event={event} onRefresh={fetchEvents} />
              ))
          )}
        </View>
      </ScrollView>

      <CreateEventModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSuccess={() => { setModalVisible(false); fetchEvents(); }} 
      />
    </View>
  );
}
