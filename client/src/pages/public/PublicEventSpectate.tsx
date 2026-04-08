import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Trophy, Map, MapPin } from "lucide-react";
import axiosInstance from "@/api/axios";
import { QUERY_KEYS } from "@/constants";
import { Event } from "@/types/event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import MapLive from "../../components/tabs/event-detail/map-views/MapLive";
import Leaderboard from "../../components/tabs/event-detail/Leaderboard";
import EventFullDetails from "@/components/EventFullDetails";
import RaceCategoryTable from "@/components/RaceCategoryTable";
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

export default function PublicEventSpectate() {
  const { id } = useParams<{ id: string }>();
  const [totalRouteDistance, setTotalRouteDistance] = useState<number>(0);

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EVENT, id, "public"],
    queryFn: async (): Promise<Event> => {
      const { data } = await axiosInstance.get(`/public/event/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const { data: checkpoints = [] } = useQuery({
    queryKey: ["checkpoints", id, "public"],
    queryFn: async (): Promise<Checkpoint[]> => {
      // Using public route for checkpoints
      const { data } = await axiosInstance.get(
        `/public/race-checkpoint/event/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });

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

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
          <p className='text-muted-foreground animate-pulse'>
            Loading Event Telemetry...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background p-4'>
        <div className='text-center bg-card p-8 rounded-3xl border shadow-sm max-w-md w-full'>
          <Trophy className='mx-auto w-12 h-12 text-muted-foreground mb-4' />
          <h2 className='text-2xl font-bold mb-2'>Event Not Found</h2>
          <p className='text-muted-foreground mb-6'>
            The requested event could not be found or has been removed.
          </p>
          <Link to='/public/events'>
            <Button className='w-full rounded-xl'>Return to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full px-4 md:px-8 lg:px-12 py-8 min-h-[calc(100vh-130px)] space-y-8 h-full'>
      {/* Dynamic Header */}
      {/* <div className='flex items-center gap-4'>
        <Link to='/public/events'>
          <Button variant='outline' size='icon' className='rounded-xl shrink-0'>
            <ArrowLeft className='w-4 h-4' />
            <span className='sr-only'>Back</span>
          </Button>
        </Link>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
            {event.name}
          </h1>
          <p className='text-muted-foreground text-sm flex items-center gap-2'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
            </span>
            Live Standard Broadcast
          </p>
        </div>
      </div> */}

      <div className='space-y-6'>
        <EventFullDetails event={event} />
        <RaceCategoryTable categories={event.raceCategories} event={event} />
      </div>

      {/* Spectator Tabs */}
      <Tabs defaultValue='leaderboard' className='w-full'>
        <div className='flex justify-center md:justify-start mb-6'>
          <TabsList className='grid w-full sm:w-[600px] grid-cols-3 rounded-xl p-1 h-auto bg-card border shadow-sm'>
            <TabsTrigger
              value='leaderboard'
              className='rounded-lg py-2 flex items-center gap-2'
            >
              <Trophy className='w-4 h-4' />
              <span className='hidden sm:inline'>Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger
              value='live-map'
              className='rounded-lg py-2 flex items-center gap-2'
            >
              <Map className='w-4 h-4' />
              <span className='hidden sm:inline'>Live Map</span>
            </TabsTrigger>
            <TabsTrigger
              value='route'
              className='rounded-lg py-2 flex items-center gap-2'
            >
              <MapPin className='w-4 h-4' />
              <span className='hidden sm:inline'>Route Map</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value='leaderboard'
          className='animate-in fade-in-50 slide-in-from-bottom-4 duration-500'
        >
          <Leaderboard event={event} isPublic={true} />
        </TabsContent>

        <TabsContent
          value='live-map'
          className='animate-in fade-in-50 slide-in-from-bottom-4 duration-500'
        >
          <MapLive />
        </TabsContent>

        <TabsContent
          value='route'
          className='animate-in fade-in-50 slide-in-from-bottom-4 duration-500'
        >
          <Card className='rounded-xl border border-border shadow-sm'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                    <MapPin className='w-4 h-4 text-primary' />
                  </div>
                  Route & Checkpoints
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
              <div className='w-full h-[500px] bg-muted/30 rounded-xl flex items-center justify-center overflow-hidden border z-0 relative'>
                {checkpoints.length === 0 ? (
                  <div className='text-center text-muted-foreground'>
                    <MapPin className='w-12 h-12 mx-auto mb-2 opacity-30' />
                    <p>Route map preview</p>
                    <p className='text-sm'>Map will be available soon</p>
                  </div>
                ) : (
                  <MapContainer
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
