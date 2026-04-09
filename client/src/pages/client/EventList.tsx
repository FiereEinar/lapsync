import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import ClientEventCard from "@/components/cards/ClientEventCard";
import { Event } from "@/types/event";
import { QUERY_KEYS } from "@/constants";
import { useUserStore } from "@/stores/user";
import { Registration } from "@/types/registration";
import { Search, Calendar, CalendarCheck, Users } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useState, useMemo } from "react";

export default function ClientEventList() {
  const { user } = useUserStore((state) => state);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: [QUERY_KEYS.EVENT],
    queryFn: async (): Promise<Event[]> => {
      const { data } = await axiosInstance.get("/event");
      return data.data;
    },
  });

  const { data: userRegistrations } = useQuery({
    queryKey: [QUERY_KEYS.REGISTRATIONS, user._id],
    queryFn: async (): Promise<Registration[]> => {
      const { data } = await axiosInstance.get(`/registration`, {
        params: { user: user._id },
      });
      return data.data;
    },
  });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const activeEvents = events.filter((e) => e.status !== "finished");
    if (!searchTerm) return activeEvents;
    return activeEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.city.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [events, searchTerm]);

  const registeredCount =
    userRegistrations?.filter((r) => r.event.status !== "finished").length || 0;
  const upcomingCount =
    events?.filter((e) => e.status === "upcoming").length || 0;
  const totalSlots =
    events
      ?.filter((e) => e.status !== "finished")
      .reduce((sum, ev) => {
        return (
          sum +
          ev.raceCategories.reduce(
            (s, cat) => s + (cat.slots - cat.registeredCount),
            0,
          )
        );
      }, 0) || 0;

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative'>
          <p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
            Events
          </p>
          <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>
            Available Events
          </h1>
          <p className='text-muted-foreground mt-1.5 text-sm'>
            Register for upcoming running events
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard
          title='My Registrations'
          value={registeredCount}
          subtitle='Events registered for'
          icon={CalendarCheck}
          accentColor='teal'
        />
        <StatCard
          title='Upcoming Events'
          value={upcomingCount}
          subtitle='Open for registration'
          icon={Calendar}
          accentColor='green'
        />
        <StatCard
          title='Spots Available'
          value={totalSlots}
          subtitle='Across all events'
          icon={Users}
          accentColor='purple'
        />
      </div>

      {/* Search */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <Input
          placeholder='Search events by name or city...'
          className='pl-9'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Event Cards */}
      <div className='grid gap-4'>
        {eventsLoading && (
          <div className='text-center py-12'>
            <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
            <p className='text-muted-foreground text-sm'>Loading events...</p>
          </div>
        )}
        {!eventsLoading && filteredEvents.length === 0 && (
          <div className='text-center py-12'>
            <Calendar className='w-10 h-10 text-muted-foreground/50 mx-auto mb-3' />
            <p className='text-muted-foreground text-sm'>No events found</p>
          </div>
        )}
        {filteredEvents.map((event) => (
          <ClientEventCard
            key={event._id}
            event={event}
            userRegistrations={userRegistrations}
          />
        ))}
      </div>
    </div>
  );
}
