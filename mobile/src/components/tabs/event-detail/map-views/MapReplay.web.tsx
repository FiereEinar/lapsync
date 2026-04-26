import React, { useEffect, useState, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";
import { Play, Pause } from "lucide-react-native";
import api from "@/src/api/axios";

let MapContainer: any,
  TileLayer: any,
  Marker: any,
  Polyline: any,
  Popup: any,
  useMap: any,
  L: any;

if (typeof window !== "undefined") {
  const ReactLeaflet = require("react-leaflet");
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  Marker = ReactLeaflet.Marker;
  Polyline = ReactLeaflet.Polyline;
  Popup = ReactLeaflet.Popup;
  useMap = ReactLeaflet.useMap;
  L = require("leaflet");
  require("leaflet/dist/leaflet.css");

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
}

const createCustomMarker = (color: string, name: string) => {
  if (typeof L === "undefined") return null;
  const shortName = name.split(" ")[0];

  const html = `
    <div style="position: relative; width: 0; height: 0;">
      <div style="position: absolute; left: 0px; bottom: 0px; width: 100px; height: 30px; z-index: 11; overflow: visible; pointer-events: auto; cursor: pointer;">
        <svg width="100" height="30" style="position: absolute; bottom: 0; left: 0; overflow: visible;">
          <path d="M 0 30 L 15 15 L 100 15" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div style="position: absolute; bottom: 17px; left: 17px; color: black; font-size: 12px; font-weight: 400; font-family: sans-serif; white-space: nowrap; line-height: 1; text-shadow: 1.5px 1.5px 0px white, -1.5px -1.5px 0px white, 1.5px -1.5px 0px white, -1.5px 1.5px 0px white, 0px 1.5px 0px white, 0px -1.5px 0px white, 1.5px 0px 0px white, -1.5px 0px 0px white;">
          ${shortName}
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "bg-transparent border-none overflow-visible",
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

function BoundsUpdater({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords && coords.length > 1) {
      map.fitBounds(coords, { padding: [50, 50] });
    }
  }, [map, coords]);
  return null;
}

type TelemetryData = {
  _id: string;
  registration: {
    _id: string;
    user: { name: string; email: string };
    raceCategory?: { name: string };
  };
  gps: { lat: number; lon: number };
  createdAt: string;
};

const COLORS = [
  "hsl(348, 83%, 47%)", // red
  "hsl(217, 91%, 60%)", // blue
  "hsl(160, 84%, 39%)", // emerald
  "hsl(38, 92%, 50%)", // amber
  "hsl(258, 90%, 66%)", // violet
  "hsl(330, 81%, 60%)", // pink
];

export function MapReplay({ event }: { event: any }) {
  const [telemetryPoints, setTelemetryPoints] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(5); // Default speed
  const playIntervalRef = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const { data } = await api.get(`/telemetry/event/${event?._id}`);
        if (data?.data) {
          setTelemetryPoints(data.data);
        }
      } catch (error) {
        console.error("Failed to load telemetry", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (event?._id) fetchTelemetry();
  }, [event]);

  const { groupedData, minTime, maxTime, defaultCenter } = useMemo(() => {
    if (telemetryPoints.length === 0) {
      return { groupedData: {}, minTime: 0, maxTime: 0, defaultCenter: null };
    }

    let min = new Date(telemetryPoints[0].createdAt).getTime();
    let max = min;
    let centroidLat = 0;
    let centroidLon = 0;

    const grouped: Record<string, TelemetryData[]> = {};

    telemetryPoints.forEach((t) => {
      const time = new Date(t.createdAt).getTime();
      if (time < min) min = time;
      if (time > max) max = time;

      centroidLat += t.gps.lat;
      centroidLon += t.gps.lon;

      const regId = t.registration._id;
      if (!grouped[regId]) grouped[regId] = [];
      grouped[regId].push(t);
    });

    centroidLat /= telemetryPoints.length;
    centroidLon /= telemetryPoints.length;

    Object.values(grouped).forEach((track) => {
      track.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });

    return {
      groupedData: grouped,
      minTime: min,
      maxTime: max,
      defaultCenter: { latitude: centroidLat, longitude: centroidLon },
    };
  }, [telemetryPoints]);

  useEffect(() => {
    if (minTime > 0 && currentTime === 0) {
      setCurrentTime(minTime);
    }
  }, [minTime, currentTime]);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const nextTime = prev + 1000 * playbackSpeed;
          if (nextTime >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return nextTime;
        });
      }, 500);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current as any);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current as any);
    };
  }, [isPlaying, maxTime, playbackSpeed]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const getCurrentPositions = () => {
    const positions: { track: TelemetryData[]; currentPoint: TelemetryData }[] =
      [];
    Object.values(groupedData).forEach((track) => {
      let matchedPoint = track[0];
      for (let i = 0; i < track.length; i++) {
        if (new Date(track[i].createdAt).getTime() <= currentTime) {
          matchedPoint = track[i];
        } else {
          break;
        }
      }
      if (matchedPoint) positions.push({ track, currentPoint: matchedPoint });
    });
    return positions;
  };

  const positions = getCurrentPositions();

  return (
    <View className='flex-1 min-h-[600px]'>
      <View className='bg-card border border-border/60 rounded-2xl overflow-hidden mb-4'>
        <View className='p-4 border-b border-border/50 bg-muted/10'>
          <Text className='font-bold text-foreground text-lg'>
            Race Route Replay (Web)
          </Text>
        </View>

        <View className='w-full h-[360px]' style={{ zIndex: 0 }}>
          {isLoading ? (
            <View className='flex-1 bg-muted/20 items-center justify-center'>
              <ActivityIndicator color='hsl(173, 50%, 50%)' />
              <Text className='text-muted-foreground font-medium mt-3 animate-pulse'>
                Loading Telemetry Replay...
              </Text>
            </View>
          ) : telemetryPoints.length === 0 ? (
            <View className='flex-1 bg-muted/20 items-center justify-center'>
              <Text className='text-muted-foreground font-medium'>
                No GPS data available for this event yet.
              </Text>
            </View>
          ) : defaultCenter && typeof window !== "undefined" && MapContainer ? (
            <MapContainer
              center={[defaultCenter.latitude, defaultCenter.longitude]}
              zoom={15}
              style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
              <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />

              {positions.map(({ track, currentPoint }, index) => {
                const latLngs = track.map((t) => [t.gps.lat, t.gps.lon] as [number, number]);
                const color = COLORS[index % COLORS.length];

                return (
                  <React.Fragment key={track[0].registration._id}>
                    {latLngs.length > 1 && (
                      <Polyline
                        positions={latLngs}
                        color={color}
                        weight={3}
                      />
                    )}
                    <Marker
                      position={[currentPoint.gps.lat, currentPoint.gps.lon]}
                      icon={createCustomMarker(color, currentPoint.registration.user?.name || "Unknown")}
                    />
                  </React.Fragment>
                );
              })}
            </MapContainer>
          ) : null}
        </View>

        {/* Playback Controls */}
        {!isLoading && telemetryPoints.length > 0 && (
          <View className='p-4 bg-card border-t border-border/50'>
            <View className='flex-row items-center gap-4'>
              <TouchableOpacity
                onPress={togglePlay}
                disabled={currentTime >= maxTime}
                className={`w-12 h-12 rounded-full items-center justify-center ${currentTime >= maxTime ? "bg-muted border border-border" : "bg-primary"}`}
              >
                {isPlaying ? (
                  <Pause size={18} color='white' />
                ) : (
                  <Play
                    size={18}
                    color={currentTime >= maxTime ? "hsl(0, 0%, 50%)" : "white"}
                    style={!isPlaying && { marginLeft: 2 }}
                  />
                )}
              </TouchableOpacity>

              <View className='flex-1 justify-center'>
                <Slider
                  minimumValue={minTime}
                  maximumValue={maxTime}
                  value={currentTime}
                  disabled={minTime === maxTime}
                  onValueChange={(val) => {
                    setCurrentTime(val);
                    if (isPlaying) setIsPlaying(false);
                  }}
                  minimumTrackTintColor='hsl(173, 50%, 50%)'
                  maximumTrackTintColor='hsl(0, 0%, 80%)'
                  thumbTintColor='hsl(173, 50%, 50%)'
                />
                <View className='flex-row justify-between px-2 mt-1'>
                  <Text className='text-[10px] text-muted-foreground font-semibold'>
                    {new Date(minTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text className='text-[11px] text-foreground font-bold border border-border px-2 py-0.5 rounded-full'>
                    {new Date(currentTime).toLocaleTimeString()}
                  </Text>
                  <Text className='text-[10px] text-muted-foreground font-semibold'>
                    {new Date(maxTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Speed controls */}
            <View className='flex-row justify-center gap-2 mt-4 flex-wrap'>
              {[1, 5, 15, 60].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  onPress={() => setPlaybackSpeed(speed)}
                  className={`px-3 py-1.5 rounded-full border ${playbackSpeed === speed ? "bg-primary/20 border-primary/50" : "bg-muted/30 border-border/60"}`}
                >
                  <Text
                    className={`text-xs font-bold tracking-wider ${playbackSpeed === speed ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {speed}x speed
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
