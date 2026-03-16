import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapReplay from "./map-views/MapReplay";
import MapLive from "./map-views/MapLive";
import MapCheckpoints from "./map-views/MapCheckpoints";

export default function MapTrack() {
  const [activeTab, setActiveTab] = useState<"replay" | "live" | "checkpoints">("replay");

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="replay">Replay</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
        </TabsList>
        <TabsContent value="replay" className="mt-4">
          <MapReplay />
        </TabsContent>
        <TabsContent value="live" className="mt-4">
          <MapLive />
        </TabsContent>
        <TabsContent value="checkpoints" className="mt-4">
          <MapCheckpoints />
        </TabsContent>
      </Tabs>
    </div>
  );
}
