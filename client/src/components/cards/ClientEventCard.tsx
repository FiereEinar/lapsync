import { Event } from '@/types/event';
import { Card, CardContent } from '../ui/card';
import { Calendar, MapPin, Users, Activity, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../StatusBadge';
import { format } from 'date-fns';
import { Registration } from '@/types/registration';
import { ClientEventActionButton } from '../buttons/ClientEventActionButton';

type ClientEventCardProps = {
  event: Event;
  userRegistrations: Registration[];
  linkPrefix?: string;
};

export default function ClientEventCard({
  event,
  userRegistrations,
  linkPrefix = '/client/events',
}: ClientEventCardProps) {
  const distances = event.raceCategories.map((c) => c.distanceKm);
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  const totalSlots = event.raceCategories.reduce(
    (sum, cat) => sum + cat.slots,
    0,
  );

  const totalRegistered = event.raceCategories.reduce(
    (sum, cat) => sum + cat.registeredCount,
    0,
  );

  const distanceLabel =
    minDistance === maxDistance
      ? `${minDistance} km`
      : `${minDistance}–${maxDistance} km`;

  const spotsRemaining = totalSlots - totalRegistered;
  const fillPercent = totalSlots > 0 ? Math.round((totalRegistered / totalSlots) * 100) : 0;

  const eventDate = new Date(event.date);
  const dateDay = format(eventDate, 'd');
  const dateMonth = format(eventDate, 'MMM');

  return (
    <Card className='group overflow-hidden'>
      <CardContent className='p-5'>
        <div className='flex items-start gap-4'>
          {/* Date Badge */}
          <div className='w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0'>
            <span className='text-lg font-extrabold text-primary leading-none'>{dateDay}</span>
            <span className='text-[10px] font-bold text-primary uppercase tracking-wider'>{dateMonth}</span>
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2 mb-2'>
              <div className='min-w-0'>
                <h3 className='font-bold text-foreground text-base group-hover:text-primary transition-colors truncate'>
                  {event.name}
                </h3>
                {event.description && (
                  <p className='text-xs text-muted-foreground mt-0.5 truncate'>
                    {event.description}
                  </p>
                )}
              </div>
              <StatusBadge status={event.status} />
            </div>

            {/* Info row */}
            <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3'>
              <span className='flex items-center gap-1'>
                <Calendar className='w-3 h-3' />
                {format(eventDate, 'MMM dd, yyyy')}
              </span>
              <span className='flex items-center gap-1'>
                <MapPin className='w-3 h-3' />
                {event.location.city}, {event.location.province}
              </span>
              <span className='flex items-center gap-1'>
                <Activity className='w-3 h-3' />
                <span className='font-medium text-primary'>{distanceLabel}</span>
              </span>
            </div>

            {/* Progress bar + Actions */}
            <div className='flex items-center justify-between pt-3 border-t border-border/50'>
              <div className='flex items-center gap-2.5'>
                <div className='flex items-center gap-1.5'>
                  <Users className='w-3 h-3 text-muted-foreground' />
                  <span className='text-xs text-muted-foreground font-medium'>
                    {spotsRemaining} spots left
                  </span>
                </div>
                <div className='w-16 h-1.5 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary rounded-full transition-all'
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
                <span className='text-[10px] text-muted-foreground font-semibold'>{fillPercent}%</span>
              </div>
              <div className='flex gap-2'>
                <Button asChild variant='ghost' size='sm' className='rounded-lg hover:bg-primary/10 text-primary gap-1'>
                  <Link to={`${linkPrefix}/${event._id}`}>
                    Details
                    <ChevronRight className='w-3.5 h-3.5' />
                  </Link>
                </Button>
                <ClientEventActionButton event={event} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
