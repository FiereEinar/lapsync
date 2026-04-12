import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Radio, CheckCircle, Info } from "lucide-react";
import { QUERY_KEYS } from "@/constants";
import axiosInstance from "@/api/axios";
import { Event } from "@/types/event";
import EventFullDetails from "@/components/EventFullDetails";
import RaceCategoryTable from "@/components/RaceCategoryTable";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/stores/user";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMemo, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import L from "leaflet";
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
        : type === "waypoint"
          ? "#94a3b8"
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
  location: { lat: number; lng: number };
  order: number;
};

export default function ClientEventDetail() {
  const { id } = useParams();
  const { user } = useUserStore();
  const [totalRouteDistance, setTotalRouteDistance] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: event } = useQuery({
    queryKey: [QUERY_KEYS.EVENT, id],
    queryFn: async (): Promise<Event> => {
      const { data } = await axiosInstance.get(`/event/${id}`);
      return data.data;
    },
  });

  const { data: checkpoints = [] } = useQuery({
    queryKey: ["checkpoints", id, selectedCategory],
    queryFn: async (): Promise<Checkpoint[]> => {
      const { data } = await axiosInstance.get(
        `/race-checkpoint/event/${id}?raceCategory=${selectedCategory}`,
      );
      return data.data;
    },
    enabled: !!id && !!selectedCategory,
  });

  const { data: userRegistrations = [] } = useQuery({
    queryKey: ["registrations", id, user?._id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/registration?eventID=${id}&userID=${user?._id}`,
      );
      return data.data;
    },
    enabled: !!id && !!user?._id,
  });

  const registration = userRegistrations[0];

  useEffect(() => {
    if (
      event?.raceCategories &&
      event.raceCategories.length > 0 &&
      !selectedCategory
    ) {
      if (registration && registration.category) {
        // Find if the category is an object or ID. Usually it's an ObjectId string or populated.
        const catId =
          typeof registration.category === "object"
            ? registration.category._id
            : registration.category;
        setSelectedCategory(catId);
      } else {
        setSelectedCategory(event.raceCategories[0]._id);
      }
    }
  }, [event, registration, selectedCategory]);

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

  const mapCenter: [number, number] =
    sortedCheckpoints.length > 0
      ? [sortedCheckpoints[0].location.lat, sortedCheckpoints[0].location.lng]
      : [14.5995, 120.9842];

  const pickupLocation = event?.hardwarePickupLocation || "No pickup location set";

  const pickupTime = event?.hardwarePickupLocation && event?.date
    ? new Date(event.date).toLocaleDateString() + " - Morning prior to race"
    : "TBA";

  return (
    <div className='space-y-6 animate-appear'>
      {event && (
        <div className='space-y-6'>
          <EventFullDetails event={event} />
          <RaceCategoryTable categories={event.raceCategories} event={event} />
        </div>
      )}

      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='rounded-xl border border-border shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center'>
                <CheckCircle className='w-4 h-4 text-teal-500' />
              </div>
              Registration Status
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              {registration ? (
                <Badge
                  className={`uppercase tracking-wider border-0 ${registration.status === "confirmed" ? "bg-teal-500/15 text-teal-700 dark:text-teal-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}
                >
                  {registration.status}
                </Badge>
              ) : (
                <Badge className='bg-muted text-muted-foreground border-0'>
                  Not Registered
                </Badge>
              )}
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Tech Assignment</p>
              {registration?.rfidTag ? (
                <Badge variant='outline' className='rounded-md'>
                  RFID Tag #
                  {(registration.rfidTag as any).tagNumber || "Assigned"}
                </Badge>
              ) : registration?.device ? (
                <Badge variant='outline' className='rounded-md'>
                  Device Assigned
                </Badge>
              ) : (
                <Badge
                  variant='outline'
                  className='text-muted-foreground bg-muted/50 rounded-md border-dashed'
                >
                  No Tech Assigned Yet
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-xl border border-border shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                <Radio className='w-4 h-4 text-primary' />
              </div>
              Hardware Pickup
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <p className='text-sm font-medium mb-1'>Location</p>
              <p className='text-sm text-muted-foreground'>{pickupLocation}</p>
            </div>
            <div>
              <p className='text-sm font-medium mb-1'>Pickup Time</p>
              <p className='text-sm text-muted-foreground'>{pickupTime}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='rounded-xl border border-border shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <MapPin className='w-4 h-4 text-primary' />
                </div>
                Route & Checkpoints
              </div>
              {event?.raceCategories && (
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select Category' />
                  </SelectTrigger>
                  <SelectContent>
                    {event.raceCategories.map((cat: any) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {totalRouteDistance > 0 &&
              checkpoints.filter((cp) => cp.type !== "waypoint").length >=
                2 && (
                <Badge
                  variant='outline'
                  className='bg-primary/10 text-primary border-primary/20 text-sm py-1 rounded-lg'
                >
                  {(totalRouteDistance / 1000).toFixed(2)} km Course
                </Badge>
              )}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {!selectedCategory ? (
            <div className='flex flex-col items-center justify-center p-8 border rounded-xl bg-card text-center gap-2'>
              <h3 className='text-xl font-bold'>No Category Selected</h3>
              <p className='text-muted-foreground'>
                Please select a race category from the dropdown to view the
                route map.
              </p>
            </div>
          ) : (
            <>
              <div className='w-full h-[500px] bg-muted/30 rounded-xl flex items-center justify-center overflow-hidden border z-0 relative'>
                {checkpoints.length === 0 ? (
                  <div className='text-center text-muted-foreground'>
                    <MapPin className='w-12 h-12 mx-auto mb-2 opacity-30' />
                    <p>Route map preview</p>
                    <p className='text-sm'>
                      Map will be available soon or no checkpoints are set yet.
                    </p>
                  </div>
                ) : (
                  <MapContainer
                    key={mapCenter.join(",")}
                    center={mapCenter}
                    zoom={14}
                    className='w-full h-full z-0'
                  >
                    <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                    {sortedCheckpoints
                      .filter((cp) => cp.type !== "waypoint")
                      .map((cp) => (
                        <Marker
                          key={cp._id}
                          position={[cp.location.lat, cp.location.lng]}
                          icon={getPinIcon(cp.type)}
                        >
                          <Popup>
                            <div className='font-bold text-sm'>{cp.name}</div>
                            <div className='text-xs capitalize text-muted-foreground'>
                              {cp.type}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    {sortedCheckpoints.length >= 2 && (
                      <RoutingMachine
                        waypoints={sortedCheckpoints.map(
                          (cp) =>
                            [cp.location.lat, cp.location.lng] as [
                              number,
                              number,
                            ],
                        )}
                        onRouteFound={setTotalRouteDistance}
                      />
                    )}
                  </MapContainer>
                )}
              </div>

              <div className='space-y-2'>
                {sortedCheckpoints
                  .filter((cp) => cp.type !== "waypoint")
                  .map((checkpoint, index) => (
                    <div
                      key={checkpoint._id}
                      className='flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
										${
                      checkpoint.type === "start"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : checkpoint.type === "finish"
                          ? "bg-red-500/15 text-red-600"
                          : "bg-blue-500/15 text-blue-600"
                    }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className='font-semibold'>{checkpoint.name}</p>
                          <p className='text-xs capitalize text-muted-foreground'>
                            {checkpoint.type}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-[10px] uppercase font-mono text-muted-foreground'>
                          {checkpoint.location.lat.toFixed(4)}°,{" "}
                          {checkpoint.location.lng.toFixed(4)}°
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className='rounded-xl border border-primary/20 bg-primary/5 shadow-none'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
              <Info className='w-4 h-4 text-primary' />
            </div>
            Event Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-foreground/80 leading-relaxed font-medium'>
          <p className='flex items-center gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0' />{" "}
            Pick up your RFID tag from the equipment desk before race day
          </p>
          <p className='flex items-center gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0' />{" "}
            Attach the RFID tag securely to your running bib
          </p>
          <p className='flex items-center gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0' />{" "}
            Arrive at least 30 minutes before the start time
          </p>
          <p className='flex items-center gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0' />{" "}
            Warm up area available at City Hall Plaza
          </p>
          <p className='flex items-center gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0' />{" "}
            Water stations available at each checkpoint
          </p>
          <p className='flex items-center gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0' />{" "}
            Medical support stationed along the route
          </p>
        </CardContent>
      </Card>

      <div className='flex gap-4'>
        <Button className='flex-1'>View on Live Race Day</Button>
        <Button variant='outline' className='flex-1'>
          Download Event Info
        </Button>
      </div>
    </div>
  );
}
