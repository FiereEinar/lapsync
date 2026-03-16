import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Radio, CheckCircle, Info } from 'lucide-react';
import { QUERY_KEYS } from '@/constants';
import axiosInstance from '@/api/axios';
import { Event } from '@/types/event';
import EventFullDetails from '@/components/EventFullDetails';
import RaceCategoryTable from '@/components/RaceCategoryTable';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
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

const getPinIcon = (type: string) => {
  const color = type === 'start' ? '#10b981' : type === 'finish' ? '#ef4444' : '#3b82f6';
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
  type: "start" | "finish" | "checkpoint";
  location: { lat: number; lng: number };
  order: number;
};

export default function ClientEventDetail() {
	const { id } = useParams();

	const { data: event } = useQuery({
		queryKey: [QUERY_KEYS.EVENT, id],
		queryFn: async (): Promise<Event> => {
			const { data } = await axiosInstance.get(`/event/${id}`);
			return data.data;
		},
	});

	const { data: checkpoints = [] } = useQuery({
		queryKey: ["checkpoints", id],
		queryFn: async (): Promise<Checkpoint[]> => {
			const { data } = await axiosInstance.get(`/race-checkpoint/event/${id}`);
			return data.data;
		},
		enabled: !!id,
	});

	const mapCenter: [number, number] = checkpoints.length > 0 
		? [checkpoints[0].location.lat, checkpoints[0].location.lng] 
		: [14.5995, 120.9842];

	const mockEvent = {
		id: id,
		name: 'City Marathon 2024',
		date: 'Jan 15, 2024',
		time: '6:00 AM',
		distance: '42.2 km',
		location: 'Downtown - City Hall Start',
		techRequired: 'RFID',
		organizer: 'Running Club',
		registrationStatus: 'approved',
		techAssignment: 'RFID Tag #12345',
		pickupLocation: 'City Hall - Equipment Desk',
		pickupTime: 'Jan 14, 2024 - 2:00 PM to 8:00 PM',
	};



	return (
		<div className='space-y-6 animate-appear'>
			{event && (
				<div>
					<EventFullDetails event={event} />
					<RaceCategoryTable categories={event.raceCategories} event={event} />
				</div>
			)}

			<div className='grid gap-6 md:grid-cols-2'>
				<Card className='border-border'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<CheckCircle className='w-5 h-5 text-teal-500' />
							Registration Status
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div>
							<Badge className='bg-teal-500/20 text-teal-700 dark:text-teal-300'>
								{mockEvent.registrationStatus}
							</Badge>
						</div>
						<div className='space-y-2'>
							<p className='text-sm font-medium'>Tech Assignment</p>
							<Badge variant='outline'>{mockEvent.techAssignment}</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className='border-border'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Radio className='w-5 h-5 text-primary' />
							Hardware Pickup
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div>
							<p className='text-sm font-medium mb-1'>Location</p>
							<p className='text-sm text-muted-foreground'>
								{mockEvent.pickupLocation}
							</p>
						</div>
						<div>
							<p className='text-sm font-medium mb-1'>Pickup Time</p>
							<p className='text-sm text-muted-foreground'>
								{mockEvent.pickupTime}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<MapPin className='w-5 h-5 text-primary' />
						Route & Checkpoints
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='w-full h-[300px] bg-muted rounded-lg flex items-center justify-center overflow-hidden border z-0 relative'>
						{checkpoints.length === 0 ? (
							<div className='text-center text-muted-foreground'>
								<MapPin className='w-12 h-12 mx-auto mb-2' />
								<p>Route map preview</p>
								<p className='text-sm'>Map will be available soon</p>
							</div>
						) : (
							<MapContainer
								center={mapCenter}
								zoom={14}
								className="w-full h-full z-0"
							>
								<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
								{checkpoints.map((cp) => (
									<Marker
										key={cp._id}
										position={[cp.location.lat, cp.location.lng]}
										icon={getPinIcon(cp.type)}
									>
										<Popup>
											<div className="font-bold text-sm">{cp.name}</div>
											<div className="text-xs capitalize text-muted-foreground">{cp.type}</div>
										</Popup>
									</Marker>
								))}
							</MapContainer>
						)}
					</div>

					<div className='space-y-2'>
						{checkpoints.map((checkpoint, index) => (
							<div
								key={checkpoint._id}
								className='flex items-center justify-between p-3 border border-border rounded-lg'
							>
								<div className='flex items-center gap-3'>
									<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
										${checkpoint.type === 'start' ? 'bg-emerald-500/10 text-emerald-600' : 
										checkpoint.type === 'finish' ? 'bg-red-500/10 text-red-600' : 
										'bg-blue-500/10 text-blue-600'}`}
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
										{checkpoint.location.lat.toFixed(4)}°, {checkpoint.location.lng.toFixed(4)}°
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card className='border-primary/50 bg-primary/5'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Info className='w-5 h-5 text-primary' />
						Event Instructions
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-2 text-sm'>
					<p>• Pick up your RFID tag from the equipment desk before race day</p>
					<p>• Attach the RFID tag securely to your running bib</p>
					<p>• Arrive at least 30 minutes before the start time</p>
					<p>• Warm up area available at City Hall Plaza</p>
					<p>• Water stations available at each checkpoint</p>
					<p>• Medical support stationed along the route</p>
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
