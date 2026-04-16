import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { StatusBadge } from "../StatusBadge";
import {
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Activity,
} from "lucide-react-native";
import api from "../../api/axios";
import { useRouter } from 'expo-router';

export default function EventCard({
  event,
  onRefresh,
}: {
  event: any;
  onRefresh: () => void;
}) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();

  const distances = event.raceCategories
    ? event.raceCategories.map((c: any) => c.distanceKm)
    : [0];
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  const totalSlots = event.raceCategories
    ? event.raceCategories.reduce((sum: number, cat: any) => sum + cat.slots, 0)
    : 0;
  const totalRegistered = event.raceCategories
    ? event.raceCategories.reduce(
        (sum: number, cat: any) => sum + cat.registeredCount,
        0,
      )
    : 0;

  const distanceLabel =
    minDistance === maxDistance
      ? `${minDistance} km`
      : `${minDistance}–${maxDistance} km`;
  const rawDate = event.startDate || event.date;
  const dateStrFull = new Date(rawDate).toLocaleDateString();
  const rawDateObj = new Date(rawDate);
  const shortDate = rawDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const location =
    typeof event.location === "object"
      ? `${event.location?.city || ""}, ${event.location?.venue || ""}`
      : event.location;

  const handleDelete = async () => {
    setDropdownVisible(false);
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
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
        },
      },
    ]);
  };

  return (
    <TouchableOpacity 
       activeOpacity={0.7} 
       onPress={() => router.push(`/(admin)/event/${event._id}` as any)}
       className='flex-row items-center p-4 border border-border/60 bg-card rounded-2xl mb-4 overflow-hidden'
    >
      {/* Date badge */}
      <View className='bg-primary/10 rounded-xl p-2 mr-4 min-w-[56px] items-center justify-center self-start mt-1'>
        <Text className='text-primary text-xl font-extrabold pb-0.5'>
          {shortDate.split(" ")[1]}
        </Text>
        <Text className='text-primary text-[10px] uppercase font-bold tracking-wider'>
          {shortDate.split(" ")[0]}
        </Text>
      </View>

      <View className='flex-1 pr-1'>
        <View className='flex-row items-center justify-between mb-1'>
          <Text className='font-bold text-foreground text-lg' numberOfLines={1}>
            {event.name}
          </Text>
          <TouchableOpacity
            onPress={() => setDropdownVisible(true)}
            className='p-1 -mr-2'
          >
            <MoreVertical size={18} color='hsl(0, 0%, 70%)' />
          </TouchableOpacity>
        </View>

        <View className='flex-row items-center gap-2 mb-2 flex-wrap'>
          <StatusBadge status={event.status} />
          <View className='flex-row items-center bg-muted/20 px-2 py-0.5 rounded-full border border-border/50'>
            <Activity
              size={10}
              color='hsl(173, 50%, 50%)'
              style={{ marginRight: 4 }}
            />
            <Text className='text-foreground text-[10px] font-medium'>
              {distanceLabel}
            </Text>
          </View>
        </View>

        <View className='flex-row items-center gap-3 flex-wrap mt-1'>
          <View className='flex-row items-center w-full mb-1'>
            <MapPin
              size={12}
              color='hsl(0, 0%, 50%)'
              style={{ marginRight: 4 }}
            />
            <Text
              className='text-muted-foreground text-[10px] font-medium uppercase tracking-wider'
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>
          <View className='flex-row items-center'>
            <Users
              size={12}
              color='hsl(0, 0%, 50%)'
              style={{ marginRight: 4 }}
            />
            <Text className='text-muted-foreground text-[10px] font-medium uppercase tracking-wider'>
              {totalRegistered}/{totalSlots} Participants
            </Text>
          </View>
        </View>
      </View>

      <Modal visible={dropdownVisible} transparent={true} animationType='fade'>
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View className='flex-1 justify-end bg-black/40'>
            <TouchableWithoutFeedback>
              <View className='bg-popover m-4 rounded-xl border border-border p-2 bottom-6 shadow-lg'>
                <View className='p-4 border-b border-border'>
                  <Text className='text-popover-foreground font-semibold text-lg'>
                    Actions for {event.name}
                  </Text>
                </View>
                {event.status === "upcoming" && (
                  <TouchableOpacity
                    onPress={() => setDropdownVisible(false)}
                    className='px-4 py-4 border-b border-border'
                  >
                    <Text className='text-popover-foreground text-base'>
                      Edit Event
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setDropdownVisible(false)}
                  className='px-4 py-4 border-b border-border'
                >
                  <Text className='text-popover-foreground text-base'>
                    Manage Participants
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDropdownVisible(false)}
                  className='px-4 py-4 border-b border-border'
                >
                  <Text className='text-popover-foreground text-base'>
                    View Results
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} className='px-4 py-4'>
                  <Text className='text-destructive font-bold text-base'>
                    Delete Event
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
}
