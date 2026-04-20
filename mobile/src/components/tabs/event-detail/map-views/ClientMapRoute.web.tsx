import React from 'react';
import { View, Text } from 'react-native';
import { Radio } from 'lucide-react-native';

export function ClientMapRoute({ sortedCheckpoints }: { sortedCheckpoints: any[] }) {
   return (
      <View className="flex-1 items-center justify-center bg-muted/20">
         <Radio size={32} color="hsl(0, 0%, 50%)" style={{ opacity: 0.5 }} />
         <Text className="text-muted-foreground font-semibold mt-4 text-center px-6 leading-relaxed">
            Hardware accelerated Route maps bypass Web environments seamlessly rendering through native applications instead. Open on your device!
         </Text>
      </View>
   );
}
