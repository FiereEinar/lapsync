import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Trophy,
  Timer,
  CircleDot,
  AlertTriangle,
  Ban,
} from "lucide-react-native";
import api from "@/src/api/axios";
import { getSocket } from "@/src/services/socket";

type LeaderboardProps = {
  event: any;
};

// Utilities matching web formatting precisely
function formatElapsed(ms?: number): string {
  if (!ms) return "--:--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    textClass: string;
    bgClass: string;
    icon: any;
    color: string;
  }
> = {
  finished: {
    label: "Finished",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-500/20 border-emerald-500/30",
    icon: Trophy,
    color: "hsl(160, 84%, 39%)",
  },
  running: {
    label: "Running",
    textClass: "text-blue-700",
    bgClass: "bg-blue-500/20 border-blue-500/30",
    icon: Timer,
    color: "hsl(217, 91%, 60%)",
  },
  not_started: {
    label: "Not Started",
    textClass: "text-slate-700",
    bgClass: "bg-slate-500/20 border-slate-500/30",
    icon: CircleDot,
    color: "hsl(215, 16%, 47%)",
  },
  dnf: {
    label: "DNF",
    textClass: "text-red-700",
    bgClass: "bg-red-500/20 border-red-500/30",
    icon: AlertTriangle,
    color: "hsl(348, 83%, 47%)",
  },
  dns: {
    label: "DNS",
    textClass: "text-amber-700",
    bgClass: "bg-amber-500/20 border-amber-500/30",
    icon: Ban,
    color: "hsl(38, 92%, 50%)",
  },
};

export function Leaderboard({ event }: LeaderboardProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const queryParams = new URLSearchParams({ eventID: event._id });
      if (categoryFilter !== "all") {
        queryParams.append("raceCategory", categoryFilter);
      }
      const { data } = await api.get(`/race-result?${queryParams.toString()}`);
      setResults(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchResults();
  }, [event._id, categoryFilter]);

  // Handle live socket connections updating leaderboard arrays dynamically!
  useEffect(() => {
    const socket = getSocket("race");

    // Fallback polling for reliability since we aren't using React Query's refetchInterval natively as heavily
    const interval = setInterval(() => {
      fetchResults();
    }, 30000);

    const handleRaceUpdate = (payload: { eventId: string }) => {
      if (payload.eventId === event._id) fetchResults();
    };
    socket.on("raceUpdate", handleRaceUpdate);

    return () => {
      clearInterval(interval);
      socket.off("raceUpdate", handleRaceUpdate);
    };
  }, [event._id, categoryFilter]);

  const finishedCount = results.filter((r) => r.status === "finished").length;
  const runningCount = results.filter((r) => r.status === "running").length;

  return (
    <View className='flex-1 mt-2 min-h-[500px]'>
      <View className='bg-card border border-border/60 rounded-2xl overflow-hidden mb-4'>
        <View className='p-4 border-b border-border/50 bg-muted/10'>
          <View className='flex-row items-center gap-3 mb-2'>
            <View className='w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center'>
              <Trophy size={20} color='hsl(38, 92%, 50%)' />
            </View>
            <View className='flex-1'>
              <Text className='font-bold text-foreground text-lg tracking-wide'>
                Live Leaderboard
              </Text>
              <Text className='text-muted-foreground text-xs mt-0.5'>
                {finishedCount} finished · {runningCount} running ·{" "}
                {results.length} total
              </Text>
            </View>
          </View>

          {/* Native Category Filter Pills mapping the exact web Select Dropdowns visually */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className='mt-4'
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          >
            <TouchableOpacity
              onPress={() => setCategoryFilter("all")}
              className={`px-4 py-2 rounded-full border ${categoryFilter === "all" ? "bg-primary/10 border-primary/40" : "bg-background border-border/60"}`}
            >
              <Text
                className={`font-bold text-xs ${categoryFilter === "all" ? "text-primary" : "text-muted-foreground"}`}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            {event?.raceCategories?.map((cat: any) => (
              <TouchableOpacity
                key={cat._id}
                onPress={() => setCategoryFilter(cat._id)}
                className={`px-4 py-2 rounded-full border ${categoryFilter === cat._id ? "bg-primary/10 border-primary/40" : "bg-background border-border/60"}`}
              >
                <Text
                  className={`font-bold text-xs ${categoryFilter === cat._id ? "text-primary" : "text-muted-foreground"}`}
                >
                  {cat.name} ({cat.distanceKm}km)
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Native Table using ScrollView arrays! */}
        <View className='flex-1 min-h-[300px]'>
          {isLoading ? (
            <View className='py-20 items-center justify-center'>
              <ActivityIndicator color='hsl(173, 50%, 50%)' />
            </View>
          ) : (
            <ScrollView horizontal style={{ flex: 1 }}>
              <View>
                {/* Table Header Wrapper Fixed */}
                <View
                  className='flex-row bg-muted/30 border-b border-border/50 px-4 py-3'
                  style={{ width: 800 }}
                >
                  <Text className='w-[60px] font-bold text-xs text-muted-foreground uppercase'>
                    Rank
                  </Text>
                  <Text className='w-[80px] font-bold text-xs text-muted-foreground uppercase'>
                    Bib #
                  </Text>
                  <Text className='w-[200px] font-bold text-xs text-muted-foreground uppercase'>
                    Name
                  </Text>
                  <Text className='w-[120px] font-bold text-xs text-muted-foreground uppercase'>
                    Category
                  </Text>
                  <Text className='w-[100px] font-bold text-xs text-muted-foreground uppercase'>
                    Time
                  </Text>
                  <Text className='w-[120px] font-bold text-xs text-muted-foreground uppercase text-right pl-4'>
                    Status
                  </Text>
                </View>

                {/* Table Rows Wrapper Data*/}
                {results.length === 0 ? (
                  <View className='py-12 items-center justify-center w-full min-w-[800px]'>
                    <Trophy size={32} color='hsl(0, 0%, 80%)' />
                    <Text className='text-muted-foreground text-center mt-3 font-medium'>
                      No race results natively available yet.
                    </Text>
                  </View>
                ) : (
                  results.map((result, index) => {
                    const reg = result.registration;
                    const cfg =
                      STATUS_CONFIG[result.status] || STATUS_CONFIG.not_started;
                    const Icon = cfg.icon;

                    return (
                      <View
                        key={result._id}
                        className='flex-row items-center border-b border-border/30 px-4 py-4 hover:bg-muted/10 w-[800px]'
                      >
                        <View className='w-[60px] flex-row items-center'>
                          <Text className='font-extrabold text-foreground text-sm'>
                            {result.rank ?? index + 1}
                          </Text>
                        </View>
                        <Text className='w-[80px] font-bold text-foreground'>
                          {reg?.bibNumber ?? "--"}
                        </Text>
                        <Text
                          className='w-[200px] font-bold text-foreground'
                          numberOfLines={1}
                        >
                          {reg?.user?.name ?? "--"}
                        </Text>
                        <View className='w-[120px]'>
                          <View className='bg-muted px-2 py-1 rounded-md self-start border border-border/40'>
                            <Text className='font-bold text-[10px] text-muted-foreground uppercase'>
                              {reg?.raceCategory?.name ?? "--"}
                            </Text>
                          </View>
                        </View>
                        <Text className='w-[100px] font-mono tracking-widest text-[13px] font-semibold text-foreground'>
                          {formatElapsed(result.elapsedMs)}
                        </Text>
                        <View className='w-[120px] items-end px-2'>
                          <View
                            className={`flex-row items-center px-2.5 py-1.5 rounded-md border ${cfg.bgClass}`}
                          >
                            <Icon size={12} color={cfg.color} />
                            <Text
                              className={`font-bold text-[10px] uppercase ml-1.5 tracking-wider ${cfg.textClass}`}
                            >
                              {cfg.label}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}
