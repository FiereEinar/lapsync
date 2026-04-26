import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../src/components/ui/Card";
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react-native";
import api from "../../src/api/axios";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBadge } from "../../src/components/StatusBadge";

export default function Leaderboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/registration");
        setRegistrations(res.data.data || []);
      } catch (error) {
        console.error("Leaderboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(173, 50%, 50%)' />
      </View>
    );
  }

  const activeRegistrations = registrations.filter(
    (r: any) => r.event?.status === "active" || r.event?.status === "running",
  );

  return (
    <ScrollView
      className='flex-1 bg-background'
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      {/* Header */}
      <View className='mb-6 mt-2'>
        <Text className='text-3xl font-extrabold text-foreground mb-1'>
          Leaderboard
        </Text>
        <Text className='text-muted-foreground text-sm'>
          Track your rankings across events
        </Text>
      </View>

      {/* Stats */}
      <Card className='mb-6'>
        <CardHeader className='pb-2'>
          <View className='flex-row items-center gap-2'>
            <Trophy size={16} color='hsl(173, 50%, 50%)' />
            <CardTitle>My Rankings</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <Text className='text-foreground font-bold text-2xl mb-1'>
            {activeRegistrations.length}
          </Text>
          <Text className='text-muted-foreground text-sm'>
            Active events with rankings
          </Text>
        </CardContent>
      </Card>

      {/* Active Events Leaderboards */}
      {activeRegistrations.length > 0 ? (
        <View className='flex flex-col gap-4'>
          {activeRegistrations.map((reg: any) => {
            const event = reg.event;
            if (!event) return null;

            const rawDate = event.startDate || event.date;
            const date = new Date(rawDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <Card key={reg._id}>
                <CardHeader className='pb-3'>
                  <View className='flex-row items-center justify-between w-full'>
                    <View className='flex-1 pr-2'>
                      <Text
                        className='text-foreground font-bold text-lg mb-1'
                        numberOfLines={1}
                      >
                        {event.name}
                      </Text>
                      <View className='flex-row items-center gap-2 mb-2'>
                        <Calendar size={12} color='hsl(0, 0%, 70%)' />
                        <Text className='text-muted-foreground text-[10px] uppercase font-bold tracking-wider'>
                          {new Date(rawDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <StatusBadge status={event.status || reg.status} />
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          `/(client)/client-event/${event._id}` as any,
                        )
                      }
                      className='bg-primary/10 px-3 py-1.5 rounded-full flex-shrink-0'
                    >
                      <Text className='text-primary text-xs font-bold'>
                        View
                      </Text>
                    </TouchableOpacity>
                  </View>
                </CardHeader>
                <CardContent>
                  <View className='flex-row items-center gap-4 mb-4'>
                    <View className='flex-row items-center gap-1'>
                      <Users size={14} color='hsl(0, 0%, 70%)' />
                      <Text className='text-muted-foreground text-sm'>
                        {event.registeredCount || 0} participants
                      </Text>
                    </View>
                    <View className='flex-row items-center gap-1'>
                      <MapPin size={14} color='hsl(0, 0%, 70%)' />
                      <Text className='text-muted-foreground text-sm'>
                        {event.location || "Online"}
                      </Text>
                    </View>
                  </View>

                  {/* My Rank */}
                  <View className='bg-primary/5 p-4 rounded-xl border border-primary/10'>
                    <Text className='text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1'>
                      My Rank
                    </Text>
                    <View className='flex-row items-center justify-between'>
                      <View className='flex-row items-center gap-3'>
                        <View className='bg-primary rounded-lg p-2'>
                          <Trophy size={20} color='hsl(0, 0%, 100%)' />
                        </View>
                        <View>
                          <Text className='text-foreground font-bold text-2xl'>
                            {reg.rank || "-"}
                          </Text>
                          <Text className='text-muted-foreground text-xs'>
                            Overall Position
                          </Text>
                        </View>
                      </View>
                      <View className='text-right'>
                        <Text className='text-foreground font-bold text-2xl'>
                          {reg.points || 0}
                        </Text>
                        <Text className='text-muted-foreground text-xs'>
                          Points
                        </Text>
                      </View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            );
          })}
        </View>
      ) : (
        <Card className='mb-6'>
          <CardHeader className='pb-2'>
            <View className='flex-row items-center gap-2'>
              <Trophy size={16} color='hsl(0, 0%, 70%)' />
              <CardTitle>No Active Events</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <Text className='text-muted-foreground mb-4'>
              You don't have any active event registrations yet. Check out
              available events to join!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(client)/client-events")}
              className='flex-row items-center justify-center bg-primary px-4 py-3 rounded-xl'
            >
              <Text className='text-primary-foreground font-bold text-base'>
                Browse Events
              </Text>
              <ChevronRight size={20} color='hsl(0, 0%, 100%)' />
            </TouchableOpacity>
          </CardContent>
        </Card>
      )}
    </ScrollView>
  );
}
