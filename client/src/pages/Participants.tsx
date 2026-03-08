import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Filter, Download, UserPlus } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Registration } from '@/types/registration';
import { QUERY_KEYS } from '@/constants';
import { useState, useMemo } from 'react';
import { useUserStore } from '@/stores/user';
import _ from 'lodash';
import ParticipantActionsDropDown from '@/components/buttons/ParticipantActionsDropDown';

export default function Participants() {
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState('');
	const eventID = searchParams.get('eventID');
	const { user } = useUserStore((state) => state);
	const isAdmin = user?.role === 'admin';

	const { data: registrations = [], isLoading } = useQuery({
		queryKey: [QUERY_KEYS.REGISTRATIONS, eventID],
		queryFn: async (): Promise<Registration[]> => {
			const params = new URLSearchParams();
			if (eventID) {
				params.append('eventID', eventID);
			}
			const { data } = await axiosInstance.get(
				`/registration?${params.toString()}`,
			);
			return Array.isArray(data.data) ? data.data : [];
		},
	});

	const filteredParticipants = useMemo(() => {
		return registrations.filter(
			(reg) =>
				reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [registrations, searchTerm]);

	return (
		<div className='space-y-6 animate-appear'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground mb-2'>
						Participants
					</h1>
					<p className='text-muted-foreground'>Manage all event participants</p>
				</div>
				{isAdmin && (
					<div className='flex gap-2'>
						<Button variant='outline' className='gap-2'>
							<Download className='w-4 h-4' />
							Export
						</Button>
						<Button className='gap-2'>
							<UserPlus className='w-4 h-4' />
							Add Participant
						</Button>
					</div>
				)}
			</div>

			<Card>
				<CardContent className='p-6'>
					<div className='flex flex-col sm:flex-row gap-4 mb-6 flex-wrap'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
							<Input
								placeholder='Search by name, email, bib number...'
								className='pl-9'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						{isAdmin && (
							<Button variant='outline' className='gap-2'>
								<Filter className='w-4 h-4' />
								Filters
							</Button>
						)}
					</div>

					<div className='rounded-lg border border-border overflow-x-hidden overflow-y-auto'>
						<Table>
							<TableHeader>
								<TableRow className='bg-muted/50'>
									<TableHead>Bib No.</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Event</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Shirt Size</TableHead>
									<TableHead>Status</TableHead>
									{isAdmin && (
										<TableHead className='text-right'>Actions</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell
											colSpan={isAdmin ? 8 : 7}
											className='text-center text-muted-foreground py-8'
										>
											Loading participants...
										</TableCell>
									</TableRow>
								) : filteredParticipants.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={isAdmin ? 8 : 7}
											className='text-center text-muted-foreground py-8'
										>
											No participants found
										</TableCell>
									</TableRow>
								) : (
									filteredParticipants.map((registration) => (
										<TableRow
											key={registration._id}
											className='hover:bg-muted/30'
										>
											<TableCell className='font-medium'>
												{registration.bibNumber || '--'}
											</TableCell>
											<TableCell className='font-medium text-foreground'>
												{_.startCase(registration.user.name)}
											</TableCell>
											<TableCell className='text-muted-foreground'>
												{registration.user.email}
											</TableCell>
											<TableCell className='text-muted-foreground'>
												{registration.user.phone || '--'}
											</TableCell>
											<TableCell className='text-muted-foreground hover:underline'>
												<Link to={`/events/${registration.event._id}`}>
													{registration.event.name}
												</Link>
											</TableCell>
											<TableCell className='text-muted-foreground hover:underline'>
												<Link to={`/events/${registration.event._id}`}>
													{registration.raceCategory?.name || '--'}
												</Link>
											</TableCell>
											<TableCell className='text-muted-foreground'>
												{registration.shirtSize || '--'}
											</TableCell>
											<TableCell>
												<StatusBadge status={registration.status} />
											</TableCell>
											{isAdmin && (
												<TableCell className='text-right'>
													<ParticipantActionsDropDown
														registration={registration}
													/>
												</TableCell>
											)}
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
