import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { getSocket } from '@/services/socket';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import MapTrack from './tabs/event-detail/MapTrack';
import { createCustomMarker } from '@/lib/map-utils';
import { useUserStore } from '@/stores/user';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
	// iconRetinaUrl: RedDot,
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

type LiveMapProps = {
	eventId?: string;
};

export const LiveMap = ({ eventId }: LiveMapProps = {}) => {
	const [position, setPosition] = useState<[number, number] | null>(null);
	const [path, setPath] = useState<[number, number][]>([]);
	const [heartRate, setHeartRate] = useState<number | null>(null);
	const { user } = useUserStore();

	useEffect(() => {
		const socket = getSocket('race');

		socket.on('gpsUpdate', (gps) => {
			const coords: [number, number] = [gps.lat, gps.lon];
			setPosition(coords);
			setPath((prev) => [...prev, coords]);
		});

		socket.on('heartRateUpdate', (data: { heartRate: number }) => {
			setHeartRate(data.heartRate);
		});

		return () => {
			socket.off('gpsUpdate');
			socket.off('heartRateUpdate');
		};
	}, []);

	if (!position) return <MapTrack fallbackEventId={eventId} />;

	return (
		<MapContainer
			center={position}
			zoom={15}
			style={{ height: '400px', width: '100%' }}
		>
			<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
			<Marker 
				position={position} 
				icon={createCustomMarker('#3b82f6', user?.name || 'You', heartRate)}
			/>
			<Polyline positions={path} color="#3b82f6" weight={3} />
		</MapContainer>
	);
};
