import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { StatusBadge } from '../StatusBadge';
import { Calendar, MapPin, Users, MoreVertical } from 'lucide-react-native';
import api from '../../api/axios';

export default function EventCard({ event, onRefresh }: { event: any, onRefresh: () => void }) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const distances = event.raceCategories ? event.raceCategories.map((c: any) => c.distanceKm) : [0];
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  const totalSlots = event.raceCategories ? event.raceCategories.reduce((sum: number, cat: any) => sum + cat.slots, 0) : 0;
  const totalRegistered = event.raceCategories ? event.raceCategories.reduce((sum: number, cat: any) => sum + cat.registeredCount, 0) : 0;

  const distanceLabel = minDistance === maxDistance ? `${minDistance} km` : `${minDistance}–${maxDistance} km`;
  const date = new Date(event.startDate || event.date).toLocaleDateString();
  const location = typeof event.location === 'object' ? `${event.location?.city || ''}, ${event.location?.venue || ''}` : event.location;

  const handleDelete = async () => {
    setDropdownVisible(false);
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
             try {
                await api.delete(`/event/${event._id}`);
                onRefresh();
             } catch (error) {
                Alert.alert("Error", "Could not delete event");
             }
          }
        }
      ]
    );
  };

  return (
    <View className="flex flex-col p-4 border border-border bg-card rounded-xl shadow-sm mb-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-3 mb-2 flex-wrap">
            <Text className="font-bold text-foreground text-lg">{event.name}</Text>
            <StatusBadge status={event.status} />
          </View>

          <View className="flex-row items-center gap-4 flex-wrap mt-2">
            <View className="flex-row items-center mb-1">
              <Calendar size={14} color="hsl(var(--muted-foreground))" style={{ marginRight: 4 }} />
              <Text className="text-muted-foreground text-xs">{date}</Text>
            </View>
            <View className="flex-row items-center mb-1">
              <MapPin size={14} color="hsl(var(--muted-foreground))" style={{ marginRight: 4 }} />
              <Text className="text-muted-foreground text-xs">{location}</Text>
            </View>
            <View className="flex-row items-center mb-1">
              <Users size={14} color="hsl(var(--muted-foreground))" style={{ marginRight: 4 }} />
              <Text className="text-muted-foreground text-xs">{totalRegistered}/{totalSlots}</Text>
            </View>
            <View className="flex-row items-center mb-1">
              <Text className="text-primary font-semibold text-xs">{distanceLabel}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => setDropdownVisible(true)} className="p-2 -mr-2 -mt-2">
          <MoreVertical size={20} color="hsl(var(--foreground))" />
        </TouchableOpacity>
      </View>

      <Modal visible={dropdownVisible} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View className="flex-1 justify-end bg-black/40">
            <TouchableWithoutFeedback>
              <View className="bg-popover m-4 rounded-xl border border-border p-2 bottom-6 shadow-lg">
                <View className="p-4 border-b border-border">
                  <Text className="text-popover-foreground font-semibold text-lg">Actions for {event.name}</Text>
                </View>
                {event.status === 'upcoming' && (
                  <TouchableOpacity onPress={() => setDropdownVisible(false)} className="px-4 py-4 border-b border-border">
                    <Text className="text-popover-foreground text-base">Edit Event</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setDropdownVisible(false)} className="px-4 py-4 border-b border-border">
                  <Text className="text-popover-foreground text-base">Manage Participants</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDropdownVisible(false)} className="px-4 py-4 border-b border-border">
                  <Text className="text-popover-foreground text-base">View Results</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} className="px-4 py-4">
                  <Text className="text-destructive font-bold text-base">Delete Event</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
