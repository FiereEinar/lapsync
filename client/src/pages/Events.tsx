import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, Calendar, Plus } from 'lucide-react';
import EventCard from '@/components/cards/EventCard';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Event } from '@/types/event';
import { QUERY_KEYS } from '@/constants';
import { CreateEventDialog } from '@/components/modals/CreateEventModal';
import { StatCard } from '@/components/StatCard';
import { Users, TrendingUp, CalendarCheck } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Events() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EVENT],
    queryFn: async (): Promise<Event[]> => {
      const { data } = await axiosInstance.get('/event');
      return data.data;
    },
  });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!searchTerm) return events;
    return events.filter(
      (event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const totalParticipants = events?.reduce((sum, ev) => {
    return sum + ev.raceCategories.reduce((s, cat) => s + cat.registeredCount, 0);
  }, 0) || 0;

  const activeEvents = events?.filter(
    (ev) => ev.status === 'active'
  ).length || 0;

  const upcomingEvents = events?.filter(
    (ev) => ev.status === 'upcoming'
  ).length || 0;

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>Events</p>
            <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>
              Manage Events
            </h1>
            <p className='text-muted-foreground mt-1.5 text-sm'>
              Create, organize, and track all your race events
            </p>
          </div>
          <CreateEventDialog />
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard
          title='Total Events'
          value={events?.length || 0}
          subtitle={`${activeEvents} active, ${upcomingEvents} upcoming`}
          icon={Calendar}
          accentColor='teal'
        />
        <StatCard
          title='Participants'
          value={totalParticipants}
          subtitle='Across all events'
          icon={Users}
          accentColor='green'
        />
        <StatCard
          title='Active Now'
          value={activeEvents}
          subtitle='Events currently running'
          icon={CalendarCheck}
          accentColor='purple'
        />
      </div>

      {/* Events List */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Search by event name or city...'
                className='pl-9'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant='outline' className='gap-2'>
              <Filter className='w-4 h-4' />
              Filters
            </Button>
          </div>

          <div className='space-y-3'>
            {isLoading && (
              <div className='text-center py-12'>
                <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                <p className='text-muted-foreground text-sm'>Loading events...</p>
              </div>
            )}
            {!isLoading && filteredEvents.length === 0 && (
              <div className='text-center py-12'>
                <Calendar className='w-10 h-10 text-muted-foreground/50 mx-auto mb-3' />
                <p className='text-muted-foreground text-sm'>No events found</p>
              </div>
            )}
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
