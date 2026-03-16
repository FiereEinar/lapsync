import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Checkpoint = {
  _id: string;
  name: string;
  type: "start" | "finish" | "checkpoint";
  location: {
    lat: number;
    lng: number;
  };
};

export default function MapCheckpoints() {
  const { eventID } = useParams();
  const queryClient = useQueryClient();
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]); // Manila default
  const [isAdding, setIsAdding] = useState(false);
  
  // State for a new unsaved checkpoint
  const [newCheckpointPoint, setNewCheckpointPoint] = useState<[number, number] | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"start" | "finish" | "checkpoint">("checkpoint");

  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');

  const { data: checkpoints = [], isLoading } = useQuery({
    queryKey: ["checkpoints", eventID],
    queryFn: async (): Promise<Checkpoint[]> => {
      const { data } = await axiosInstance.get(`/race-checkpoint/event/${eventID}`);
      return data.data;
    },
    enabled: !!eventID,
  });

  const centerCalculated = useRef(false);

  useEffect(() => {
    if (checkpoints.length > 0 && !centerCalculated.current) {
      setMapCenter([checkpoints[0].location.lat, checkpoints[0].location.lng]);
      centerCalculated.current = true;
    }
  }, [checkpoints]);

  const addCheckpointMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post("/race-checkpoint", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkpoints", eventID] });
      toast.success("Checkpoint added successfully!");
      setNewCheckpointPoint(null);
      setNewName("");
      setNewType("checkpoint");
      setActiveTab("view");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add checkpoint");
    },
  });

  const updateCheckpointMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await axiosInstance.put(`/race-checkpoint/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkpoints", eventID] });
      toast.success("Checkpoint updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update checkpoint");
    },
  });

  const deleteCheckpointMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/race-checkpoint/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkpoints", eventID] });
      toast.success("Checkpoint deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete checkpoint");
    },
  });

  const handleAddCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setNewCheckpointPoint([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setActiveTab("add");
      },
      (error) => {
        toast.error("Unable to retrieve your location. Please allow location access.");
        console.error("Geolocation error:", error);
      }
    );
  };

  const handleSaveNewCheckpoint = () => {
    if (!newCheckpointPoint) return;
    if (!newName.trim()) {
      toast.error("Please provide a name for the checkpoint");
      return;
    }

    addCheckpointMutation.mutate({
      event: eventID,
      name: newName,
      type: newType,
      location: {
        lat: newCheckpointPoint[0],
        lng: newCheckpointPoint[1],
      },
    });
  };

  const handleMarkerDragEnd = (id: string, e: L.DragEndEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    updateCheckpointMutation.mutate({
      id,
      data: {
        location: {
          lat: position.lat,
          lng: position.lng,
        },
      },
    });
  };

  const handleNewMarkerDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setNewCheckpointPoint([position.lat, position.lng]);
  };

  // Allows clicking map to set new point instead of Geolocation
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        if (activeTab === 'add') {
          setNewCheckpointPoint([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Race Checkpoints</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'view' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('view');
              setNewCheckpointPoint(null);
            }}
          >
            View Map
          </Button>
          <Button 
            variant={activeTab === 'add' ? 'default' : 'outline'}
            onClick={handleAddCurrentLocation}
          >
            Add Checkpoint via Your GPS
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {activeTab === 'add' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card">
            <div className="space-y-2">
              <Label>Checkpoint Name</Label>
              <Input 
                placeholder="e.g. Water Station 1" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newType} onValueChange={(val: any) => setNewType(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="finish">Finish</SelectItem>
                  <SelectItem value="checkpoint">Checkpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full" 
                onClick={handleSaveNewCheckpoint}
                disabled={!newCheckpointPoint || addCheckpointMutation.isPending}
              >
                {newCheckpointPoint ? "Save Checkpoint" : "Click on Map to Place Pin"}
              </Button>
            </div>
          </div>
        )}

        <MapContainer
          key={mapCenter.join(',')} // Key helps reset view if center changes drastically
          center={mapCenter}
          zoom={14}
          className="w-full h-[500px] rounded-lg z-0 border"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />

          {/* Render existing checkpoints */}
          {!isLoading &&
            checkpoints.map((cp) => (
              <Marker
                key={cp._id}
                position={[cp.location.lat, cp.location.lng]}
                draggable={true} // Admin can drag to adjust
                eventHandlers={{
                  dragend: (e) => handleMarkerDragEnd(cp._id, e),
                }}
              >
                <Popup>
                  <div className="flex flex-col gap-2 p-1 min-w-[150px]">
                    <div className="font-bold text-sm">{cp.name}</div>
                    <div className="text-xs capitalize text-muted-foreground">{cp.type}</div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-7 text-xs mt-2"
                      onClick={() => deleteCheckpointMutation.mutate(cp._id)}
                      disabled={deleteCheckpointMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Render new checkpoint being added */}
          {activeTab === 'add' && newCheckpointPoint && (
            <Marker
              position={newCheckpointPoint}
              draggable={true}
              eventHandlers={{
                dragend: handleNewMarkerDragEnd,
              }}
            >
              <Popup>
                <div className="text-sm font-semibold">New Checkpoint Location</div>
                <div className="text-xs text-muted-foreground">Drag me to adjust!</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
