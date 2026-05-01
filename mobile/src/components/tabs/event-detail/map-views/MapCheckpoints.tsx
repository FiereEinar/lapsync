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
import MapView, {
  Marker,
  Polyline,
  UrlTile,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import {
  MapPin,
  Navigation,
  Trash2,
  PlusCircle,
  LocateFixed,
} from "lucide-react-native";
import * as Location from "expo-location";
import api from "@/src/api/axios";

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

  const getPinColor = (type: string) => {
    if (type === "start") return "hsl(160, 84%, 39%)"; // emerald
    if (type === "finish") return "hsl(348, 83%, 47%)"; // red
    if (type === "waypoint") return "hsl(0, 0%, 65%)"; // slate
    return "hsl(217, 91%, 60%)"; // blue for regular checkpoints
  };

  const sortedCheckpoints = [...checkpoints].sort((a, b) => {
    const getScore = (type: string) => {
      if (type === "start") return 0;
      if (type === "finish") return 2;
      return 1;
    };
    const scoreA = getScore(a.type);
    const scoreB = getScore(b.type);
    if (scoreA !== scoreB) return scoreA - scoreB;
    return (a.order || 0) - (b.order || 0);
  });

  // Calculate generic polyline via OSRM implicitly!
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
        // Use native fetch to avoid axios baseURL/credential issues on mobile for external APIs
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?geometries=geojson`
        );
        const data = await response.json();
        
        if (data?.routes?.[0]) {
          const geojsonCoords = data.routes[0].geometry.coordinates as [
            number,
            number,
          ][]; // [lng, lat]
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
              setIsLoading(false); // only toggle if error since fetchCheckpoints toggles it as well
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
          lat: Number(newCheckpointPoint.latitude),
          lng: Number(newCheckpointPoint.longitude),
        },
      });
      setNewName("");
      setNewType("checkpoint");
      setNewCheckpointPoint(null);
      setActiveTab("view");
      fetchCheckpoints();
      Alert.alert("Success", "Checkpoint Added!");
    } catch (err: any) {
      console.error("Checkpoint Submission Error:", err);
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      const errorMessage = serverMessage || err.message || "Unknown error";
      
      Alert.alert(
        "Submission Failed",
        `Status: ${status || "N/A"}\nMessage: ${errorMessage}\n\nFull Body: ${JSON.stringify(err.response?.data || {}).substring(0, 100)}`
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
            Race Checkpoints
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
          <View className='w-full h-[400px]'>
            {isLoading && checkpoints.length === 0 ? (
              <View className='flex-1 bg-muted/20 items-center justify-center'>
                <ActivityIndicator color='hsl(173, 50%, 50%)' />
              </View>
            ) : (
              <MapView
                provider={PROVIDER_DEFAULT}
                style={{ flex: 1 }}
                mapType='none'
                region={{
                  latitude: mapCenter.latitude,
                  longitude: mapCenter.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.04,
                }}
                onPress={(e) => {
                  if (activeTab === "add") {
                    setNewCheckpointPoint(e.nativeEvent.coordinate);
                  }
                }}
              >
                <UrlTile
                  urlTemplate='https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  maximumZ={19}
                  flipY={false}
                />

                {sortedCheckpoints.map((cp) => (
                  <Marker
                    key={cp._id}
                    coordinate={{
                      latitude: cp.location.lat,
                      longitude: cp.location.lng,
                    }}
                    title={cp.name}
                    description={cp.type}
                    pinColor={getPinColor(cp.type)}
                    draggable={true}
                    onDragEnd={async (e) => {
                      try {
                        await api.put(`/race-checkpoint/${cp._id}`, {
                          location: {
                            lat: e.nativeEvent.coordinate.latitude,
                            lng: e.nativeEvent.coordinate.longitude,
                          },
                        });
                        fetchCheckpoints();
                      } catch (err) {
                        Alert.alert(
                          "Error",
                          "Failed to update checkpoint location remotely.",
                        );
                      }
                    }}
                  />
                ))}


                {routeLine.length > 0 && (
                  <Polyline
                    coordinates={routeLine}
                    strokeColor='#3b82f6'
                    strokeWidth={4}
                  />
                )}

                {activeTab === "add" && newCheckpointPoint && (
                  <Marker
                    coordinate={newCheckpointPoint}
                    title='New Checkpoint'
                    description='Drag to adjust precisely, or long click map'
                    pinColor='hsl(258, 90%, 66%)'
                    draggable={true}
                    onDragEnd={(e) =>
                      setNewCheckpointPoint(e.nativeEvent.coordinate)
                    }
                  />
                )}
              </MapView>
            )}
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
                      className='font-bold text-foreground'
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
