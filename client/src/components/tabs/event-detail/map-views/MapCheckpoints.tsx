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
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import RoutingMachine from "@/components/RoutingMachine";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getPinIcon = (type: string) => {
  const color =
    type === "start"
      ? "#10b981"
      : type === "finish"
        ? "#ef4444"
        : type === "new"
          ? "#8b5cf6"
          : type === "waypoint"
          ? "#94a3b8" // slate color for waypoints
          : "#3b82f6";
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); width: 24px; height: 36px; position: absolute; left: 12px; top: 36px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
      </svg>
    </div>
  `;
  return L.divIcon({
    className: "bg-transparent border-none overflow-visible",
    html,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
  });
};

type Checkpoint = {
  _id: string;
  name: string;
  type: "start" | "finish" | "checkpoint" | "waypoint";
  location: {
    lat: number;
    lng: number;
  };
};

export default function MapCheckpoints({ eventId }: { eventId?: string } = {}) {
  const { eventID: urlEventId } = useParams();
  const queryClient = useQueryClient();
  const eventIDToUse = eventId || urlEventId;
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    14.5995, 120.9842,
  ]); // Manila default
  const [isAdding, setIsAdding] = useState(false);

  // State for a new unsaved checkpoint
  const [newCheckpointPoint, setNewCheckpointPoint] = useState<
    [number, number] | null
  >(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"start" | "finish" | "checkpoint" | "waypoint">(
    "checkpoint",
  );

  const [activeTab, setActiveTab] = useState<"view" | "add">("view");
  const [totalRouteDistance, setTotalRouteDistance] = useState<number>(0);

  const { data: checkpoints = [], isLoading } = useQuery({
    queryKey: ["checkpoints", eventIDToUse],
    queryFn: async (): Promise<Checkpoint[]> => {
      const { data } = await axiosInstance.get(
        `/race-checkpoint/event/${eventIDToUse}`,
      );
      return data.data;
    },
    enabled: !!eventIDToUse,
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
      queryClient.invalidateQueries({ queryKey: ["checkpoints", eventIDToUse] });
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
      queryClient.invalidateQueries({ queryKey: ["checkpoints", eventIDToUse] });
      toast.success("Checkpoint updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update checkpoint",
      );
    },
  });

  const deleteCheckpointMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/race-checkpoint/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkpoints", eventIDToUse] });
      toast.success("Checkpoint deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete checkpoint",
      );
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
        toast.error(
          "Unable to retrieve your location. Please allow location access.",
        );
        console.error("Geolocation error:", error);
      },
    );
  };

  const handleSaveNewCheckpoint = () => {
    if (!newCheckpointPoint) return;
    if (!newName.trim()) {
      toast.error("Please provide a name for the checkpoint");
      return;
    }

    addCheckpointMutation.mutate({
      event: eventIDToUse,
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
        if (activeTab === "add") {
          setNewCheckpointPoint([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  }

  const sortedCheckpoints = useMemo(() => {
    return [...checkpoints].sort((a, b) => {
      const getScore = (type: string) => {
        if (type === "start") return 0;
        if (type === "finish") return 2;
        return 1;
      };
      return getScore(a.type) - getScore(b.type);
    });
  }, [checkpoints]);

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Race Checkpoints</CardTitle>
        <div className='flex gap-2'>
          <Button
            variant={activeTab === "view" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("view");
              setNewCheckpointPoint(null);
            }}
          >
            View Map
          </Button>
          <Button
            variant={activeTab === "add" ? "default" : "outline"}
            onClick={handleAddCurrentLocation}
          >
            Add Checkpoint via Your GPS
          </Button>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {activeTab === "view" && totalRouteDistance > 0 && checkpoints.filter(cp => cp.type !== 'waypoint').length >= 2 && (
          <div className="flex justify-start items-center">
            <span className="font-semibold text-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-md border border-teal-500/20">
              Total Route Distance: {(totalRouteDistance / 1000).toFixed(2)} km
            </span>
          </div>
        )}

        {activeTab === "add" && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card'>
            <div className='space-y-2'>
              <Label>Checkpoint Name</Label>
              <Input
                placeholder='e.g. Water Station 1'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label>Type</Label>
              <Select
                value={newType}
                onValueChange={(val: any) => setNewType(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='start'>Start</SelectItem>
                  <SelectItem value='finish'>Finish</SelectItem>
                  <SelectItem value='checkpoint'>Checkpoint</SelectItem>
                  <SelectItem value='waypoint'>Waypoint (Route Guide)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-end'>
              <Button
                className='w-full'
                onClick={handleSaveNewCheckpoint}
                disabled={
                  !newCheckpointPoint || addCheckpointMutation.isPending
                }
              >
                {newCheckpointPoint
                  ? "Save Checkpoint"
                  : "Click on Map to Place Pin"}
              </Button>
            </div>
          </div>
        )}

        <MapContainer
          key={mapCenter.join(",")} // Key helps reset view if center changes drastically
          center={mapCenter}
          zoom={14}
          className='w-full h-[500px] rounded-lg z-0 border'
        >
          <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
          <MapClickHandler />

          {/* Render existing checkpoints */}
          {!isLoading &&
            checkpoints.map((cp) => (
              <Marker
                key={cp._id}
                position={[cp.location.lat, cp.location.lng]}
                draggable={true} // Admin can drag to adjust
                icon={getPinIcon(cp.type)}
                eventHandlers={{
                  dragend: (e) => handleMarkerDragEnd(cp._id, e),
                }}
              >
                <Popup>
                  <div className='flex flex-col gap-2 p-1 min-w-[150px]'>
                    <div className='font-bold text-sm'>{cp.name}</div>
                    <div className='text-xs capitalize text-muted-foreground'>
                      {cp.type}
                    </div>
                    <Button
                      variant='destructive'
                      size='sm'
                      className='h-7 text-xs mt-2'
                      onClick={() => deleteCheckpointMutation.mutate(cp._id)}
                      disabled={deleteCheckpointMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Render Route Path */}
          {!isLoading && sortedCheckpoints.length >= 2 && (
            <RoutingMachine
              waypoints={sortedCheckpoints.map(
                (cp) => [cp.location.lat, cp.location.lng] as [number, number],
              )}
              onRouteFound={setTotalRouteDistance}
            />
          )}

          {/* Render new checkpoint being added */}
          {activeTab === "add" && newCheckpointPoint && (
            <Marker
              position={newCheckpointPoint}
              draggable={true}
              icon={getPinIcon("new")}
              eventHandlers={{
                dragend: handleNewMarkerDragEnd,
              }}
            >
              <Popup>
                <div className='text-sm font-semibold'>
                  New Checkpoint Location
                </div>
                <div className='text-xs text-muted-foreground'>
                  Drag me to adjust!
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Read-Only View Checkpoints List */}
        {activeTab === "view" && checkpoints.length > 0 && (
          <div className='flex flex-col gap-3 p-4 border rounded-lg bg-card mt-4'>
            <h3 className='font-semibold'>Established Checkpoints</h3>
            <div className='space-y-2 mt-2'>
              {sortedCheckpoints
                .filter((cp) => cp.type !== "waypoint")
                .map((checkpoint, index) => (
                <div
                  key={checkpoint._id}
                  className='flex items-center justify-between p-3 border border-border rounded-lg bg-background'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                      ${
                        checkpoint.type === "start"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : checkpoint.type === "finish"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium'>{checkpoint.name}</p>
                      <p className='text-xs capitalize text-muted-foreground'>
                        {checkpoint.type}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-muted-foreground'>
                      {checkpoint.location.lat.toFixed(4)}°,{" "}
                      {checkpoint.location.lng.toFixed(4)}°
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editable Checkpoints List */}
        {activeTab === "add" && checkpoints.length > 0 && (
          <div className='flex flex-col gap-3 p-4 border rounded-lg bg-card mt-4'>
            <h3 className='font-semibold'>Edit Checkpoint Names</h3>
            <p className='text-sm text-muted-foreground mb-2'>
              Checkpoints are ordered: Start &rarr; Checkpoints/Waypoints &rarr; Finish. Edit a name and click outside the box to auto-save.
            </p>
            <div className='space-y-3'>
              {sortedCheckpoints.map((cp) => (
                <div key={cp._id} className='flex items-center gap-4'>
                  <div className='w-24 text-sm font-medium capitalize text-muted-foreground flex-shrink-0'>
                    {cp.type}
                  </div>
                  <Input
                    defaultValue={cp.name}
                    onBlur={(e) => {
                      if (e.target.value.trim() && e.target.value !== cp.name) {
                        updateCheckpointMutation.mutate({
                          id: cp._id,
                          data: { name: e.target.value },
                        });
                      }
                    }}
                  />
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-red-500 hover:text-red-700 hover:bg-red-100 flex-shrink-0'
                    onClick={() => deleteCheckpointMutation.mutate(cp._id)}
                    disabled={deleteCheckpointMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
