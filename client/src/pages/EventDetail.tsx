import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Trophy, Activity, Tag } from 'lucide-react';
import Leaderboard from '@/components/tabs/event-detail/Leaderboard';
import RunnerStatus from '@/components/tabs/event-detail/RunnerStatus';
import MapTrack from '@/components/tabs/event-detail/MapTrack';
import Participants from '@/components/tabs/event-detail/Participants';
import PendingAssignment from '@/components/tabs/event-detail/PendingAssignment';
import { mockParticipants } from '@/types/test-data';
import { Participant } from '@/types/participant';
import EventFullDetails from '@/components/EventFullDetails';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Event } from '@/types/event';
import { QUERY_KEYS } from '@/constants';
import RaceCategoryTable from '@/components/RaceCategoryTable';

export default function EventDetail() {
	const { eventID } = useParams();

	const { data: eventDetail } = useQuery({
		queryKey: [QUERY_KEYS.EVENT, eventID],
		queryFn: async (): Promise<Event> => {
			const { data } = await axiosInstance.get(`/event/${eventID}`);
			return data.data;
		},
	});

	const [participants, setParticipants] =
		useState<Participant[]>(mockParticipants);
	const [selectedParticipant, setSelectedParticipant] =
		useState<Participant | null>(null);

	const pendingParticipants = participants.filter((p) => !p.isAssigned);

	return (
		<div className='space-y-6 animate-appear'>
			{eventDetail && <EventFullDetails event={eventDetail} />}
			{eventDetail && (
				<RaceCategoryTable
					categories={eventDetail.raceCategories}
					event={eventDetail}
				/>
			)}

			<Tabs defaultValue='participants' className='w-full'>
				<TabsList className='grid w-full grid-cols-5'>
					<TabsTrigger value='participants'>
						<Users className='w-4 h-4 mr-2' />
						Participants
					</TabsTrigger>
					<TabsTrigger value='pending'>
						<Tag className='w-4 h-4 mr-2' />
						Pending Assignments
						{pendingParticipants.length > 0 && (
							<Badge
								variant='destructive'
								className='ml-2 flex items-center justify-center size-5 shrink-0 rounded-full p-0 text-xs'
							>
								{participants.filter((p) => !p.isAssigned).length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value='map'>
						<MapPin className='w-4 h-4 mr-2' />
						Map Track
					</TabsTrigger>
					<TabsTrigger value='leaderboard'>
						<Trophy className='w-4 h-4 mr-2' />
						Leaderboard
					</TabsTrigger>
					<TabsTrigger value='status'>
						<Activity className='w-4 h-4 mr-2' />
						Runner Status
					</TabsTrigger>
				</TabsList>

				<TabsContent value='participants' className='space-y-4'>
					{eventDetail && <Participants event={eventDetail} />}
				</TabsContent>

				{/* Pending Assignments Tab */}
				<TabsContent value='pending' className='space-y-4'>
					<PendingAssignment
						participants={participants}
						setParticipants={setParticipants}
						selectedParticipant={selectedParticipant}
						setSelectedParticipant={setSelectedParticipant}
					/>
				</TabsContent>

				<TabsContent value='map' className='space-y-4'>
					<MapTrack />
				</TabsContent>

				<TabsContent value='leaderboard' className='space-y-4'>
					<Leaderboard />
				</TabsContent>

				<TabsContent value='status' className='space-y-4'>
					<RunnerStatus />
				</TabsContent>
			</Tabs>
		</div>
	);
}
