import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import {
  Activity,
  Heart,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Trophy,
} from "lucide-react-native";
import api from "@/src/api/axios";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Card, CardContent } from "../../ui/Card";

export function PersonalReport({ event }: { event: any }) {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!event?._id || !user?._id) return;
      try {
        // First get the user's registration
        const regRes = await api.get(
          `/registration?eventID=${event._id}&userID=${user._id}`,
        );
        const registrations = regRes.data.data;
        if (!registrations || registrations.length === 0) {
          setIsRegistered(false);
          setLoading(false);
          return;
        }
        const registrationId = registrations[0]._id;

        // Then get the analytics
        const analyticsRes = await api.get(
          `/telemetry/analytics/registration/${registrationId}`,
        );
        setAnalytics(analyticsRes.data.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [event, user]);

  if (loading) {
    return (
      <View className='py-12 items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(173, 50%, 50%)' />
        <Text className='text-muted-foreground mt-4'>
          Loading your medical report...
        </Text>
      </View>
    );
  }

  if (!isRegistered) {
    return (
      <View className='mx-4 py-12 p-6 rounded-2xl border border-dashed border-border items-center justify-center mt-4'>
        <Text className='text-muted-foreground font-medium'>
          You are not registered for this event.
        </Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View className='mx-4 py-12 p-6 rounded-2xl border border-dashed border-border items-center justify-center mt-4'>
        <Activity
          size={32}
          color='hsl(0, 0%, 50%)'
          style={{ marginBottom: 12 }}
        />
        <Text className='text-muted-foreground font-medium text-center'>
          No analytics data available.
        </Text>
        <Text className='text-muted-foreground text-xs text-center mt-1'>
          Connect your device during the race to gather data.
        </Text>
      </View>
    );
  }

  const { heartRate, semg, alerts = [] } = analytics;

  return (
    <ScrollView className='px-4 pb-24'>
      <Card className='rounded-xl border border-border mt-4'>
        <CardContent className='p-5 pt-5 space-y-5'>
          {/* Header */}
          <View className='flex-row items-center gap-3 mb-2'>
            <View className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
              <Activity size={20} color='hsl(173, 50%, 50%)' />
            </View>
            <View>
              <Text className='font-bold text-foreground text-lg leading-tight'>
                Medical Report
              </Text>
              <Text className='text-xs text-muted-foreground mt-0.5'>
                Your personalized race analytics
              </Text>
            </View>
          </View>

          {/* Heart Rate Block */}
          <View className='p-4 rounded-xl bg-muted/30 border border-border/50'>
            <View className='flex-row items-center gap-2 mb-4'>
              <Heart size={16} color='hsl(0, 84%, 60%)' />
              <Text className='font-semibold text-foreground text-sm'>
                Heart Rate Analysis
              </Text>
            </View>

            <View className='flex-row gap-2'>
              <View className='flex-1 items-center bg-background rounded-lg p-3 border border-border/50'>
                <Text className='text-lg font-bold'>{heartRate.min}</Text>
                <Text className='text-[10px] text-muted-foreground uppercase tracking-wider mt-1'>
                  Min
                </Text>
              </View>
              <View className='flex-1 items-center bg-background rounded-lg p-3 border border-primary/20'>
                <Text className='text-lg font-bold text-primary'>
                  {heartRate.avg}
                </Text>
                <Text className='text-[10px] text-muted-foreground uppercase tracking-wider mt-1'>
                  Avg
                </Text>
              </View>
              <View className='flex-1 items-center bg-background rounded-lg p-3 border border-border/50'>
                <Text className='text-lg font-bold'>{heartRate.max}</Text>
                <Text className='text-[10px] text-muted-foreground uppercase tracking-wider mt-1'>
                  Max
                </Text>
              </View>
            </View>

            <View className='mt-4'>
              <Text className='text-xs font-medium text-muted-foreground mb-2'>
                Time in HR Zones
              </Text>
              <View className='flex-row gap-1'>
                {Object.entries(heartRate.zones || {}).map(
                  ([zone, percent]: [string, any]) => (
                    <View key={zone} className='flex-1 relative'>
                      <View className='h-3 bg-primary/10 rounded-full overflow-hidden'>
                        <View
                          className='h-full bg-primary/80 rounded-full'
                          style={{ width: `${percent}%` }}
                        />
                      </View>
                      <Text className='text-[9px] text-center mt-1.5 text-muted-foreground font-medium uppercase'>
                        {zone}
                      </Text>
                      <Text className='text-[8px] text-center text-muted-foreground/70'>
                        {percent}%
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          </View>

          {/* sEMG Block */}
          <View className='p-4 rounded-xl bg-muted/30 border border-border/50'>
            <View className='flex-row items-center gap-2 mb-4'>
              <Activity size={16} color='hsl(160, 84%, 39%)' />
              <Text className='font-semibold text-foreground text-sm'>
                Muscle Fatigue (sEMG)
              </Text>
            </View>

            <View className='flex-row justify-between items-center p-3 bg-background rounded-lg border border-border/50 mb-3'>
              <Text className='text-muted-foreground text-sm font-medium'>
                Classification Level
              </Text>
              <View
                className={`px-2 py-1 rounded border-0 ${
                  semg.fatigueLevel === "Low"
                    ? "bg-emerald-500/10"
                    : semg.fatigueLevel === "Moderate"
                      ? "bg-amber-500/10"
                      : "bg-destructive/10"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase tracking-wide ${
                    semg.fatigueLevel === "Low"
                      ? "text-emerald-600"
                      : semg.fatigueLevel === "Moderate"
                        ? "text-amber-600"
                        : "text-destructive"
                  }`}
                >
                  {semg.fatigueLevel}
                </Text>
              </View>
            </View>

            <View className='flex-row gap-3'>
              <View className='flex-1 p-3 bg-background rounded-lg border border-border/50'>
                <View className='flex-row justify-between items-center'>
                  <Text className='text-muted-foreground text-xs'>Average</Text>
                  <Text className='font-bold text-base'>{semg.avgFatigue}</Text>
                </View>
              </View>
              <View className='flex-1 p-3 bg-background rounded-lg border border-border/50'>
                <View className='flex-row justify-between items-center'>
                  <Text className='text-muted-foreground text-xs'>Peak</Text>
                  <Text className='font-bold text-base'>
                    {semg.peakFatigue}
                  </Text>
                </View>
              </View>
            </View>

            <View className='mt-4'>
              <View className='flex-row justify-between text-xs mb-1.5'>
                <Text className='text-muted-foreground text-[10px]'>
                  Fatigue Tracking
                </Text>
                <View className='flex-row items-center gap-1'>
                  <TrendingUp size={10} color='hsl(173, 50%, 50%)' />
                  <Text className='font-semibold text-primary text-[10px]'>
                    {semg.trend}
                  </Text>
                </View>
              </View>
              <View className='w-full h-2 bg-muted rounded-full overflow-hidden'>
                <View
                  className={`h-full rounded-full ${
                    semg.fatigueLevel === "Low"
                      ? "bg-emerald-500"
                      : semg.fatigueLevel === "Moderate"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(100, (semg.peakFatigue / 120) * 100)}%`,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Alerts Timeline */}
          {alerts.length > 0 ? (
            <View className='pt-4 border-t border-border/50'>
              <View className='flex-row items-center gap-2 mb-4'>
                <AlertTriangle size={16} color='hsl(45, 93%, 47%)' />
                <Text className='font-semibold text-foreground text-sm'>
                  Medical Alerts & Warnings
                </Text>
              </View>
              <View className='space-y-3'>
                {alerts.map((alert: any, index: number) => (
                  <View
                    key={index}
                    className='flex-row items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10'
                  >
                    <View className='w-8 h-8 rounded-full bg-background flex items-center justify-center border border-destructive/20'>
                      <AlertTriangle size={14} color='hsl(0, 84%, 60%)' />
                    </View>
                    <View className='flex-1'>
                      <View className='flex-row items-center gap-2 mb-1'>
                        <View
                          className={`px-1.5 py-0.5 rounded ${
                            alert.severity === "Active"
                              ? "bg-destructive/15"
                              : "bg-emerald-500/10"
                          }`}
                        >
                          <Text
                            className={`text-[8px] font-bold tracking-wide uppercase ${
                              alert.severity === "Active"
                                ? "text-destructive"
                                : "text-emerald-600"
                            }`}
                          >
                            {alert.severity}
                          </Text>
                        </View>
                        <View className='flex-row items-center gap-1'>
                          <Calendar size={10} color='hsl(0, 0%, 50%)' />
                          <Text className='text-[10px] text-muted-foreground font-medium'>
                            {alert.time}
                          </Text>
                        </View>
                      </View>
                      <Text className='text-sm font-bold text-foreground'>
                        {alert.type.toUpperCase()}
                      </Text>
                      <Text className='text-xs text-muted-foreground mt-0.5'>
                        {alert.message}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className='pt-4 border-t border-border/50'>
              <View className='flex-row items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20'>
                <Trophy size={20} color='hsl(160, 84%, 39%)' />
                <View className='flex-1'>
                  <Text className='font-semibold text-emerald-600 text-sm'>
                    Clean Record!
                  </Text>
                  <Text className='text-xs text-emerald-600/80 mt-0.5'>
                    No significant physiological alerts were triggered.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </CardContent>
      </Card>
    </ScrollView>
  );
}
