import { StatusBadge } from '@/components/StatusBadge';
import { Calendar, MapPin, Users, MoreVertical, Activity, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event } from '@/types/event';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axiosInstance from '@/api/axios';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '../ConfirmDialog';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';
import { EditEventDialog } from '../modals/EditEventModal';
import { useState } from 'react';

type EventCardProps = {
  event: Event;
};

export default function EventCard({ event }: EventCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const fillPercent = totalSlots > 0 ? Math.round((totalRegistered / totalSlots) * 100) : 0;

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/event/${event._id}`);

      toast({
        title: 'Event deleted',
        description: 'Your event has been deleted successfully.',
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENT] });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'An error occurred while deleting the event.',
      });
    }
  };

  const eventDate = new Date(event.date);
  const dateDay = format(eventDate, 'd');
  const dateMonth = format(eventDate, 'MMM');

  return (
    <div className='flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 gap-4 group'>
      {/* Date Badge */}
      <div className='flex items-center gap-4 flex-1 min-w-0'>
        <div className='w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0'>
          <span className='text-lg font-extrabold text-primary leading-none'>{dateDay}</span>
          <span className='text-[10px] font-bold text-primary uppercase tracking-wider'>{dateMonth}</span>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='font-semibold text-foreground group-hover:text-primary transition-colors truncate'>{event.name}</h3>
            <StatusBadge status={event.status} />
          </div>
          <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <Calendar className='w-3 h-3' />
              {format(eventDate, 'MMM dd, yyyy')}
            </span>
            <span className='flex items-center gap-1'>
              <MapPin className='w-3 h-3' />
              {event.location.city}, {event.location.venue}
            </span>
            <span className='flex items-center gap-1'>
              <Users className='w-3 h-3' />
              {totalRegistered}/{totalSlots}
            </span>
            <span className='flex items-center gap-1'>
              <Activity className='w-3 h-3' />
              <span className='font-medium text-primary'>{distanceLabel}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className='flex items-center gap-2 flex-shrink-0'>
        {/* Fill bar */}
        <div className='hidden md:flex items-center gap-2 mr-2'>
          <div className='w-20 h-1.5 bg-muted rounded-full overflow-hidden'>
            <div
              className='h-full bg-primary rounded-full transition-all'
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <span className='text-[10px] text-muted-foreground font-semibold w-8'>{fillPercent}%</span>
        </div>

        <Button
          variant='outline'
          size='sm'
          className='rounded-lg hover:bg-primary/10 hover:text-primary gap-1'
          onClick={() => navigate(`/events/${event._id}`)}
        >
          Details
          <ChevronRight className='w-3.5 h-3.5' />
        </Button>

        <EditEventDialog
          event={event}
          open={editOpen}
          onOpenChange={setEditOpen}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='rounded-lg'>
              <MoreVertical className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end'>
            {event.status === 'upcoming' && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setEditOpen(true);
                }}
              >
                <button className='w-full text-start'>Edit</button>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => navigate(`/participants?eventID=${event._id}`)}
            >
              Manage Participants
            </DropdownMenuItem>
            <DropdownMenuItem>View Results</DropdownMenuItem>
            <DropdownMenuItem className='text-destructive'>
              <ConfirmDialog
                onConfirm={handleDelete}
                trigger={<button>Delete Event</button>}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
