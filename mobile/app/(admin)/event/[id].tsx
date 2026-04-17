import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  MapPin,
  Users,
  Flag,
  ChevronLeft,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Trophy,
  Radio,
  Activity,
  CreditCard,
  Edit2
} from "lucide-react-native";
import api from "@/src/api/axios";
import { StatusBadge } from "@/src/components/StatusBadge";
import { RaceCategoryTable } from "@/src/components/RaceCategoryTable";
import { EditEventModal } from "@/src/components/modals/EditEventModal";
import { Participants } from "@/src/components/tabs/event-detail/Participants";
import { MapTrack } from "@/src/components/tabs/event-detail/MapTrack";
import { Leaderboard } from "@/src/components/tabs/event-detail/Leaderboard";
import { PendingPayments } from "@/src/components/tabs/event-detail/PendingPayments";
import { RaceCheckIn } from "@/src/components/tabs/event-detail/RaceCheckIn";
import { RunnerStatus } from "@/src/components/tabs/event-detail/RunnerStatus";

export default function AdminEventDetails() {
  const { id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("participants");
  const [editModalVisible, setEditModalVisible] = useState(false);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/event/${eventId}`);
      setEvent(data.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not fetch event.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  const onStatusUpdate = async (status: string) => {
    try {
      await api.patch(`/event/${eventId}/status`, { status });
      fetchEvent();
      Alert.alert("Success", `Event status updated successfully!`);
    } catch (error: any) {
      console.error("Status Update Error: ", error);
      const errMsg = error?.response?.data?.message || error?.message || "An error occurred while updating status.";
      Alert.alert("Error", errMsg);
    }
  };

  const handleAction = (type: string) => {
    if (Platform.OS === 'web') {
        const confirm = window.confirm(`Are you sure you want to ${type} this event?`);
        if (confirm) {
            onStatusUpdate(type === "start" ? "active" : type === "pause" ? "stopped" : "finished");
        }
        return;
    }

    if (type === "start") {
      Alert.alert(
        "Start Event",
        "Are you sure you want to start this event? Data gathering will begin.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Start", onPress: () => onStatusUpdate("active") },
        ],
      );
    } else if (type === "pause") {
      Alert.alert("Pause Event", "Are you sure you want to pause this event?", [
        { text: "Cancel", style: "cancel" },
        { text: "Pause", onPress: () => onStatusUpdate("stopped") },
      ]);
    } else if (type === "end") {
      Alert.alert("End Event", "Are you sure you want to end this event?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "End",
          onPress: () => onStatusUpdate("finished"),
          style: "destructive",
        },
      ]);
    }
  };

  if (loading || !event) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(173, 50%, 50%)' />
      </View>
    );
  }

  const rawDate = event.startDate || event.date;
  const dateStr = new Date(rawDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const location =
    typeof event.location === "object"
      ? `${event.location?.venue || ""}, ${event.location?.city || ""}`
      : event.location;

  const totalSlots = event.raceCategories
    ? event.raceCategories.reduce((a: any, b: any) => a + b.slots, 0)
    : 0;
  const totalRegistered = event.raceCategories
    ? event.raceCategories.reduce((a: any, b: any) => a + b.registeredCount, 0)
    : 0;
  const fillPercentage =
    totalSlots > 0 ? Math.round((totalRegistered / totalSlots) * 100) : 0;

  const tabs = [
    { id: "participants", label: "Participants", icon: Users },
    { id: "map", label: "Map Track", icon: MapPin },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "pending", label: "Pending", icon: CreditCard },
    { id: "checkin", label: "Check-In", icon: Radio },
    { id: "status", label: "Runner Status", icon: Activity },
  ];

  return (
    <ScrollView className='flex-1 bg-background' stickyHeaderIndices={[2]}>
      {/* Header View */}
      <View className='bg-primary/10 overflow-hidden pt-12 pb-6 px-6 border-b border-primary/20'>
        <View className='flex-col gap-3 flex-1 w-full mb-3'>
          <View className='flex-row items-center gap-3'>
            <TouchableOpacity
              onPress={() => router.back()}
              className='bg-background/80 p-2 rounded-full border border-border/50'
            >
              <ChevronLeft size={20} color='hsl(0, 0%, 50%)' />
            </TouchableOpacity>
            <StatusBadge status={event.status} />
            <View
              className={`px-2 py-1 rounded-md ${event.registration?.isOpen ? "bg-emerald-500/15" : "bg-destructive/15"}`}
            >
              <Text
                className={`text-[10px] uppercase font-extrabold tracking-wider ${event.registration?.isOpen ? "text-emerald-500" : "text-destructive"}`}
              >
                {event.registration?.isOpen
                  ? "Registration Open"
                  : "Registration Closed"}
              </Text>
            </View>
          </View>

          <View className='flex-row items-center justify-between mt-2'>
            <View className='flex-1 pr-4'>
              <Text
                className='text-3xl font-extrabold text-foreground'
                numberOfLines={2}
              >
                {event.name}
              </Text>
              {event.description && (
                <Text
                  className='text-muted-foreground text-sm mt-1'
                  numberOfLines={2}
                >
                  {event.description}
                </Text>
              )}
            </View>

            <View className='items-end shrink-0 gap-2 flex-row'>
              <TouchableOpacity
                onPress={() => setEditModalVisible(true)}
                className='w-12 h-12 bg-muted/50 border border-border rounded-full items-center justify-center'
              >
                <Edit2 size={20} color='hsl(0, 0%, 50%)' />
              </TouchableOpacity>
            
              {(event.status === "upcoming" || event.status === "stopped") && (
                <TouchableOpacity
                  onPress={() => handleAction("start")}
                  className='w-12 h-12 bg-primary rounded-full items-center justify-center'
                >
                  <PlayCircle size={22} color='white' />
                </TouchableOpacity>
              )}
              {event.status === "active" && (
                <TouchableOpacity
                  onPress={() => handleAction("pause")}
                  className='w-12 h-12 bg-amber-500 rounded-full items-center justify-center'
                >
                  <PauseCircle size={22} color='white' />
                </TouchableOpacity>
              )}
              {(event.status === "active" || event.status === "stopped") && (
                <TouchableOpacity
                  onPress={() => handleAction("end")}
                  className='w-12 h-12 bg-destructive/10 border border-destructive/30 rounded-full items-center justify-center'
                >
                  <StopCircle size={22} color='hsl(0, 84%, 60%)' />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* 4 Details Blocks */}
        <View className='flex-row flex-wrap gap-4 pt-4 border-t border-border/50'>
          <View className='flex-row items-center w-[45%]'>
            <View className='w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3'>
              <Calendar size={20} color='hsl(173, 50%, 50%)' />
            </View>
            <View className='flex-1'>
              <Text className='font-bold text-foreground text-sm'>
                {dateStr}
              </Text>
              <Text className='text-xs text-muted-foreground mt-0.5'>
                {event.startTime || "05:00"} - {event.endTime || "10:00"}
              </Text>
            </View>
          </View>
          <View className='flex-row items-center w-[45%]'>
            <View className='w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3'>
              <MapPin size={20} color='hsl(173, 50%, 50%)' />
            </View>
            <View className='flex-1'>
              <Text
                className='font-bold text-foreground text-sm'
                numberOfLines={1}
              >
                {location}
              </Text>
              <Text
                className='text-xs text-muted-foreground mt-0.5'
                numberOfLines={1}
              >
                Location
              </Text>
            </View>
          </View>
          <View className='flex-row items-center w-[45%] mt-2'>
            <View className='w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3'>
              <Flag size={20} color='hsl(173, 50%, 50%)' />
            </View>
            <View className='flex-1'>
              <Text
                className='font-bold text-foreground text-sm'
                numberOfLines={1}
              >
                {event.raceCategories
                  ?.map((c: any) => `${c.distanceKm}K`)
                  .join(", ")}
              </Text>
              <Text className='text-xs text-muted-foreground mt-0.5'>
                Categories
              </Text>
            </View>
          </View>
          <View className='w-[45%] mt-2 pr-2'>
            <View className='flex-row justify-between mb-1.5 mt-1'>
              <Text className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                Capacity
              </Text>
              <Text className='text-[10px] text-primary font-bold'>
                {fillPercentage}%
              </Text>
            </View>
            <View className='h-2.5 bg-background/50 rounded-full overflow-hidden border border-border/50'>
              <View
                className='h-full bg-primary'
                style={{ width: `${fillPercentage}%` }}
              />
            </View>
            <Text className='text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider text-right'>
              {totalRegistered} / {totalSlots} filled
            </Text>
          </View>
        </View>
      </View>

      {/* Race Categories Native Table Injection */}
      <RaceCategoryTable categories={event.raceCategories || []} />

      <View className='px-6 py-5 pb-3 border-t border-border/50 mt-4'>
        <Text className='text-lg font-extrabold text-foreground mb-1'>
          Event Modules
        </Text>
        <Text className='text-sm text-muted-foreground'>
          Select a tab below to manage details
        </Text>
      </View>

      {/* Sticky Chip Scroller */}
      <View className='bg-background pb-3 pt-1 border-b border-border/50 z-10'>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`flex-row items-center px-4 py-2.5 rounded-full border ${isActive ? "bg-primary border-primary" : "bg-muted/30 border-border"}`}
              >
                <Icon
                  size={16}
                  color={isActive ? "white" : "hsl(0, 0%, 50%)"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`font-bold text-sm ${isActive ? "text-white" : "text-muted-foreground"}`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Payload Rendering Block */}
      {activeTab === 'participants' && (
         <View className="pt-6 pb-24 px-4">
            <Participants event={event} />
         </View>
      )}
      {activeTab === 'map' && (
         <View className="pt-4 pb-24 px-4">
            <MapTrack event={event} />
         </View>
      )}
      {activeTab === 'leaderboard' && (
         <View className="pt-6 pb-24 px-4">
            <Leaderboard event={event} />
         </View>
      )}
      {activeTab === 'pending' && (
         <View className="pt-6 pb-24 px-4">
            <PendingPayments event={event} />
         </View>
      )}
      {activeTab === 'checkin' && (
         <View className="pt-6 pb-24 px-4">
            <RaceCheckIn event={event} />
         </View>
      )}
      {activeTab === 'status' && (
         <View className="pt-6 pb-24 px-4">
            <RunnerStatus event={event} />
         </View>
      )}

      <EditEventModal 
         visible={editModalVisible} 
         onClose={() => setEditModalVisible(false)}
         event={event}
         onSuccess={() => { setEditModalVisible(false); fetchEvent(); }}
      />
    </ScrollView>
  );
}
