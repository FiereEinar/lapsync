import React from 'react';
import { View, Text } from 'react-native';
import { Activity } from 'lucide-react-native';

export function MapLive({ event }: { event: any }) {
   return (
      <View className="flex-1 items-center justify-center bg-muted/20 min-h-[400px] py-12">
         <Activity size={32} color="hsl(0, 0%, 50%)" style={{ opacity: 0.5 }} />
         <Text className="text-muted-foreground font-semibold mt-4 text-center px-6 leading-relaxed max-w-sm mx-auto">
            Live map rendering leverages hardware-accelerated native components. Please open this broadcast on your mobile device to view active runners!
         </Text>
      </View>
   );
}
