import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { MapPin } from "lucide-react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";

const getPinColor = (type: string) => {
  if (type === "start") return "hsl(160, 84%, 39%)"; // emerald
  if (type === "finish") return "hsl(348, 83%, 47%)"; // red
  if (type === "waypoint") return "hsl(215, 16%, 47%)"; // slate
  return "hsl(217, 91%, 60%)"; // blue for standard checkpoint
};

export function ClientMapRoute({ sortedCheckpoints }: { sortedCheckpoints: any[] }) {
   const mapRef = useRef<MapView>(null);

   useEffect(() => {
     if (sortedCheckpoints.length > 0 && mapRef.current) {
        const coords = sortedCheckpoints.map(cp => ({
           latitude: cp.location.lat,
           longitude: cp.location.lng,
        }));
        setTimeout(() => {
           mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true
           });
        }, 500);
     }
  }, [sortedCheckpoints]);

  if (sortedCheckpoints.length === 0) {
      return (
         <View className="flex-1 items-center justify-center bg-background">
            <MapPin size={32} color="hsl(0, 0%, 50%)" style={{ opacity: 0.3 }} />
            <Text className="text-muted-foreground font-semibold mt-4">Map will be available soon.</Text>
         </View>
      );
  }

  return (
      <MapView 
         ref={mapRef}
         provider={PROVIDER_DEFAULT} 
         style={{ width: '100%', height: '100%' }}
         initialRegion={{
            latitude: sortedCheckpoints[0]?.location.lat || 14.5995,
            longitude: sortedCheckpoints[0]?.location.lng || 120.9842,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
         }}
      >
         
         {sortedCheckpoints.filter(c => c.type !== "waypoint").map(cp => (
            <Marker
               key={cp._id}
               coordinate={{ latitude: cp.location.lat, longitude: cp.location.lng }}
               title={cp.name}
               description={`${cp.type.toUpperCase()} CHECKPOINT`}
               pinColor={getPinColor(cp.type)}
            />
         ))}
      </MapView>
  );
}
