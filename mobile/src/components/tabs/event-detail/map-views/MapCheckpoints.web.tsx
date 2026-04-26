import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Trash2, LocateFixed } from "lucide-react-native";
import * as Location from "expo-location";
import api from "@/src/api/axios";

let MapContainer: any,
  TileLayer: any,
  Marker: any,
  Polyline: any,
  Popup: any,
  useMapEvents: any,
  L: any;

if (typeof window !== "undefined") {
  const ReactLeaflet = require("react-leaflet");
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  Marker = ReactLeaflet.Marker;
  Polyline = ReactLeaflet.Polyline;
  Popup = ReactLeaflet.Popup;
  useMapEvents = ReactLeaflet.useMapEvents;
  L = require("leaflet");
  require("leaflet/dist/leaflet.css");

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
}

const getPinIcon = (type: string, index?: number) => {
  if (typeof L === "undefined") return null;
  const color =
    type === "start"
      ? "#10b981"
      : type === "finish"
        ? "#ef4444"
        : type === "new"
          ? "#8b5cf6"
          : type === "waypoint"
            ? "#94a3b8"
            : "#3b82f6";

  const indexText =
    index !== undefined
      ? `<text x="12" y="14" font-family="sans-serif" font-size="10" font-weight="bold" fill="${color}" text-anchor="middle">${index}</text>`
      : `<circle cx="12" cy="10" r="3" fill="white" stroke="none" />`;

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); width: 24px; height: 36px; position: absolute; left: 12px; top: 36px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        ${
          index !== undefined
            ? `<circle cx="12" cy="10" r="7" fill="white" stroke="none" />`
            : ""
        }
        ${indexText}
      </svg>
    </div>
  `;
  return L.divIcon({
    className: "bg-transparent border-none overflow-visible",
    html,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
  });
};

function MapClickHandler({
  onClick,
  active,
}: {
  onClick: (latlng: any) => void;
  active: boolean;
}) {
  if (typeof useMapEvents === "undefined") return null;
  useMapEvents({
    click(e: any) {
      if (active) onClick(e.latlng);
    },
  });
  return null;
}

type Checkpoint = {
  _id: string;
  name: string;
  type: "start" | "finish" | "checkpoint" | "waypoint";
  raceCategory: string;
  location: { lat: number; lng: number };
};

export function MapCheckpoints({ event }: { event: any }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
  });
  const [activeTab, setActiveTab] = useState<"view" | "add">("view");

  const [routeLine, setRouteLine] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeDistance, setRouteDistance] = useState<number>(0);

  const [newCheckpointPoint, setNewCheckpointPoint] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<
    "start" | "finish" | "checkpoint" | "waypoint"
  >("checkpoint");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event?.raceCategories?.length > 0 && !selectedCategory) {
      setSelectedCategory(event.raceCategories[0]._id);
    }
  }, [event]);

  useEffect(() => {
    fetchCheckpoints();
  }, [selectedCategory]);

  const fetchCheckpoints = async () => {
    if (!event?._id || !selectedCategory) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/race-checkpoint/event/${event._id}?raceCategory=${selectedCategory}`,
      );
      setCheckpoints(data.data || []);
      if (data.data?.length > 0) {
        setMapCenter({
          latitude: data.data[0].location.lat,
          longitude: data.data[0].location.lng,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedCheckpoints = [...checkpoints].sort((a, b) => {
    const getScore = (type: string) => {
      if (type === "start") return 0;
      if (type === "finish") return 2;
      return 1;
    };
    return getScore(a.type) - getScore(b.type);
  });

  useEffect(() => {
    const buildRoute = async () => {
      const mapped = sortedCheckpoints;
      if (mapped.length < 2) {
        setRouteLine([]);
        setRouteDistance(0);
        return;
      }

      const coordsString = mapped
        .map((cp) => `${cp.location.lng},${cp.location.lat}`)
        .join(";");
      try {
        const { data } = await api.get(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?geometries=geojson`,
        );
        if (data?.routes?.[0]) {
          const geojsonCoords = data.routes[0].geometry.coordinates as [
            number,
            number,
          ][];
          const parsedLine = geojsonCoords.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          }));
          setRouteLine(parsedLine);
          setRouteDistance(data.routes[0].distance);
        }
      } catch (err) {
        console.error("OSRM Route mapping error on mobile", err);
      }
    };

    buildRoute();
  }, [checkpoints]);

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Checkpoint",
      "Are you sure you want to delete this checkpoint?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              await api.delete(`/race-checkpoint/${id}`);
              fetchCheckpoints();
            } catch (err) {
              console.error("Failed to delete", err);
              Alert.alert("Error", "Could not delete checkpoint by Admin.");
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const submitNewCheckpoint = async () => {
    if (!newCheckpointPoint) return;
    if (!newName.trim()) return Alert.alert("Error", "Please provide a name.");
    if (!selectedCategory) return Alert.alert("Error", "Category required.");

    setIsSubmitting(true);
    try {
      await api.post("/race-checkpoint", {
        event: event._id,
        raceCategory: selectedCategory,
        name: newName,
        type: newType,
        location: {
          lat: newCheckpointPoint.latitude,
          lng: newCheckpointPoint.longitude,
        },
      });
      setNewName("");
      setNewType("checkpoint");
      setNewCheckpointPoint(null);
      setActiveTab("view");
      fetchCheckpoints();
      Alert.alert("Success", "Checkpoint Added!");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to add checkpoint",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchCurrentDeviceLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setNewCheckpointPoint({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setMapCenter({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setActiveTab("add");
  };

  return (
    <View className='flex-1 min-h-[700px]'>
      <View className='bg-card border border-border/60 rounded-2xl overflow-hidden mb-4'>
        <View className='p-4 border-b border-border/50 bg-muted/10 sm:flex-row items-center justify-between gap-4'>
          <Text className='font-bold text-foreground text-lg'>
            Race Checkpoints (Web)
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className='max-w-[200px]'
            contentContainerStyle={{ alignItems: "center", height: "100%" }}
          >
            {event?.raceCategories?.map((cat: any) => (
              <TouchableOpacity
                key={cat._id}
                onPress={() => setSelectedCategory(cat._id)}
                className={`px-3 py-1.5 rounded-full border mr-2 ${selectedCategory === cat._id ? "bg-primary/10 border-primary/40" : "bg-muted/30 border-border/80"}`}
              >
                <Text
                  className={`text-xs font-bold ${selectedCategory === cat._id ? "text-primary" : "text-muted-foreground"}`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {!selectedCategory ? (
          <View className='py-20 items-center justify-center bg-muted/10'>
            <Text className='text-muted-foreground font-medium px-10 text-center leading-relaxed'>
              No categories exist for this event so checkpoints map
              initialization aborted.
            </Text>
          </View>
        ) : (
          <View className='w-full h-[400px]' style={{ zIndex: 0 }}>
            {isLoading && checkpoints.length === 0 ? (
              <View className='flex-1 bg-muted/20 items-center justify-center'>
                <ActivityIndicator color='hsl(173, 50%, 50%)' />
              </View>
            ) : typeof window !== "undefined" && MapContainer ? (
              <MapContainer
                center={[mapCenter.latitude, mapCenter.longitude]}
                zoom={14}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                key={mapCenter.latitude + mapCenter.longitude}
              >
                <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                <MapClickHandler
                  active={activeTab === "add"}
                  onClick={(latlng) => {
                    setNewCheckpointPoint({
                      latitude: latlng.lat,
                      longitude: latlng.lng,
                    });
                  }}
                />

                {sortedCheckpoints.map((cp, idx) => (
                  <Marker
                    key={cp._id}
                    position={[cp.location.lat, cp.location.lng]}
                    draggable={true}
                    icon={getPinIcon(
                      cp.type,
                      cp.type !== "waypoint" ? idx + 1 : undefined,
                    )}
                    eventHandlers={{
                      dragend: async (e: any) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        try {
                          await api.put(`/race-checkpoint/${cp._id}`, {
                            location: {
                              lat: position.lat,
                              lng: position.lng,
                            },
                          });
                          fetchCheckpoints();
                        } catch (err) {
                          Alert.alert(
                            "Error",
                            "Failed to update checkpoint location remotely.",
                          );
                        }
                      },
                    }}
                  >
                    <Popup>
                      <div className='flex flex-col gap-2 p-1 min-w-[150px]'>
                        <div className='font-bold text-sm'>{cp.name}</div>
                        <div className='text-xs capitalize text-muted-foreground'>
                          {cp.type}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                <Polyline
                  positions={sortedCheckpoints.map(
                    (cp) => [cp.location.lat, cp.location.lng] as [number, number],
                  )}
                  color='hsl(152, 60%, 42%)'
                  weight={3}
                />

                {routeLine.length > 1 && (
                  <Polyline
                    positions={routeLine.map(
                      (r) => [r.latitude, r.longitude] as [number, number],
                    )}
                    color='hsl(217, 91%, 60%)'
                    weight={4}
                  />
                )}

                {activeTab === "add" && newCheckpointPoint && (
                  <Marker
                    position={[
                      newCheckpointPoint.latitude,
                      newCheckpointPoint.longitude,
                    ]}
                    draggable={true}
                    icon={getPinIcon("new")}
                    eventHandlers={{
                      dragend: (e: any) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        setNewCheckpointPoint({
                          latitude: position.lat,
                          longitude: position.lng,
                        });
                      },
                    }}
                  >
                    <Popup>
                      <div className='text-sm font-semibold'>
                        New Checkpoint Location
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Drag me to adjust!
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            ) : null}
          </View>
        )}
      </View>

      {/* Control Switch & Metadata */}
      {selectedCategory && (
        <View className='bg-card border border-border/60 rounded-2xl p-4 overflow-hidden mb-4'>
          <View className='flex-row gap-3 mb-4 border-b border-border/50 pb-4'>
            <TouchableOpacity
              onPress={() => {
                setActiveTab("view");
                setNewCheckpointPoint(null);
              }}
              className={`flex-1 py-3 items-center justify-center rounded-xl border ${activeTab === "view" ? "bg-primary border-primary" : "bg-transparent border-border/50"}`}
            >
              <Text
                className={`font-bold text-sm ${activeTab === "view" ? "text-white" : "text-muted-foreground"}`}
              >
                View Checkpoints
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("add")}
              className={`flex-1 py-3 items-center justify-center rounded-xl border ${activeTab === "add" ? "bg-primary/10 border-primary/30" : "bg-transparent border-border/50"}`}
            >
              <Text
                className={`font-bold text-sm ${activeTab === "add" ? "text-primary" : "text-muted-foreground"}`}
              >
                Add Manual
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFetchCurrentDeviceLocation}
              className='w-12 h-12 bg-muted/50 rounded-xl items-center justify-center border border-border/50'
            >
              <LocateFixed size={20} color='hsl(0, 0%, 50%)' />
            </TouchableOpacity>
          </View>

          {routeDistance > 0 && activeTab === "view" && (
            <View className='bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-lg mb-4 flex-row items-center justify-between'>
              <Text className='text-emerald-700 font-bold uppercase tracking-wider text-[10px]'>
                Total Routed Distance
              </Text>
              <Text className='text-emerald-700 font-mono font-bold text-sm'>
                {(routeDistance / 1000).toFixed(2)} km
              </Text>
            </View>
          )}

          {activeTab === "add" ? (
            <View className='space-y-4'>
              <View>
                <Text className='text-xs font-bold text-muted-foreground mb-1'>
                  CHECKPOINT IDENTIFIER
                </Text>
                <TextInput
                  placeholder='e.g. Water Station 1'
                  value={newName}
                  onChangeText={setNewName}
                  className='h-12 bg-background border border-border/60 rounded-xl px-4 text-foreground font-medium'
                />
              </View>
              <View>
                <Text className='text-xs font-bold text-muted-foreground mb-2 mt-2'>
                  PIN TYPE CLASSIFICATION
                </Text>
                <View className='flex-row flex-wrap gap-2'>
                  {["start", "checkpoint", "waypoint", "finish"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setNewType(type as any)}
                      className={`px-4 py-2 rounded-full border ${newType === type ? "bg-primary/20 border-primary/50" : "bg-transparent border-border/60"}`}
                    >
                      <Text
                        className={`text-xs font-bold capitalize ${newType === type ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                onPress={submitNewCheckpoint}
                disabled={!newCheckpointPoint || isSubmitting}
                className={`h-12 mt-4 rounded-xl flex-row items-center justify-center ${!newCheckpointPoint || isSubmitting ? "bg-muted" : "bg-primary"}`}
              >
                <Text
                  className={`font-bold text-base tracking-wide ${!newCheckpointPoint ? "text-muted-foreground" : "text-white"}`}
                >
                  {isSubmitting
                    ? "Processing Node..."
                    : newCheckpointPoint
                      ? "Save Checkpoint Array"
                      : "Tap Map to Place Droppin"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className='space-y-3'>
              {sortedCheckpoints.map((cp, idx) => (
                <View
                  key={cp._id}
                  className='flex-row bg-muted/10 border border-border/50 rounded-xl p-3 items-center'
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center border mr-3
                           ${cp.type === "start" ? "bg-emerald-500/20 border-emerald-500/30" : cp.type === "finish" ? "bg-destructive/20 border-destructive/30" : cp.type === "waypoint" ? "bg-slate-500/20 border-slate-500/30" : "bg-blue-500/20 border-blue-500/30"}
                        `}
                  >
                    <Text
                      className={`font-bold text-[10px] 
                              ${cp.type === "start" ? "text-emerald-700" : cp.type === "finish" ? "text-destructive" : cp.type === "waypoint" ? "text-slate-700" : "text-blue-700"}
                           `}
                    >
                      {idx + 1}
                    </Text>
                  </View>
                  <View className='flex-1 pr-4'>
                    <Text
                      className='font-extrabold text-foreground tracking-tight'
                      numberOfLines={1}
                    >
                      {cp.name}
                    </Text>
                    <Text className='text-muted-foreground text-[10px] uppercase font-semibold'>
                      {cp.type}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(cp._id)}
                    className='w-10 h-10 bg-destructive/10 rounded-xl items-center justify-center'
                  >
                    <Trash2 size={16} color='hsl(348, 83%, 47%)' />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
