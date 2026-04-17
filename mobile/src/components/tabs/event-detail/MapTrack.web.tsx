import React from 'react';
import { View, Text } from 'react-native';
import { Map as MapIcon } from 'lucide-react-native';

export function MapTrack({ event }: { event: any }) {
  return (
    <View className="flex-1 mt-2 min-h-[500px]">
      <View className="bg-card border border-border/60 rounded-2xl p-8 flex-col items-center justify-center flex-1 w-full min-h-[400px]">
         <MapIcon size={48} color="hsl(0, 0%, 70%)" style={{ marginBottom: 20 }} />
         <Text className="text-foreground font-bold text-xl text-center">
            Map Track Unavailable on Web View
         </Text>
         <Text className="text-muted-foreground text-center mt-3 text-sm leading-relaxed px-4">
            The mobile Maps module requires hardware-accelerated mapping engines (Apple Maps / Google Maps OS). 
            {"\n\n"}
            Please scan the QR code via the Expo Go app on your phone, or log in to the primary Web Command Center to view map modules via Leaflet.
         </Text>
      </View>
    </View>
  );
}
