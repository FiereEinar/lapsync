import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Text } from "react-native";
import { MapPin } from "lucide-react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";

const getPinColor = (type: string) => {
  if (type === "start") return "#10b981"; // emerald
  if (type === "finish") return "#ef4444"; // red
  if (type === "waypoint") return "#94a3b8"; // slate
  return "#3b82f6"; // blue for standard checkpoint
};

export function ClientMapRoute({ sortedCheckpoints }: { sortedCheckpoints: any[] }) {
   const mapRef = useRef<MapView>(null);
   const [routeLine, setRouteLine] = useState<{ latitude: number; longitude: number }[]>([]);

   // Calculate generic polyline via OSRM implicitly!
   useEffect(() => {
     const buildRoute = async () => {
       if (sortedCheckpoints.length < 2) {
         setRouteLine([]);
         return;
       }

       const coordsString = sortedCheckpoints
         .map((cp) => `${cp.location.lng},${cp.location.lat}`)
         .join(";");
       try {
         const response = await fetch(
           `https://router.project-osrm.org/route/v1/driving/${coordsString}?geometries=geojson`
         );
         const data = await response.json();
         
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
         }
       } catch (err) {
         console.error("OSRM Route mapping error in client view", err);
       }
     };

     buildRoute();
   }, [sortedCheckpoints]);

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
            <MapPin size={32} color="#808080" style={{ opacity: 0.3 }} />
            <Text className="text-muted-foreground font-semibold mt-4">Map will be available soon.</Text>
         </View>
      );
  }

  return (
      <MapView 
         ref={mapRef}
         provider={PROVIDER_DEFAULT} 
         style={{ width: '100%', height: '100%' }}
         mapType="none"
         initialRegion={{
            latitude: sortedCheckpoints[0]?.location.lat || 14.5995,
            longitude: sortedCheckpoints[0]?.location.lng || 120.9842,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
         }}
      >
         <UrlTile
           urlTemplate='https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
           maximumZ={19}
           flipY={false}
         />
         
         {routeLine.length > 0 && (
           <Polyline
             coordinates={routeLine}
             strokeColor="#3b82f6"
             strokeWidth={4}
           />
         )}

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
