import { getSocket } from "@/src/services/socket";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import MapView, {
  Marker,
  Polyline,
  UrlTile,
  PROVIDER_DEFAULT,
} from "react-native-maps";

interface RunnerData {
  registrationId: string;
  user: any;
  emergencyContact?: any;
  position: { latitude: number; longitude: number } | null;
  path: { latitude: number; longitude: number }[];
  heartRate: number | null;
  emg: string | null;
  lastUpdate: Date;
}

export function MapLive({ event }: { event: any }) {
  const [runners, setRunners] = useState<Record<string, RunnerData>>({});
  const [focusedRunnerId, setFocusedRunnerId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = getSocket("race");

    socket.on("adminLiveUpdate", (update) => {
      const { registrationId, user, emergencyContact, gps, heartRate, emg } =
        update;

      setRunners((prev) => {
        const existing = prev[registrationId] || {
          registrationId,
          user,
          emergencyContact,
          position: null,
          path: [],
          heartRate: null,
          emg: null,
          lastUpdate: new Date(),
        };

        const newPos = gps
          ? { latitude: gps.lat, longitude: gps.lon }
          : existing.position;
        const newPath =
          gps && newPos ? [...existing.path, newPos] : existing.path;

        return {
          ...prev,
          [registrationId]: {
            ...existing,
            user: user || existing.user,
            emergencyContact: emergencyContact || existing.emergencyContact,
            position: newPos,
            path: newPath.slice(-50),
            heartRate: heartRate !== null ? heartRate : existing.heartRate,
            emg: emg !== null ? emg : existing.emg,
            lastUpdate: new Date(),
          },
        };
      });
    });

    return () => {
      socket.off("adminLiveUpdate");
    };
  }, []);

  const activeRunners = Object.values(runners).filter((r) => {
    return now.getTime() - r.lastUpdate.getTime() < 12 * 60 * 60 * 1000;
  });

  const getMapCenter = () => {
    if (focusedRunnerId && runners[focusedRunnerId]?.position) {
      return runners[focusedRunnerId].position!;
    }
    const withPosition = activeRunners.filter((r) => r.position);
    if (withPosition.length > 0) {
      return withPosition[withPosition.length - 1].position!;
    }
    return { latitude: 0, longitude: 0 };
  };

  const center = getMapCenter();

  return (
    <View className='flex-1 min-h-[700px]'>
      <View className='bg-card border border-border/60 rounded-2xl overflow-hidden mb-4'>
        <View className='p-4 border-b border-border/50 bg-muted/10'>
          <Text className='font-bold text-foreground text-lg'>
            Live Race View
          </Text>
        </View>
        <View className='w-full h-[400px]'>
          {center.latitude === 0 && center.longitude === 0 ? (
            <View className='flex-1 bg-muted/20 items-center justify-center'>
              <Text className='text-muted-foreground font-medium animate-pulse'>
                Waiting for runners live signal...
              </Text>
            </View>
          ) : (
            <MapView
              provider={PROVIDER_DEFAULT}
              style={{ flex: 1 }}
              mapType='none'
              initialRegion={{
                latitude: center.latitude,
                longitude: center.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
              region={{
                latitude: center.latitude,
                longitude: center.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
            >
              <UrlTile
                urlTemplate='https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                maximumZ={19}
                flipY={false}
              />

              {activeRunners
                .filter((r) => r.position)
                .map((r) => {
                  const isFocused = focusedRunnerId === r.registrationId;
                  const isOffline =
                    now.getTime() - r.lastUpdate.getTime() > 2 * 60 * 1000;
                  if (focusedRunnerId !== null && !isFocused) return null;

                  const pinColor = isOffline
                    ? "#808080"
                    : isFocused
                      ? "#ef4444"
                      : "#3b82f6";

                  return (
                    <React.Fragment key={r.registrationId}>
                      <Marker
                        coordinate={r.position!}
                        title={r.user?.name || "Unknown"}
                        description={`HR: ${r.heartRate || "--"} | EMG: ${r.emg || "--"}`}
                        pinColor={pinColor}
                      />
                      <Polyline
                        coordinates={r.path}
                        strokeColor={pinColor}
                        strokeWidth={isFocused ? 4 : 2}
                      />
                    </React.Fragment>
                  );
                })}
            </MapView>
          )}
        </View>
      </View>

      <View className='bg-card border border-border/60 rounded-2xl overflow-hidden flex-1'>
        <View className='p-4 border-b border-border/50 bg-muted/10'>
          <Text className='font-bold text-foreground text-lg'>
            Active Runners
          </Text>
        </View>
        {activeRunners.length === 0 ? (
          <View className='py-12 items-center justify-center'>
            <Text className='text-muted-foreground'>
              No active runners detected yet.
            </Text>
          </View>
        ) : (
          <ScrollView nestedScrollEnabled={true}>
            {activeRunners.map((runner, index) => {
              const isOffline =
                now.getTime() - runner.lastUpdate.getTime() > 2 * 60 * 1000;
              const isFocused = focusedRunnerId === runner.registrationId;

              return (
                <View
                  key={runner.registrationId}
                  className={`flex-row items-center border-b border-border/50 px-4 py-4 ${isFocused ? "bg-primary/5" : ""}`}
                >
                  <View className='flex-1 pr-2'>
                    <View className='flex-row items-center mb-1'>
                      <Text
                        className='font-bold text-foreground text-base'
                        numberOfLines={1}
                      >
                        {runner.user?.name || "Unknown"}
                      </Text>
                      {isOffline && (
                        <View className='bg-amber-500/20 px-2 py-0.5 rounded-full ml-2'>
                          <Text className='text-amber-600 font-bold text-[10px] uppercase tracking-wider'>
                            Offline
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className='text-muted-foreground text-xs'
                      numberOfLines={1}
                    >
                      {runner.emergencyContact
                        ? `SOS: ${runner.emergencyContact.name} (${runner.emergencyContact.phone})`
                        : "No Emergency Contact"}
                    </Text>
                  </View>

                  <View className='flex-col items-end pr-4'>
                    <View className='flex-row items-baseline'>
                      <Text
                        className={`font-mono text-base font-bold ${runner.heartRate && runner.heartRate > 170 ? "text-destructive" : "text-foreground"}`}
                      >
                        {runner.heartRate || "--"}
                      </Text>
                      <Text className='text-muted-foreground text-[10px] ml-1'>
                        bpm
                      </Text>
                    </View>
                    <Text className='text-muted-foreground text-xs font-mono'>
                      EMG: {runner.emg || "--"}
                    </Text>
                  </View>

                  <View className='w-[70px] items-end block'>
                    <TouchableOpacity
                      onPress={() =>
                        setFocusedRunnerId(
                          isFocused ? null : runner.registrationId,
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl border ${isFocused ? "bg-background border-border shadow-sm" : "bg-transparent border-transparent"}`}
                    >
                      <Text
                        className={`font-semibold text-xs ${isFocused ? "text-foreground" : "text-primary"}`}
                      >
                        {isFocused ? "Unfocus" : "View"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
