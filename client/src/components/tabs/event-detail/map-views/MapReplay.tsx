import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
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

type TelemetryData = {
  _id: string;
  registration: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
    raceCategory?: {
      name: string;
    };
  };
  gps: {
    lat: number;
    lon: number;
  };
  createdAt: string;
};

type GroupedTelemetry = {
  [registrationId: string]: TelemetryData[];
};

const COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
];

const createCustomMarker = (color: string, name: string) => {
  const shortName = name.split(" ")[0];

  const html = `
    <div style="position: relative; width: 24px; height: 36px; pointer-events: none;">
      <!-- The Pin -->
      <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; width: 24px; height: 36px; position: absolute; z-index: 10;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
        </svg>
      </div>
      
      <!-- The Callout -->
      <div style="position: absolute; left: 12px; bottom: 24px; width: 80px; height: 40px; pointer-events: none; z-index: 11;">
        <!-- The SVG Line -->
        <svg width="80" height="30" style="position: absolute; bottom: 0; left: 0; overflow: visible;">
          <path d="M 0 30 L 15 20 L 80 20" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <!-- The Name -->
        <div style="position: absolute; bottom: 10px; left: 20px; color: black; font-size: 14px; font-family: sans-serif; white-space: nowrap; line-height: 1; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 0px 1px 0px white, 0px -1px 0px white, 1px 0px 0px white, -1px 0px 0px white;">
          ${shortName}
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "bg-transparent border-none overflow-visible",
    html,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
  });
};

export default function MapReplay() {
  const { eventID } = useParams();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: telemetryPoints = [], isLoading } = useQuery({
    queryKey: ["telemetry", eventID],
    queryFn: async (): Promise<TelemetryData[]> => {
      const { data } = await axiosInstance.get(`/telemetry/event/${eventID}`);
      return data.data;
    },
    enabled: !!eventID,
  });

  const { groupedData, minTime, maxTime, defaultCenter } = useMemo(() => {
    if (telemetryPoints.length === 0) {
      return { groupedData: {}, minTime: 0, maxTime: 0, defaultCenter: null };
    }

    let min = new Date(telemetryPoints[0].createdAt).getTime();
    let max = min;
    let centroidLat = 0;
    let centroidLon = 0;

    const grouped: GroupedTelemetry = {};

    telemetryPoints.forEach((t) => {
      const time = new Date(t.createdAt).getTime();
      if (time < min) min = time;
      if (time > max) max = time;

      centroidLat += t.gps.lat;
      centroidLon += t.gps.lon;

      const regId = t.registration._id;
      if (!grouped[regId]) grouped[regId] = [];
      grouped[regId].push(t);
    });

    centroidLat /= telemetryPoints.length;
    centroidLon /= telemetryPoints.length;

    // Sort each participant's track chronologically
    Object.values(grouped).forEach((track) => {
      track.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });

    return {
      groupedData: grouped,
      minTime: min,
      maxTime: max,
      defaultCenter: [centroidLat, centroidLon] as [number, number],
    };
  }, [telemetryPoints]);

  // Set initial slider position when data loads
  useEffect(() => {
    if (minTime > 0 && currentTime === 0) {
      setCurrentTime(minTime);
    }
  }, [minTime, currentTime]);

  // Playback Loop
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          // Advance time by real interval * playbackSpeed
          const nextTime = prev + 100 * playbackSpeed;
          if (nextTime >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return nextTime;
        });
      }, 100); // Trigger every 100ms
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, maxTime, playbackSpeed]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSliderChange = (value: number[]) => {
    setCurrentTime(value[0]);
    if (isPlaying) setIsPlaying(false); // Pause while scrubbing
  };

  // Determine current position for each participant based on slider time
  const getCurrentPositions = () => {
    const positions: { track: TelemetryData[]; currentPoint: TelemetryData }[] =
      [];

    Object.values(groupedData).forEach((track) => {
      // Find the last known point at or before the current time
      let matchedPoint = track[0];
      for (let i = 0; i < track.length; i++) {
        if (new Date(track[i].createdAt).getTime() <= currentTime) {
          matchedPoint = track[i];
        } else {
          break;
        }
      }

      if (matchedPoint) {
        positions.push({ track, currentPoint: matchedPoint });
      }
    });

    return positions;
  };

  const positions = getCurrentPositions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Race Route Replay</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='w-full h-[500px] bg-muted flex items-center justify-center rounded-lg'>
            <p className='text-muted-foreground animate-pulse'>
              Loading Telemetry Map...
            </p>
          </div>
        ) : telemetryPoints.length === 0 ? (
          <div className='w-full h-[500px] bg-muted flex items-center justify-center rounded-lg'>
            <p className='text-muted-foreground'>
              No GPS data available for this event yet.
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {defaultCenter && (
              <MapContainer
                center={defaultCenter}
                zoom={14}
                className='w-full h-[500px] rounded-lg z-0 border'
              >
                <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />

                {positions.map(({ track, currentPoint }, index) => {
                  const latLngs = track.map(
                    (t) => [t.gps.lat, t.gps.lon] as [number, number],
                  );

                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={track[0].registration._id}>
                      {/* Draw the full trail faded */}
                      <Polyline
                        positions={latLngs}
                        color={color}
                        weight={3}
                        opacity={0.3}
                      />

                      {/* Draw the runner's marker at the scrubbed time */}
                      <Marker
                        position={[currentPoint.gps.lat, currentPoint.gps.lon]}
                        icon={createCustomMarker(
                          color,
                          currentPoint.registration.user.name,
                        )}
                      />
                    </div>
                  );
                })}
              </MapContainer>
            )}

            <div className='flex items-center gap-4 p-4 border rounded-lg bg-card mt-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={togglePlay}
                disabled={currentTime >= maxTime}
              >
                {isPlaying ? (
                  <Pause className='w-4 h-4' />
                ) : (
                  <Play className='w-4 h-4' />
                )}
              </Button>

              <div className='flex items-center'>
                <Select
                  value={playbackSpeed.toString()}
                  onValueChange={(val) => setPlaybackSpeed(Number(val))}
                >
                  <SelectTrigger className='w-[110px]'>
                    <SelectValue placeholder='Speed' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>1x Speed</SelectItem>
                    <SelectItem value='5'>5x Speed</SelectItem>
                    <SelectItem value='10'>10x Speed</SelectItem>
                    <SelectItem value='30'>30x Speed</SelectItem>
                    <SelectItem value='60'>60x Speed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex-1 flex flex-col gap-2'>
                <Slider
                  min={minTime}
                  max={maxTime}
                  step={1000} // Step by 1 second intervals for smoothness
                  value={[currentTime]}
                  onValueChange={handleSliderChange}
                />
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>{new Date(minTime).toLocaleTimeString()}</span>
                  <span className='font-bold text-foreground text-sm'>
                    {new Date(currentTime).toLocaleTimeString()}
                  </span>
                  <span>{new Date(maxTime).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
