import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  MapPin,
  Users,
  Flag,
  CheckCircle,
  Radio,
  ChevronLeft,
  Info,
} from "lucide-react-native";
import api from "@/src/api/axios";
import { useAuthStore } from "@/src/store/useAuthStore";
import { StatusBadge } from "@/src/components/StatusBadge";
import { RaceCategoryTable } from "@/src/components/RaceCategoryTable";
import { ClientMapRoute } from "@/src/components/tabs/event-detail/map-views/ClientMapRoute";
import MapView from "react-native-maps";

export default function ClientEventDetails() {
  const { id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { user } = useAuthStore();
  const mapRef = useRef<MapView>(null);

  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch Core Details Native Payloads
  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      try {
        const [eventRes, regRes] = await Promise.all([
          api.get(`/event/${eventId}`),
          user
            ? api.get(`/registration?eventID=${eventId}&userID=${user._id}`)
            : Promise.resolve({ data: { data: [] } }),
        ]);

        const evt = eventRes.data.data;
        setEvent(evt);
        setRegistrations(
          Array.isArray(regRes.data.data) ? regRes.data.data : [],
        );

        const regCategory = regRes.data.data[0]?.category;
        const initialCategoryId = regCategory
          ? typeof regCategory === "object"
            ? regCategory._id
            : regCategory
          : evt?.raceCategories?.[0]?._id || "";

        setSelectedCategory(initialCategoryId);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Could not fetch event details.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, user]);

  // Fetch mapped checkpoints!
  useEffect(() => {
    const fetchCheckpoints = async () => {
      if (!eventId || !selectedCategory) return;
      try {
        const { data } = await api.get(
          `/race-checkpoint/event/${eventId}?raceCategory=${selectedCategory}`,
        );
        setCheckpoints(data.data);
      } catch (err) {
        console.error("Failed mapping checkpoints natively", err);
      }
    };
    fetchCheckpoints();
  }, [eventId, selectedCategory]);

  const sortedCheckpoints = useMemo(() => {
    return [...checkpoints].sort((a, b) => {
      const getScore = (type: string) => {
        if (type === "start") return 0;
        if (type === "finish") return 2;
        return 1;
      };
      return getScore(a.type) - getScore(b.type);
    });
  }, [checkpoints]);

  if (loading || !event) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(152, 60%, 42%)' />
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
  const registration = registrations[0];
  const pickupLocation =
    event.hardwarePickupLocation || "No pickup location set";
  const pickupTime =
    event.hardwarePickupLocation && event.date
      ? new Date(event.date).toLocaleDateString() + " - Morning prior to race"
      : "TBA";

  const totalSlots = event.raceCategories
    ? event.raceCategories.reduce((a: any, b: any) => a + b.slots, 0)
    : 0;
  const totalRegistered = event.raceCategories
    ? event.raceCategories.reduce(
        (a: any, b: any) => a + b.registeredCount,
        0,
      )
    : 0;
  const fillPercentage =
    totalSlots > 0 ? Math.round((totalRegistered / totalSlots) * 100) : 0;

  const getPinColor = (type: string) => {
    if (type === "start") return "hsl(160, 84%, 39%)"; // emerald
    if (type === "finish") return "hsl(348, 83%, 47%)"; // red
    if (type === "waypoint") return "hsl(215, 16%, 47%)"; // slate
    return "hsl(217, 91%, 60%)"; // blue for standard checkpoint
  };

  return (
    <ScrollView className='flex-1 bg-background'>
      {/* Header View - Matching Admin Style */}
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

      {/* Race Categories Native Table */}
      <RaceCategoryTable categories={event.raceCategories || []} />

      {/* Content Sections */}
      <View className='p-4 pb-24'>
        {/* Registration Status & Hardware Pickup */}
        <View className='flex-row flex-wrap justify-between gap-4 mb-6'>
          <View className='flex-1 min-w-[280px] bg-card border border-border/60 rounded-2xl p-5'>
            <View className='flex-row items-center gap-3 mb-4'>
              <View className='w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center'>
                <CheckCircle size={16} color='hsl(173, 80%, 40%)' />
              </View>
              <Text className='font-bold text-foreground text-lg tracking-wide'>
                Registration Status
              </Text>
            </View>

            {registration ? (
              <View
                className={`self-start px-3 py-1.5 rounded-full mb-3 ${registration.status === "confirmed" ? "bg-teal-500/15" : "bg-amber-500/15"}`}
              >
                <Text
                  className={`uppercase font-bold tracking-wider text-[11px] ${registration.status === "confirmed" ? "text-teal-700 dark:text-teal-400" : "text-amber-700 dark:text-amber-400"}`}
                >
                  {registration.status}
                </Text>
              </View>
            ) : (
              <View className='self-start px-3 py-1.5 rounded-full mb-3 bg-muted border border-border'>
                <Text className='uppercase font-bold tracking-wider text-[11px] text-muted-foreground'>
                  Not Registered
                </Text>
              </View>
            )}

            <Text className='text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1'>
              Tech Assignment
            </Text>
            {registration?.rfidTag ? (
              <View className='self-start px-2 py-1 rounded bg-muted border border-border'>
                <Text className='font-mono text-foreground text-sm font-bold'>
                  RFID Tag #
                  {(registration.rfidTag as any).tagNumber || "Assigned"}
                </Text>
              </View>
            ) : registration?.device ? (
              <View className='self-start px-2 py-1 rounded bg-muted border border-border'>
                <Text className='font-mono text-foreground text-sm font-bold'>
                  Device Assigned
                </Text>
              </View>
            ) : (
              <View className='self-start px-2 py-1 rounded bg-muted/40 border border-border/50 border-dashed'>
                <Text className='font-mono text-muted-foreground text-sm font-semibold'>
                  No Tech Assigned Yet
                </Text>
              </View>
            )}
          </View>

          <View className='flex-1 min-w-[280px] bg-card border border-border/60 rounded-2xl p-5'>
            <View className='flex-row items-center gap-3 mb-4'>
              <View className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                <Radio size={16} color='hsl(152, 60%, 42%)' />
              </View>
              <Text className='font-bold text-foreground text-lg tracking-wide'>
                Hardware Pickup
              </Text>
            </View>
            <View className='mb-3'>
              <Text className='text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider'>
                Location
              </Text>
              <Text className='text-foreground font-semibold text-sm'>
                {pickupLocation}
              </Text>
            </View>
            <View>
              <Text className='text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider'>
                Pickup Time
              </Text>
              <Text className='text-foreground font-semibold text-sm'>
                {pickupTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Route Map */}
        <View className='bg-card border border-border/60 rounded-2xl p-5 mb-6'>
          <View className='flex-row items-center justify-between mb-4'>
            <View className='flex-row items-center gap-3'>
              <View className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                <MapPin size={16} color='hsl(152, 60%, 42%)' />
              </View>
              <Text className='font-bold text-foreground text-lg tracking-wide shrink-0'>
                Route map
              </Text>
            </View>
          </View>

          <View>
            {/* Category Filter Horizontal Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className='mb-4'
              contentContainerStyle={{ gap: 8 }}
            >
              {event.raceCategories?.map((cat: any) => (
                <TouchableOpacity
                  key={cat._id}
                  onPress={() => setSelectedCategory(cat._id)}
                  className={`px-4 py-2 rounded-full border ${selectedCategory === cat._id ? "bg-primary/10 border-primary/40" : "bg-muted/30 border-border/60"}`}
                >
                  <Text
                    className={`text-xs font-bold ${selectedCategory === cat._id ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className='w-full h-[350px] border border-border/60 rounded-xl overflow-hidden bg-background mb-4 mt-2 shadow-sm'>
              <ClientMapRoute sortedCheckpoints={sortedCheckpoints} />
            </View>

            <View className='space-y-2'>
              {sortedCheckpoints
                .filter((c) => c.type !== "waypoint")
                .map((cp, idx) => (
                  <View
                    key={cp._id}
                    className='flex-row items-center justify-between p-3 border border-border/50 rounded-xl bg-card'
                  >
                    <View className='flex-row items-center gap-3'>
                      <View
                        className='w-8 h-8 rounded-full flex items-center justify-center'
                        style={{
                          backgroundColor: getPinColor(cp.type) + "20",
                        }}
                      >
                        <Text
                          style={{ color: getPinColor(cp.type) }}
                          className='font-extrabold text-xs'
                        >
                          {idx + 1}
                        </Text>
                      </View>
                      <View>
                        <Text className='font-bold text-foreground text-sm'>
                          {cp.name}
                        </Text>
                        <Text className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
                          {cp.type}
                        </Text>
                      </View>
                    </View>
                    <Text className='text-[10px] text-muted-foreground font-mono uppercase text-right tracking-widest'>
                      {cp.location.lat.toFixed(4)}°,{"\n"}
                      {cp.location.lng.toFixed(4)}°
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        </View>

        {/* Event Instructions */}
        <View className='bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8'>
          <View className='flex-row items-center gap-3 mb-4'>
            <View className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
              <Info size={16} color='hsl(152, 60%, 42%)' />
            </View>
            <Text className='font-bold text-foreground text-lg tracking-wide shrink-0'>
              Event Instructions
            </Text>
          </View>

          <View className='space-y-3'>
            <View className='flex-row items-start gap-2 pr-4'>
              <View className='w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0' />
              <Text className='text-sm font-medium text-foreground/80 leading-relaxed'>
                Pick up your RFID tag from the equipment desk strictly before
                race day.
              </Text>
            </View>
            <View className='flex-row items-start gap-2 pr-4'>
              <View className='w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0' />
              <Text className='text-sm font-medium text-foreground/80 leading-relaxed'>
                Attach the RFID tag securely onto your running bib facing
                completely outward.
              </Text>
            </View>
            <View className='flex-row items-start gap-2 pr-4'>
              <View className='w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0' />
              <Text className='text-sm font-medium text-foreground/80 leading-relaxed'>
                Arrive at least 30 to 45 minutes prior to the start time
                explicitly listed above.
              </Text>
            </View>
            <View className='flex-row items-start gap-2 pr-4'>
              <View className='w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0' />
              <Text className='text-sm font-medium text-foreground/80 leading-relaxed'>
                Water and medical stations are stationed explicitly along each
                logged checkpoint tracking station plotted securely over the map
                payload mapping elements over the route safely!
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
