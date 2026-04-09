import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Activity, ActivityIcon, Eye } from 'lucide-react';
import { Event } from '@/types/event';
import { Registration } from '@/types/registration';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import PersonalReport from './PersonalReport';

interface RunnerStatusProps {
	event: Event;
	registrations: Registration[];
}

export default function RunnerStatus({ event, registrations }: RunnerStatusProps) {
	// Filter to only confirmed registrations usually taking part in run
	const confirmedRunners = registrations.filter(r => r.status === 'confirmed');

	return (
		<Card className='rounded-xl border border-border shadow-sm'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2 text-xl'>
					<div className='w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center'>
						<Activity className='w-5 h-5 text-red-500' />
					</div>
					Runner Medical & Telemetry Reports
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='rounded-xl border border-border overflow-hidden'>
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/30">
								<TableHead className="font-semibold">Category</TableHead>
								<TableHead className="font-semibold">Name</TableHead>
								<TableHead className="font-semibold">Emergency Contact</TableHead>
								<TableHead className="font-semibold">RFID Status</TableHead>
								<TableHead className="font-semibold text-right">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{confirmedRunners.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
										No confirmed runners found for this event.
									</TableCell>
								</TableRow>
							) : (
								confirmedRunners.map((runner) => (
									<TableRow key={runner._id} className="hover:bg-muted/30 transition-colors">
										<TableCell className='font-medium text-muted-foreground'>
											{runner.raceCategory?.name || 'N/A'}
										</TableCell>
										<TableCell className="font-semibold">{runner.user?.name}</TableCell>
										<TableCell>
											{runner.emergencyContact ? (
												<div className="flex flex-col text-sm">
													<span>{runner.emergencyContact.name}</span>
													<span className="text-muted-foreground text-xs">{runner.emergencyContact.phone}</span>
												</div>
											) : (
												<span className="text-muted-foreground text-xs italic">Not provided</span>
											)}
										</TableCell>
										<TableCell>
											{runner.rfidTag ? (
												<Badge className='bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 uppercase tracking-wider text-[10px]'>
													Assigned
												</Badge>
											) : (
												<Badge variant="outline" className='text-amber-600 border-amber-600/30 uppercase tracking-wider text-[10px]'>
													Pending
												</Badge>
											)}
										</TableCell>
										<TableCell className='text-right'>
											<Dialog>
												<DialogTrigger asChild>
													<Button variant="outline" size="sm" className="gap-2">
														<Eye className="w-4 h-4" />
														View Report
													</Button>
												</DialogTrigger>
												<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
													<PersonalReport event={event} registrationId={runner._id} />
												</DialogContent>
											</Dialog>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
