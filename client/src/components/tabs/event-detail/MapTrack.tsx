import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapReplay from "./map-views/MapReplay";
import MapLive from "./map-views/MapLive";
import MapCheckpoints from "./map-views/MapCheckpoints";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/api/axios";

export default function MapTrack() {
  const [activeTab, setActiveTab] = useState<"replay" | "live" | "checkpoints">("replay");
  const { eventID } = useParams();

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get(`/telemetry/export/${eventID}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lapSync-telemetry-${eventID}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="replay">Replay</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Telemetry (CSV)
        </Button>
      </div>

      <div className="mt-2">
        {activeTab === "replay" && <MapReplay />}
        {activeTab === "live" && <MapLive />}
        {activeTab === "checkpoints" && <MapCheckpoints />}
      </div>
    </div>
  );
}
