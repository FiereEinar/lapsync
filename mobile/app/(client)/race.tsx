import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";
import api from "@/src/api/axios";
import { getSocket, disconnectSocket } from "@/src/services/socket";
import {
  Activity,
  Heart,
  Clock,
  MapPin,
  AlertTriangle,
  Medal,
  Zap,
} from "lucide-react-native";
import { MapLive } from "@/src/components/tabs/event-detail/map-views/MapLive";
import { Card, CardContent } from "@/src/components/ui/Card";

export default function LiveRace() {
  const { eventId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    (eventId as string) || null,
  );

  const [raceData, setRaceData] = useState({
    currentPosition: "-",
    timeElapsed: "-",
    pace: "-",
    heartRate: 0,
    heartRateZone: "-",
    distance: 0,
    totalDistance: 42.2,
    nextCheckpoint: "-",
    distanceToCheckpoint: "-",
    estimatedTime: "-",
    emg: "Normal",
    warning: null as string | null,
    checkpoints: [] as any[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, regRes] = await Promise.all([
          api.get("/event"),
          user
            ? api.get(`/registration?user=${user._id}`)
            : Promise.resolve({ data: { data: [] } }),
        ]);

        const activeEvents = eventsRes.data.data.filter(
          (e: any) => e.status === "active",
        );
        setEvents(activeEvents);

        const regs = Array.isArray(regRes.data.data) ? regRes.data.data : [];
        setRegistrations(regs);

        if (!selectedEventId && activeEvents.length > 0) {
          setSelectedEventId(activeEvents[0]._id);
        }
      } catch (err) {
        console.error("Error fetching live race data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const selectedEvent = events.find((e) => e._id === selectedEventId);
  const selectedReg = registrations.find(
    (r) => r.event?._id === selectedEventId,
  );
  const registrationId = selectedReg?._id;

  useEffect(() => {
    if (!registrationId) return;

    const socket = getSocket("race");
    socket.emit("joinRace", { registrationId });

    socket.on("positionUpdate", (data) =>
      setRaceData((prev) => ({ ...prev, currentPosition: data.position })),
    );
    socket.on("timeUpdate", (data) =>
      setRaceData((prev) => ({
        ...prev,
        timeElapsed: data.timeElapsed,
        pace: data.pace,
      })),
    );
    socket.on("heartRateUpdate", (data) => {
      setRaceData((prev) => ({
        ...prev,
        heartRate: data.heartRate,
        heartRateZone: data.heartRateZone,
      }));
    });
    socket.on("emgUpdate", (data) => {
      setRaceData((prev) => ({
        ...prev,
        emg: data.emg,
      }));
    });
    socket.on("checkpointUpdate", (data) =>
      setRaceData((prev) => ({
        ...prev,
        nextCheckpoint: data.nextCheckpoint,
        distanceToCheckpoint: data.distanceToCheckpoint,
        estimatedTime: data.estimatedTime,
        checkpoints: data.checkpoints || [],
        distance: data.distance,
      })),
    );

    return () => {
      socket.emit("leaveRace", { registrationId });
      disconnectSocket("race");
    };
  }, [registrationId]);

  if (loading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(45, 93%, 47%)' />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 bg-background' stickyHeaderIndices={[1]}>
      {/* Hero Section */}
      <View className='bg-amber-500/10 pt-16 pb-8 px-6 border-b border-amber-500/20'>
        <View className='flex-row items-center gap-2 mb-2'>
          <View className='w-2 h-2 rounded-full bg-amber-500 animate-pulse' />
          <Text className='text-xs font-bold text-amber-500 uppercase tracking-widest'>
            Live Broadcast
          </Text>
        </View>
        <Text className='text-3xl font-extrabold text-foreground mb-1'>
          Live Race View
        </Text>
        <Text className='text-muted-foreground text-sm'>
          Monitor your real-time performance and vitals
        </Text>
      </View>

      {/* Sticky Event Selector */}
      <View className='bg-background border-b border-border/50 py-3 z-10'>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {events.length === 0 ? (
            <Text className='text-muted-foreground py-2'>
              No active events right now.
            </Text>
          ) : (
            events.map((evt) => {
              const isSelected = evt._id === selectedEventId;
              const isReg = registrations.some((r) => r.event?._id === evt._id);
              return (
                <TouchableOpacity
                  key={evt._id}
                  onPress={() => setSelectedEventId(evt._id)}
                  className={`px-4 py-2.5 rounded-full border ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/30"
                      : "bg-muted/30 border-border/60"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? "text-amber-600" : "text-muted-foreground"
                    }`}
                  >
                    {evt.name} {isReg ? "(Registered)" : "(Spectator)"}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      <View className='p-4 pb-24'>
        {!selectedEventId ? (
          <View className='py-16 items-center justify-center border border-dashed border-border/50 rounded-2xl bg-muted/10 mt-4'>
            <Activity size={48} color='hsl(0, 0%, 50%)' opacity={0.3} />
            <Text className='text-xl font-bold mt-4 text-foreground'>
              No Race Selected
            </Text>
            <Text className='text-muted-foreground text-center mt-2 px-4'>
              Please select an active event from the list above to view the live
              broadcast.
            </Text>
          </View>
        ) : (
          <>
            {registrationId ? (
              <View className='space-y-4'>
                {/* 4 Stats Grid */}
                <View className='flex-row flex-wrap gap-3 mt-2'>
                  <View className='flex-1 min-w-[45%] bg-card border border-border/60 rounded-xl p-4'>
                    <View className='flex-row items-center gap-2 mb-2'>
                      <Medal size={16} color='hsl(45, 93%, 47%)' />
                      <Text className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground'>
                        Position
                      </Text>
                    </View>
                    <Text className='text-2xl font-extrabold text-foreground'>
                      {raceData.currentPosition}
                    </Text>
                  </View>
                  <View className='flex-1 min-w-[45%] bg-card border border-border/60 rounded-xl p-4'>
                    <View className='flex-row items-center gap-2 mb-2'>
                      <Clock size={16} color='hsl(217, 91%, 60%)' />
                      <Text className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground'>
                        Time Elapsed
                      </Text>
                    </View>
                    <Text className='text-2xl font-extrabold text-foreground'>
                      {raceData.timeElapsed}
                    </Text>
                  </View>
                  <View className='flex-1 min-w-[45%] bg-card border border-border/60 rounded-xl p-4'>
                    <View className='flex-row items-center gap-2 mb-2'>
                      <Activity size={16} color='hsl(160, 84%, 39%)' />
                      <Text className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground'>
                        Avg Pace
                      </Text>
                    </View>
                    <Text className='text-2xl font-extrabold text-foreground'>
                      {raceData.pace}
                    </Text>
                    <Text className='text-[10px] text-muted-foreground mt-0.5'>
                      /km
                    </Text>
                  </View>
                  <View className='flex-1 min-w-[45%] bg-card border border-border/60 rounded-xl p-4'>
                    <View className='flex-row items-center gap-2 mb-2'>
                      <Heart size={16} color='hsl(348, 83%, 47%)' />
                      <Text className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground'>
                        Heart Rate
                      </Text>
                    </View>
                    <Text className='text-2xl font-extrabold text-foreground'>
                      {raceData.heartRate}
                    </Text>
                    <Text className='text-[10px] text-muted-foreground mt-0.5'>
                      bpm • {raceData.heartRateZone}
                    </Text>
                  </View>
                </View>

                {/* Bio-Signals Details */}
                <Card className='rounded-xl border border-border mt-2'>
                  <CardContent className='p-5 pt-5'>
                    <View className='flex-row items-center gap-2 mb-4'>
                      <Zap size={18} color='hsl(173, 50%, 50%)' />
                      <Text className='font-bold text-lg text-foreground'>
                        Bio-Signals
                      </Text>
                    </View>

                    <View className='flex-row items-center justify-between py-3 border-b border-border/50'>
                      <View>
                        <Text className='text-sm font-semibold text-foreground mb-1'>
                          Heart Rate Zone
                        </Text>
                        <Text className='text-xs text-muted-foreground'>
                          Current exertion level
                        </Text>
                      </View>
                      <View
                        className={`px-3 py-1 rounded-full ${raceData.heartRateZone === "Peak" ? "bg-destructive/15" : "bg-primary/10"}`}
                      >
                        <Text
                          className={`text-xs font-bold ${raceData.heartRateZone === "Peak" ? "text-destructive" : "text-primary"}`}
                        >
                          {raceData.heartRateZone}
                        </Text>
                      </View>
                    </View>

                    <View className='flex-row items-center justify-between py-3'>
                      <View>
                        <Text className='text-sm font-semibold text-foreground mb-1'>
                          Muscle Status (EMG)
                        </Text>
                        <Text className='text-xs text-muted-foreground'>
                          Current fatigue level
                        </Text>
                      </View>
                      <View
                        className={`px-3 py-1 rounded-full ${raceData.emg === "High Fatigue" ? "bg-amber-500/15" : "bg-emerald-500/15"}`}
                      >
                        <Text
                          className={`text-xs font-bold ${raceData.emg === "High Fatigue" ? "text-amber-600" : "text-emerald-600"}`}
                        >
                          {raceData.emg}
                        </Text>
                      </View>
                    </View>

                    {raceData.warning && (
                      <View className='mt-3 bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex-row items-start gap-3'>
                        <AlertTriangle
                          size={16}
                          color='hsl(0, 84%, 60%)'
                          className='mt-0.5'
                        />
                        <View className='flex-1'>
                          <Text className='text-sm font-bold text-destructive'>
                            Alert Triggered
                          </Text>
                          <Text className='text-xs text-destructive/80 mt-1'>
                            {raceData.warning}
                          </Text>
                        </View>
                      </View>
                    )}
                  </CardContent>
                </Card>

                {/* Checkpoints Tracker */}
                <Card className='rounded-xl border border-border mt-2'>
                  <CardContent className='p-5 pt-5'>
                    <View className='flex-row items-center gap-2 mb-4'>
                      <MapPin size={18} color='hsl(173, 50%, 50%)' />
                      <Text className='font-bold text-lg text-foreground'>
                        Checkpoints
                      </Text>
                    </View>

                    {raceData.checkpoints.length === 0 ? (
                      <Text className='text-muted-foreground text-sm py-4 text-center'>
                        Waiting for checkpoint updates...
                      </Text>
                    ) : (
                      <View className='space-y-3'>
                        {raceData.checkpoints.map((cp, idx) => (
                          <View
                            key={idx}
                            className='flex-row items-center gap-3 py-2 border-b border-border/30 last:border-0'
                          >
                            <View
                              className={`w-3 h-3 rounded-full ${cp.status === "completed" ? "bg-emerald-500" : cp.status === "approaching" ? "bg-amber-500" : "bg-muted border border-border"}`}
                            />
                            <View className='flex-1'>
                              <Text
                                className={`text-sm font-semibold ${cp.status === "completed" ? "text-emerald-600" : "text-foreground"}`}
                              >
                                {cp.name}
                              </Text>
                              <Text className='text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5'>
                                {cp.status}
                              </Text>
                            </View>
                            <Text className='text-xs font-mono font-bold text-muted-foreground'>
                              {cp.time || "--:--"}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </CardContent>
                </Card>
              </View>
            ) : (
              <View className='space-y-4 mt-2'>
                <View className='bg-card rounded-xl p-5 border border-border'>
                  <View className='flex-row items-center gap-2 mb-2'>
                    <Activity size={18} color='hsl(173, 50%, 50%)' />
                    <Text className='text-xl font-bold text-foreground'>
                      Live Spectator View
                    </Text>
                  </View>
                  <Text className='text-muted-foreground text-sm mb-6'>
                    You are not registered for this event. You are currently
                    viewing the live standard broadcast for{" "}
                    {selectedEvent?.name}.
                  </Text>

                  {/* Using the MapLive component for spectators */}
                  <View className='border border-border/50 rounded-xl overflow-hidden'>
                    <MapLive event={selectedEvent} />
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
