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
            <Marker position={position} />
            <Polyline positions={path} />
          </MapContainer>
        )}
      </CardContent>
    </Card>
	);
};
