import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { getSocket } from '@/services/socket';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

const getPinIcon = () => {
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); width: 24px; height: 36px; position: absolute; left: 12px; top: 36px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

export default function MapLive() {
	const [position, setPosition] = useState<[number, number] | null>(null);
	const [path, setPath] = useState<[number, number][]>([]);

	useEffect(() => {
		const socket = getSocket('race');

		socket.on('gpsUpdate', (gps) => {
			const coords: [number, number] = [gps.lat, gps.lon];
			setPosition(coords);
			setPath((prev) => [...prev, coords]);
		});

		return () => {
			socket.off('gpsUpdate');
		};
	}, []);

	return (
    <Card>
      <CardHeader>
        <CardTitle>Live Race View</CardTitle>
      </CardHeader>
      <CardContent>
        {!position ? (
          <div className='w-full h-[500px] bg-muted flex items-center justify-center rounded-lg'>
            <p className='text-muted-foreground animate-pulse'>
              Waiting for live GPS signal...
            </p>
          </div>
        ) : (
          <MapContainer
            center={position}
            zoom={15}
            className='w-full h-[500px] rounded-lg z-0 border'
          >
            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
            <Marker position={position} icon={getPinIcon()} />
            <Polyline positions={path} />
          </MapContainer>
        )}
      </CardContent>
    </Card>
	);
};
