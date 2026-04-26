import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import EventCard from "../../src/components/cards/EventCard";
import { CreateEventModal } from "../../src/components/modals/CreateEventModal";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { StatCard } from "../../src/components/StatCard";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  CalendarCheck,
} from "lucide-react-native";
import api from "../../src/api/axios";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await api.get("/event");
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
        (ev.location?.city || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [events, searchTerm]);

  const totalParticipants = events.reduce((sum: number, ev: any) => {
    return (
      sum +
      (ev.raceCategories
        ? ev.raceCategories.reduce(
            (s: number, cat: any) => s + (cat.registeredCount || 0),
            0,
          )
        : 0)
    );
  }, 0);

  const activeEvents = events.filter(
    (ev: any) => ev.status === "active" || ev.status === "running",
  ).length;
  const upcomingEvents = events.filter(
    (ev: any) => ev.status === "upcoming",
  ).length;

  if (loading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(173, 50%, 50%)' />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-background'>
      <ScrollView>
        {/* Hero Section */}
        <View className='mb-2 relative'>
          <View className='bg-primary/10 pt-16 pb-8 px-6 border border-primary/20 overflow-hidden'>
            <Text className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
              Events
            </Text>
            <Text className='text-2xl font-extrabold text-foreground mb-1'>
              Manage Events
            </Text>
            <Text className='text-muted-foreground text-sm'>
              Create, organize, and track all your race events
            </Text>
          </View>
        </View>

        <View className='px-4 pb-20'>
          <Button
            onPress={() => setModalVisible(true)}
            className='flex h-12 items-center justify-center mb-4 mt-2 bg-primary rounded-full shadow-sm gap-2'
          >
            <Plus size={20} color='hsl(0, 0%, 100%)' />
            <Text className='text-white font-semibold'>Create New Event</Text>
          </Button>

          {/* Search */}
          <View className='flex-row items-center gap-3 mb-4'>
            <View className='relative flex-1'>
              <View className='absolute left-3 top-3.5 z-10'>
                <Search size={18} color='hsl(0, 0%, 70%)' />
              </View>
              <Input
                placeholder='Search events...'
                value={searchTerm}
                onChangeText={setSearchTerm}
                className='pl-10 h-14'
              />
            </View>
          </View>

          {/* List */}
          <View className='flex flex-col'>
            {filteredEvents.length === 0 ? (
              <View className='py-12 items-center'>
                <Calendar
                  size={40}
                  color='hsl(0, 0%, 70%)'
                  className='mb-3 opacity-50'
                />
                <Text className='text-muted-foreground text-center'>
                  No events found matching your search.
                </Text>
              </View>
            ) : (
              filteredEvents.map((event: any) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onRefresh={fetchEvents}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <CreateEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          fetchEvents();
        }}
      />
    </View>
  );
}
