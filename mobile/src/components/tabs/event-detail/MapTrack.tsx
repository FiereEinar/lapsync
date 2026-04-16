import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Download, Play, Radio, Map as MapIcon } from 'lucide-react-native';
import { MapLive } from './map-views/MapLive';

export function MapTrack({ event }: { event: any }) {
  const [activeTab, setActiveTab] = useState<'replay' | 'live' | 'checkpoints'>('live');

  const handleExport = async () => {
    Alert.alert("Export Telemetry", "CSV Export mapping natively requires file-system integration. Would you like to trigger an email export?", [
       { text: "Cancel", style: "cancel" },
       { text: "Send", onPress: () => Alert.alert("Success", "Export requested internally.") }
    ]);
  };

  return (
    <View className="mx-6 mb-12">
      <View className="bg-card items-center p-3 rounded-xl border border-border/60 mb-4 gap-4 z-10 sm:w-full">
        <View className="flex-row w-full bg-muted/40 p-1.5 rounded-xl">
           <TouchableOpacity 
              onPress={() => setActiveTab('replay')} 
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${activeTab === 'replay' ? 'bg-background border border-border/50' : ''}`}
           >
              <Play size={14} color={activeTab === 'replay' ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 50%)"} style={{ marginRight: 6 }} />
              <Text className={`text-sm font-bold ${activeTab === 'replay' ? 'text-foreground' : 'text-muted-foreground'}`}>Replay</Text>
           </TouchableOpacity>
           
           <TouchableOpacity 
              onPress={() => setActiveTab('live')} 
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${activeTab === 'live' ? 'bg-background border border-border/50' : ''}`}
           >
              <Radio size={14} color={activeTab === 'live' ? "hsl(173, 50%, 50%)" : "hsl(0, 0%, 50%)"} style={{ marginRight: 6 }} />
              <Text className={`text-sm font-bold ${activeTab === 'live' ? 'text-foreground text-primary' : 'text-muted-foreground'}`}>Live</Text>
           </TouchableOpacity>

           <TouchableOpacity 
              onPress={() => setActiveTab('checkpoints')} 
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${activeTab === 'checkpoints' ? 'bg-background border border-border/50' : ''}`}
           >
              <MapIcon size={14} color={activeTab === 'checkpoints' ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 50%)"} style={{ marginRight: 6 }} />
              <Text className={`text-sm font-bold ${activeTab === 'checkpoints' ? 'text-foreground' : 'text-muted-foreground'}`}>Checkpoints</Text>
           </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleExport} className="flex-row items-center justify-center w-full bg-transparent border border-border/60 py-3 rounded-xl">
           <Download size={16} color="hsl(0, 0%, 40%)" style={{ marginRight: 8 }} />
           <Text className="text-muted-foreground font-bold text-sm tracking-wide">Export Telemetry (CSV)</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-2 min-h-[500px]">
         {activeTab === 'live' && <MapLive event={event} />}
         
         {activeTab === 'replay' && <View className="flex-1 bg-card border border-border/60 rounded-2xl items-center justify-center"><Text className="text-muted-foreground font-bold py-32 text-center px-8">Replay Native Module is under construction.</Text></View>}
         {activeTab === 'checkpoints' && <View className="flex-1 bg-card border border-border/60 rounded-2xl items-center justify-center"><Text className="text-muted-foreground font-bold py-32 text-center px-8">Checkpoints Tracker Native Module is under construction.</Text></View>}
      </View>
    </View>
  );
}
