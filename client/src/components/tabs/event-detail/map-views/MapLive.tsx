import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { getSocket } from '@/services/socket';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import _ from 'lodash';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

const getPinIcon = (color: string) => {
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

interface RunnerData {
  registrationId: string;
  user: any;
  emergencyContact?: any;
  position: [number, number] | null;
  path: [number, number][];
  heartRate: number | null;
  emg: string | null;
  lastUpdate: Date;
}

export default function MapLive() {
  const [runners, setRunners] = useState<Record<string, RunnerData>>({});
  const [focusedRunnerId, setFocusedRunnerId] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket('race');

    socket.on('adminLiveUpdate', (update) => {
      const { registrationId, user, emergencyContact, gps, heartRate, emg } = update;
      
      setRunners((prev) => {
        const existing = prev[registrationId] || {
          registrationId,
          user,
          emergencyContact,
          position: null,
          path: [],
          heartRate: null,
          emg: null,
          lastUpdate: new Date(),
        };

        const newPos: [number, number] | null = gps ? [gps.lat, gps.lon] : existing.position;
        const newPath = gps && newPos ? [...existing.path, newPos] : existing.path;

        return {
          ...prev,
          [registrationId]: {
            ...existing,
            user: user || existing.user,
            emergencyContact: emergencyContact || existing.emergencyContact,
            position: newPos,
            path: newPath.slice(-50), // limit path history to avoid memory bloat
            heartRate: heartRate !== null ? heartRate : existing.heartRate,
            emg: emg !== null ? emg : existing.emg,
            lastUpdate: new Date(),
          }
        };
      });
    });

    return () => {
      socket.off('adminLiveUpdate');
    };
  }, []);

  const activeRunners = Object.values(runners).filter((r) => {
    // Only show runners that have updated in the last 15 minutes
    return new Date().getTime() - r.lastUpdate.getTime() < 15 * 60 * 1000;
  });

  const getMapCenter = (): [number, number] => {
    if (focusedRunnerId && runners[focusedRunnerId]?.position) {
      return runners[focusedRunnerId].position!;
    }
    const withPosition = activeRunners.filter((r) => r.position);
    if (withPosition.length > 0) {
      return withPosition[withPosition.length - 1].position!;
    }
    return [0, 0];
  };

  const center = getMapCenter();

	return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Live Race View</CardTitle>
        </CardHeader>
        <CardContent>
          {center[0] === 0 && center[1] === 0 ? (
            <div className='w-full h-[500px] bg-muted flex items-center justify-center rounded-lg'>
              <p className='text-muted-foreground animate-pulse'>
                Waiting for runners live signal...
              </p>
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={15}
              className='w-full h-[500px] rounded-lg z-0 border'
            >
              <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
              
              {activeRunners.filter(r => r.position).map((r) => {
                const isFocused = focusedRunnerId === r.registrationId;
                if (focusedRunnerId !== null && !isFocused) return null;

                return (
                  <div key={r.registrationId}>
                    <Marker position={r.position!} icon={getPinIcon(isFocused ? "#e11d48" : "#3b82f6")} />
                    <Polyline positions={r.path} color={isFocused ? "#e11d48" : "#3b82f6"} weight={isFocused ? 4 : 2} />
                  </div>
                )
              })}
            </MapContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Runners</CardTitle>
        </CardHeader>
        <CardContent>
          {activeRunners.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No active runners detected yet.</p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Runner</TableHead>
                    <TableHead>Heart Rate</TableHead>
                    <TableHead>EMG</TableHead>
                    <TableHead>Emergency Contact</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRunners.map((runner) => (
                    <TableRow 
                      key={runner.registrationId}
                      className={focusedRunnerId === runner.registrationId ? 'bg-primary/5' : ''}
                    >
                      <TableCell className="font-medium">
                        {_.startCase(runner.user?.name || "Unknown")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono ${runner.heartRate && runner.heartRate > 170 ? 'text-destructive font-bold' : ''}`}>
                            {runner.heartRate || '--'}
                          </span>
                          <span className="text-xs text-muted-foreground">bpm</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {runner.emg || '--'}
                      </TableCell>
                      <TableCell>
                        {runner.emergencyContact ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{runner.emergencyContact.name}</span>
                            <span className="text-xs text-muted-foreground">{runner.emergencyContact.phone}</span>
                          </div>
                        ) : '--'}
                      </TableCell>
                      <TableCell className="text-right">
                        <button 
                          className="text-primary hover:underline text-sm font-medium"
                          onClick={() => setFocusedRunnerId(
                            focusedRunnerId === runner.registrationId ? null : runner.registrationId
                          )}
                        >
                          {focusedRunnerId === runner.registrationId ? "Unfocus" : "View"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
	);
};
