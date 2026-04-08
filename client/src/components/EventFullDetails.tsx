import { Event } from '@/types/event';
import { StatusBadge } from './StatusBadge';
import { Calendar, Flag, MapPin, Users } from 'lucide-react';
import BackButton from './buttons/BackButton';
import { format } from 'date-fns';
import { ClientEventActionButton } from './buttons/ClientEventActionButton';
import { useUserStore } from '@/stores/user';
import EventActionButton from './buttons/EventActionButton';
import { Badge } from './ui/badge';

type EventFullDetailsProps = {
	event: Event;
};

export default function EventFullDetails({ event }: EventFullDetailsProps) {
	const { user } = useUserStore((state) => state);

    const totalSlots = event.raceCategories.reduce((a, b) => a + b.slots, 0);
    const totalRegistered = event.raceCategories.reduce((a, b) => a + b.registeredCount, 0);
    const fillPercentage = totalSlots > 0 ? Math.round((totalRegistered / totalSlots) * 100) : 0;

	return (
		<div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8 animate-appear'>
			<div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
			<div className='relative space-y-6'>
				<div className='flex items-start justify-between gap-4'>
					<div className='flex flex-col gap-3'>
						<div className='flex items-center gap-2'>
							<BackButton />
							<StatusBadge status={event.status} />
                            {event.registration.isOpen ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-0 uppercase tracking-wider text-[10px]">Registration Open</Badge>
                            ) : (
                                <Badge className="bg-destructive/10 text-destructive border-0 uppercase tracking-wider text-[10px]">Registration Closed</Badge>
                            )}
						</div>
						<h1 className='text-3xl md:text-4xl font-extrabold text-foreground tracking-tight'>{event.name}</h1>
						{event.description && (
							<p className='text-muted-foreground max-w-3xl text-sm leading-relaxed'>{event.description}</p>
						)}
					</div>
					<div className="flex-shrink-0">
                        {user?.role === 'user' && <ClientEventActionButton event={event} />}
                        {user?.role === 'admin' && <EventActionButton event={event} />}
                    </div>
				</div>

				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50'>
					<div className='flex items-center gap-3'>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
						    <Calendar className='w-5 h-5 text-primary' />
                        </div>
						<div>
							<div className='font-bold text-foreground text-sm flex items-center gap-2'>
								{format(new Date(event.date), 'MMM dd, yyyy')}
							</div>
							{event.startTime && (
								<div className="text-xs text-muted-foreground mt-0.5">
									{event.startTime} {event.endTime && `– ${event.endTime}`}
								</div>
							)}
						</div>
					</div>

					<div className='flex items-center gap-3'>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
						    <MapPin className='w-5 h-5 text-primary' />
                        </div>
						<div>
							<div className='font-bold text-foreground text-sm truncate max-w-[120px]' title={event.location.venue}>
								{event.location.venue}
							</div>
							<div className="text-xs text-muted-foreground mt-0.5">
								{event.location.city}, {event.location.province}
							</div>
						</div>
					</div>

					<div className='flex items-center gap-3'>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
						    <Flag className='w-5 h-5 text-primary' />
                        </div>
						<div>
							<div className='font-bold text-foreground text-sm'>
								{event.raceCategories.map((c) => `${c.distanceKm}K`).join(', ')}
							</div>
							<div className="text-xs text-muted-foreground mt-0.5">Race Categories</div>
						</div>
					</div>

					<div className='space-y-1.5'>
                        <div className='flex justify-between text-xs font-bold text-muted-foreground mb-1 mt-1'>
                            <span className="uppercase tracking-wider">Capacity</span>
                            <span className="text-primary">{fillPercentage}%</span>
                        </div>
                        <div className='h-2.5 bg-background/50 backdrop-blur-sm rounded-full overflow-hidden border border-border/50'>
                            <div
                                className='h-full bg-gradient-to-r from-primary to-primary/80 rounded-full'
                                style={{ width: `${fillPercentage}%` }}
                            />
                        </div>
						<div className="text-[10px] text-muted-foreground text-right uppercase tracking-wider">{totalRegistered} / {totalSlots} filled</div>
                    </div>
				</div>
			</div>
		</div>
	);
}
