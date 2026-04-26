import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { X, Plus, Trash2 } from "lucide-react-native";
import { DateTimePickerInput } from "../ui/DateTimePickerInput";
import api from "../../api/axios";

export function EditEventModal({
  event,
  visible,
  onClose,
  onSuccess,
}: {
  event: any;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    city: "",
    province: "",
    hardwarePickupLocation: "",
    opensAt: "",
    closesAt: "",
  });

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (event && visible) {
      setForm({
        name: event.name || "",
        description: event.description || "",
        date: event.startDate || event.date || "",
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        venue:
          event.location?.venue ||
          (typeof event.location === "string" ? event.location : ""),
        city: event.location?.city || "",
        province: event.location?.province || "",
        hardwarePickupLocation: event.hardwarePickupLocation || "",
        opensAt: event.registration?.opensAt || "",
        closesAt: event.registration?.closesAt || "",
      });

      if (event.raceCategories && event.raceCategories.length > 0) {
        setCategories(
          event.raceCategories.map((c: any) => ({
            id: c._id || Date.now().toString() + Math.random(),
            name: c.name,
            distanceKm: String(c.distanceKm),
            cutoffTime: String(c.cutoffTime || ""),
            gunStartTime: c.gunStartTime || "",
            price: String(c.price),
            slots: String(c.slots),
          })),
        );
      } else {
        setCategories([]);
      }
    }
  }, [event, visible]);

  const handleAddCategory = () => {
    setCategories([
      ...categories,
      {
        name: "New Distance",
        distanceKm: "10",
        cutoffTime: "120",
        gunStartTime: "",
        price: "750",
        slots: "100",
        id: Date.now().toString(),
      },
    ]);
  };

  const handleRemoveCategory = (id: string) => {
    if (categories.length === 1) {
      Alert.alert("Warning", "You must have at least one race category.");
      return;
    }
    setCategories(categories.filter((c) => c.id !== id));
  };

  const updateCategory = (id: string, field: string, value: string) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

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
          province: form.province || form.city,
        },
        hardwarePickupLocation: form.hardwarePickupLocation || undefined,
        registration: {
          opensAt: form.opensAt
            ? new Date(form.opensAt).toISOString()
            : new Date().toISOString(),
          closesAt: form.closesAt
            ? new Date(form.closesAt).toISOString()
            : new Date(Date.now() + 86400000 * 30).toISOString(),
        },
        raceCategories: categories.map((c) => ({
          name: c.name,
          distanceKm: Number(c.distanceKm) || 0,
          cutoffTime: Number(c.cutoffTime) || 0,
          gunStartTime: c.gunStartTime || undefined,
          price: Number(c.price) || 0,
          slots: Number(c.slots) || 0,
        })),
      };

      await api.patch(`/event/${event._id}`, payload);
      Alert.alert("Success", "Event Updated!");
      onSuccess();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to update event",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className='flex-1 bg-background'
      >
        <View className='flex-row items-center justify-between p-4 px-6 pt-12 border-b border-border bg-card'>
          <Text className='text-xl font-bold text-foreground'>Edit Event</Text>
          <TouchableOpacity
            onPress={onClose}
            className='bg-muted p-2 rounded-full'
          >
            <X size={20} color='hsl(0, 0%, 95%)' />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* Section: Event Information */}
          <Text className='text-xs tracking-wider uppercase font-bold text-muted-foreground mb-4'>
            Event Information
          </Text>

          <View className='mb-4'>
            <Text className='text-sm font-medium text-foreground mb-2'>
              Event Name
            </Text>
            <Input
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
              placeholder='City Marathon 2024'
            />
          </View>

          <View className='mb-4'>
            <Text className='text-sm font-medium text-foreground mb-2'>
              Description
            </Text>
            <Input
              value={form.description}
              onChangeText={(val) => setForm({ ...form, description: val })}
              placeholder='Brief event description (optional)'
            />
          </View>

          <View className='mb-4'>
            <Text className='text-sm font-medium text-foreground mb-2'>
              Date
            </Text>
            <DateTimePickerInput
              mode='date'
              value={form.date}
              onChange={(val) => setForm({ ...form, date: val })}
              placeholder='Select Event Date'
            />
          </View>

          <View className='flex-row gap-4 mb-4'>
            <View className='flex-1'>
              <Text className='text-sm font-medium text-foreground mb-2'>
                Start Time
              </Text>
              <DateTimePickerInput
                mode='time'
                value={form.startTime}
                onChange={(val) => setForm({ ...form, startTime: val })}
                placeholder='05:00'
              />
            </View>
            <View className='flex-1'>
              <Text className='text-sm font-medium text-foreground mb-2'>
                End Time
              </Text>
              <DateTimePickerInput
                mode='time'
                value={form.endTime}
                onChange={(val) => setForm({ ...form, endTime: val })}
                placeholder='10:00'
              />
            </View>
          </View>

          {/* Section: Location */}
          <Text className='text-xs tracking-wider uppercase font-bold text-muted-foreground mt-4 mb-4'>
            Location
          </Text>

          <View className='mb-4'>
            <Text className='text-sm font-medium text-foreground mb-2'>
              Venue / Address
            </Text>
            <Input
              value={form.venue}
              onChangeText={(val) => setForm({ ...form, venue: val })}
              placeholder='e.g. Downtown'
            />
          </View>

          <View className='flex-row gap-4 mb-4'>
            <View className='flex-1'>
              <Text className='text-sm font-medium text-foreground mb-2'>
                City
              </Text>
              <Input
                value={form.city}
                onChangeText={(val) => setForm({ ...form, city: val })}
                placeholder='e.g. Davao'
              />
            </View>
            <View className='flex-1'>
              <Text className='text-sm font-medium text-foreground mb-2'>
                Province
              </Text>
              <Input
                value={form.province}
                onChangeText={(val) => setForm({ ...form, province: val })}
                placeholder='e.g. Davao del Sur'
              />
            </View>
          </View>

          <View className='mb-4'>
            <Text className='text-sm font-medium text-foreground mb-2'>
              Hardware & Bib Pickup Location
            </Text>
            <Input
              value={form.hardwarePickupLocation}
              onChangeText={(val) =>
                setForm({ ...form, hardwarePickupLocation: val })
              }
              placeholder='Location where runners pickup bibs/hardware'
            />
          </View>

          {/* Section: Registration Period */}
          <Text className='text-xs tracking-wider uppercase font-bold text-muted-foreground mt-4 mb-4'>
            Registration Period
          </Text>

          <View className='flex-col gap-4 mb-4'>
            <View className='w-full'>
              <Text className='text-sm font-medium text-foreground mb-2'>
                Opens At
              </Text>
              <DateTimePickerInput
                mode='date'
                value={form.opensAt}
                onChange={(val) => setForm({ ...form, opensAt: val })}
                placeholder='Select Date'
              />
            </View>
            <View className='w-full'>
              <Text className='text-sm font-medium text-foreground mb-2'>
                Closes At
              </Text>
              <DateTimePickerInput
                mode='date'
                value={form.closesAt}
                onChange={(val) => setForm({ ...form, closesAt: val })}
                placeholder='Select Date'
              />
            </View>
          </View>

          {/* Section: Race Categories */}
          <View className='flex-row items-center justify-between border-t border-border mt-6 pt-6 mb-4'>
            <Text className='text-xs tracking-wider uppercase font-bold text-muted-foreground mt-1'>
              Race Categories
            </Text>
            <TouchableOpacity
              onPress={handleAddCategory}
              className='flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20'
            >
              <Plus
                size={14}
                color='hsl(173, 50%, 50%)'
                style={{ marginRight: 4 }}
              />
              <Text className='text-primary font-bold text-xs uppercase tracking-wide'>
                Add Category
              </Text>
            </TouchableOpacity>
          </View>

          {categories.map((cat, index) => (
            <View
              key={cat.id}
              className='bg-card border border-border p-4 rounded-xl mb-4 relative'
            >
              <View className='flex-row justify-between items-center mb-4'>
                <Text className='text-foreground font-bold'>
                  Category {index + 1}
                </Text>
                {categories.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveCategory(cat.id)}
                    className='p-2'
                  >
                    <Trash2 size={16} color='hsl(0, 62%, 50%)' />
                  </TouchableOpacity>
                )}
              </View>

              <View className='mb-4'>
                <Text className='text-sm font-medium text-foreground mb-2'>
                  Category Name
                </Text>
                <Input
                  value={cat.name}
                  onChangeText={(val) => updateCategory(cat.id, "name", val)}
                  placeholder='5K Run'
                />
              </View>

              <View className='flex-row gap-4 mb-4'>
                <View className='flex-1'>
                  <Text className='text-sm font-medium text-foreground mb-2'>
                    Distance (km)
                  </Text>
                  <Input
                    keyboardType='numeric'
                    value={cat.distanceKm}
                    onChangeText={(val) =>
                      updateCategory(cat.id, "distanceKm", val)
                    }
                  />
                </View>
                <View className='flex-1'>
                  <Text className='text-sm font-medium text-foreground mb-2'>
                    Cutoff (mins)
                  </Text>
                  <Input
                    keyboardType='numeric'
                    value={cat.cutoffTime}
                    onChangeText={(val) =>
                      updateCategory(cat.id, "cutoffTime", val)
                    }
                  />
                </View>
              </View>

              <View className='mb-4'>
                <Text className='text-sm font-medium text-foreground mb-2'>
                  Gun Start Time
                </Text>
                <DateTimePickerInput
                  mode='time'
                  value={cat.gunStartTime}
                  onChange={(val) =>
                    updateCategory(cat.id, "gunStartTime", val)
                  }
                  placeholder='e.g. 05:30'
                />
              </View>

              <View className='flex-row gap-4'>
                <View className='flex-1'>
                  <Text className='text-sm font-medium text-foreground mb-2'>
                    Price (₱)
                  </Text>
                  <Input
                    keyboardType='numeric'
                    value={cat.price}
                    onChangeText={(val) =>
                      updateCategory(cat.id, "price", val)
                    }
                  />
                </View>
                <View className='flex-1'>
                  <Text className='text-sm font-medium text-foreground mb-2'>
                    Slots
                  </Text>
                  <Input
                    keyboardType='numeric'
                    value={cat.slots}
                    onChangeText={(val) =>
                      updateCategory(cat.id, "slots", val)
                    }
                  />
                </View>
              </View>
            </View>
          ))}

          <Button
            className='mt-6 mb-10 w-full h-14'
            disabled={loading}
            onPress={handleSubmit}
          >
            {loading ? (
              <View className='flex-row items-center gap-2'>
                <ActivityIndicator size='small' color='#fff' />
                <Text className='text-primary-foreground font-bold text-lg'>
                  Saving...
                </Text>
              </View>
            ) : (
              <Text className='text-primary-foreground font-bold text-lg'>
                Save Changes
              </Text>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
