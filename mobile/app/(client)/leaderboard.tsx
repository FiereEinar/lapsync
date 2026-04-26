import React, { useEffect, useState, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { StatCard } from "../../src/components/StatCard";
import {
  Trophy,
  CheckCircle,
  Flag,
  Clock,
  Calendar,
  MapPin,
  Users,
  Activity,
  ChevronRight,
} from "lucide-react-native";
import api from "../../src/api/axios";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBadge } from "../../src/components/StatusBadge";
import { Card, CardContent } from "../../src/components/ui/Card";

export default function CompletedEvents() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, regRes] = await Promise.all([
          api.get("/event"),
          api.get("/registration"),
        ]);
        setEvents(eventsRes.data.data || []);
        setRegistrations(regRes.data.data || []);
      } catch (error) {
        console.error("Completed Events Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const completedEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((e: any) => e.status === "finished");
  }, [events]);

  if (loading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(173, 50%, 50%)' />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 bg-background'>
      {/* Hero Section */}
      <View className='mb-2 mt-2 relative'>
        <View className='bg-primary/10 py-10 px-6 border border-primary/20 overflow-hidden'>
          <View className='flex-row items-center gap-1.5 mb-2'>
            <CheckCircle size={14} color='hsl(173, 50%, 50%)' />
            <Text className='text-xs font-bold text-primary uppercase tracking-[0.2em]'>
              History
            </Text>
          </View>
          <Text className='text-2xl font-extrabold text-foreground mb-1'>
            Completed Events
          </Text>
          <Text className='text-muted-foreground text-sm'>
            Review your past races, reports, and leaderboards.
          </Text>
        </View>
      </View>

      <View className='px-4 pb-24'>
        {/* Event Cards */}
        {completedEvents.length === 0 ? (
          <View className='py-16 items-center border border-dashed border-border rounded-2xl bg-muted/10 mt-4'>
            <Trophy size={40} color='hsl(0, 0%, 40%)' />
            <Text className='text-foreground font-semibold mt-3'>
              No completed events yet
            </Text>
            <Text className='text-muted-foreground text-sm mt-1'>
              There are no finished events in the vault yet.
            </Text>
          </View>
        ) : (
          <View className='mt-4 gap-4'>
            {completedEvents.map((event: any) => {
              const rawDate = event.startDate || event.date;
              const shortDate = new Date(rawDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              const distances =
                event.raceCategories && event.raceCategories.length > 0
                  ? event.raceCategories.map((c: any) => c.distanceKm)
                  : [0];
              const minD = Math.min(...distances);
              const maxD = Math.max(...distances);
              const distanceLabel =
                minD === maxD ? `${minD} km` : `${minD}–${maxD} km`;

              const totalSlots = event.raceCategories
                ? event.raceCategories.reduce(
                    (sum: number, cat: any) => sum + cat.slots,
                    0,
                  )
                : 0;
              const totalRegistered = event.raceCategories
                ? event.raceCategories.reduce(
                    (sum: number, cat: any) => sum + cat.registeredCount,
                    0,
                  )
                : 0;

              const location =
                typeof event.location === "object"
                  ? `${event.location?.city || ""}, ${event.location?.province || ""}`
                  : event.location;

              const isRegistered = registrations?.some(
                (reg: any) => reg.event?._id === event._id,
              );

              return (
                <TouchableOpacity
                  key={event._id}
                  onPress={() =>
                    router.push(`/(client)/client-event/${event._id}` as any)
                  }
                  activeOpacity={0.8}
                >
                  <Card className='overflow-hidden'>
                    <CardContent className='pt-4 pb-4 px-4 flex-row'>
                      {/* Date block */}
                      <View className='bg-primary/10 rounded-xl p-2 mr-4 min-w-[56px] items-center justify-center self-start mt-1'>
                        <Text className='text-primary text-xl font-extrabold pb-0.5'>
                          {shortDate.split(" ")[1]}
                        </Text>
                        <Text className='text-primary text-[10px] uppercase font-bold tracking-wider'>
                          {shortDate.split(" ")[0]}
                        </Text>
                      </View>

                      <View className='flex-1'>
                        <Text
                          className='text-lg font-bold text-foreground mb-1'
                          numberOfLines={1}
                        >
                          {event.name}
                        </Text>
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
                          {isRegistered && (
                            <View className='flex-row items-center bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20'>
                              <CheckCircle
                                size={10}
                                color='hsl(160, 84%, 39%)'
                                style={{ marginRight: 4 }}
                              />
                              <Text className='text-emerald-600 text-[10px] font-bold'>
                                Participated
                              </Text>
                            </View>
                          )}
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
                              {totalRegistered} participants
                            </Text>
                          </View>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
