import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, Platform, KeyboardAvoidingView, Alert, TouchableOpacity } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { X, Calendar as CalendarIcon, MapPin } from 'lucide-react-native';
import api from '../../api/axios';

export function CreateEventModal({ visible, onClose, onSuccess }: { visible: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    city: '',
    province: '',
  });

  const [category, setCategory] = useState({
    name: 'Standard', distanceKm: '5', cutoffTime: '60', price: '500', slots: '100'
  });

  const handleSubmit = async () => {
    if (!form.name || !form.date || !form.city) {
        Alert.alert("Missing Fields", "Name, Date, and City are required.");
        return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        date: form.date, 
        startTime: form.startTime || "05:00",
        endTime: form.endTime || "10:00",
        location: {
           venue: form.venue,
           city: form.city,
           province: form.province || form.city
        },
        registration: {
           opensAt: new Date().toISOString(),
           closesAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        },
        raceCategories: [
          {
             name: category.name,
             distanceKm: Number(category.distanceKm),
             cutoffTime: Number(category.cutoffTime),
             price: Number(category.price),
             slots: Number(category.slots)
          }
        ]
      };
      
      await api.post('/event', payload);
      Alert.alert("Success", "Event Created!");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
        <View className="flex-row items-center justify-between p-4 px-6 pt-12 border-b border-border bg-card">
           <Text className="text-xl font-bold text-foreground">Create New Event</Text>
           <TouchableOpacity onPress={onClose} className="bg-muted p-2 rounded-full">
             <X size={20} color="hsl(var(--foreground))" />
           </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
           <Text className="text-xs tracking-wider uppercase font-bold text-muted-foreground mb-4">Event Details</Text>
           
           <View className="mb-4">
               <Text className="text-sm font-medium text-foreground mb-2">Event Name</Text>
               <Input value={form.name} onChangeText={(val) => setForm({...form, name: val})} placeholder="City Marathon 2024" />
           </View>

           <View className="mb-4">
               <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
               <Input value={form.description} onChangeText={(val) => setForm({...form, description: val})} placeholder="Annual city marathon" />
           </View>

           <View className="flex-row gap-4 mb-4">
             <View className="flex-1 relative">
                <Text className="text-sm font-medium text-foreground mb-2">Date (YYYY-MM-DD)</Text>
                <Input value={form.date} onChangeText={(val) => setForm({...form, date: val})} placeholder="2024-12-01" />
             </View>
           </View>

           <Text className="text-xs tracking-wider uppercase font-bold text-muted-foreground mt-6 mb-4">Location</Text>
           <View className="flex-row gap-4 mb-4">
               <View className="flex-1">
                   <Text className="text-sm font-medium text-foreground mb-2">City</Text>
                   <Input value={form.city} onChangeText={(val) => setForm({...form, city: val})} placeholder="New York" />
               </View>
               <View className="flex-1">
                   <Text className="text-sm font-medium text-foreground mb-2">Venue</Text>
                   <Input value={form.venue} onChangeText={(val) => setForm({...form, venue: val})} placeholder="Central Park" />
               </View>
           </View>

           <View className="border-t border-border mt-8 pt-6">
              <Text className="text-xs tracking-wider uppercase font-bold text-muted-foreground mb-4">Race Category (Default Mapping)</Text>
              
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                   <Text className="text-sm font-medium text-foreground mb-2">Distance (km)</Text>
                   <Input keyboardType="numeric" value={category.distanceKm} onChangeText={(val) => setCategory({...category, distanceKm: val})} />
                </View>
                <View className="flex-1">
                   <Text className="text-sm font-medium text-foreground mb-2">Slots</Text>
                   <Input keyboardType="numeric" value={category.slots} onChangeText={(val) => setCategory({...category, slots: val})} />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                   <Text className="text-sm font-medium text-foreground mb-2">Price ($)</Text>
                   <Input keyboardType="numeric" value={category.price} onChangeText={(val) => setCategory({...category, price: val})} />
                </View>
                <View className="flex-1">
                   <Text className="text-sm font-medium text-foreground mb-2">Cutoff (mins)</Text>
                   <Input keyboardType="numeric" value={category.cutoffTime} onChangeText={(val) => setCategory({...category, cutoffTime: val})} />
                </View>
              </View>
           </View>

           <Button className="mt-10 mb-10 w-full h-14" disabled={loading} onPress={handleSubmit}>
              <Text className="text-primary-foreground font-bold text-lg">{loading ? "Creating..." : "Publish Event"}</Text>
           </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
