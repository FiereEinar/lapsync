import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import ClientEventCard from '@/components/cards/ClientEventCard';
import { Registration } from '@/types/registration';
import { QUERY_KEYS } from '@/constants';
import { useUserStore } from '@/stores/user';
import { Trophy, CheckCircle, Flag, CalendarCheck, Clock } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { useMemo } from 'react';

export default function CompletedEvents() {
  const { user } = useUserStore((state) => state);

  const { data: userRegistrations, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REGISTRATIONS, user._id],
    queryFn: async (): Promise<Registration[]> => {
      const { data } = await axiosInstance.get(`/registration`, {
        params: { user: user._id },
      });
      return data.data;
    },
  });

  const completedRegistrations = useMemo(() => {
    if (!userRegistrations) return [];
    return userRegistrations.filter(r => r.event.status === 'finished');
  }, [userRegistrations]);

  const completedEventsCount = completedRegistrations.length;
  // Calculate total distance ran across completed events (if available in registration's category)
  const totalDistanceKm = completedRegistrations.reduce((sum, r) => {
    return sum + (r.raceCategory?.distanceKm || 0);
  }, 0);

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-transparent border border-indigo-500/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <p className='text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5'>
              <CheckCircle className="w-3.5 h-3.5" />
              History
            </p>
            <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>
              Completed Events
            </h1>
            <p className='text-muted-foreground mt-1.5 text-sm'>
              Review your past races, reports, and leaderboards.
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-indigo-500/10 items-center justify-center border border-indigo-500/20 shadow-sm">
            <Trophy className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <StatCard
          title='Races Finished'
          value={completedEventsCount}
          subtitle='Successfully completed'
          icon={Flag}
          accentColor='indigo'
        />
        <StatCard
          title='Total Distance'
          value={`${totalDistanceKm} km`}
          subtitle='Distance covered'
          icon={Clock}
          accentColor='teal'
        />
      </div>

      {/* Event Cards */}
      <div className='grid gap-4 mt-6'>
        {isLoading && (
          <div className='text-center py-12'>
            <div className='w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3' />
            <p className='text-muted-foreground text-sm'>Loading history...</p>
          </div>
        )}
        {!isLoading && completedRegistrations.length === 0 && (
          <div className='text-center py-16 border border-dashed rounded-2xl bg-muted/10'>
            <Trophy className='w-10 h-10 text-muted-foreground/30 mx-auto mb-3' />
            <p className='text-foreground font-semibold'>No completed events yet</p>
            <p className='text-muted-foreground text-sm'>
              Join an upcoming event and finish a race to see your history here!
            </p>
          </div>
        )}
        {!isLoading && completedRegistrations.map((reg) => (
          <ClientEventCard
            key={reg.event._id}
            event={reg.event}
            userRegistrations={userRegistrations || []}
            linkPrefix="/client/completed"
          />
        ))}
      </div>
    </div>
  );
}
