import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  Plus,
  ChevronRight,
  Zap,
  Clock,
  Activity,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { Event } from "@/types/event";
import { QUERY_KEYS } from "@/constants";
import { format } from "date-fns";
import { useUserStore } from "@/stores/user";
import { Device } from "@/types/device";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUserStore((state) => state);

  const { data: events = [] } = useQuery({
    queryKey: [QUERY_KEYS.EVENT],
    queryFn: async (): Promise<Event[]> => {
      const { data } = await axiosInstance.get("/event");
      return data.data;
    },
  });

  const { data: devices = [] } = useQuery({
    queryKey: [QUERY_KEYS.DEVICES],
    queryFn: async (): Promise<Device[]> =>
      (await axiosInstance.get("/device")).data.data,
  });

  const totalParticipants = events.reduce((sum, ev) => {
    return (
      sum + ev.raceCategories.reduce((s, cat) => s + cat.registeredCount, 0)
    );
  }, 0);

  const activeEvents = events.filter((ev) => ev.status === "active").length;

  const completedEvents = events.filter(
    (ev) => ev.status === "finished",
  ).length;

  const completionRate =
    events.length > 0 ? Math.round((completedEvents / events.length) * 100) : 0;

  const latestEvents = events.slice(0, 3);

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative'>
          <p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
            Dashboard
          </p>
          <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
          </h1>
          <p className='text-muted-foreground mt-1.5 text-sm'>
            Here's an overview of your events and platform performance.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Participants'
          value={totalParticipants}
          subtitle='Across all events'
          icon={Users}
          accentColor='teal'
        />
        <StatCard
          title='Active Events'
          value={activeEvents}
          subtitle='Currently running'
          icon={Calendar}
          accentColor='green'
        />
        <StatCard
          title='Hardware Units'
          value={devices.length}
          subtitle={`${devices.filter((d) => d.registration !== null).length} assigned`}
          icon={Cpu}
          accentColor='purple'
        />
        <StatCard
          title='Completion Rate'
          value={`${completionRate}%`}
          subtitle={`${completedEvents} of ${events.length} events`}
          icon={TrendingUp}
          accentColor='amber'
        />
      </div>

      {/* Events + Quick Actions */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Upcoming Events — Takes 2 columns */}
        <Card className='lg:col-span-2'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Calendar className='w-4 h-4 text-primary' />
                </div>
                <CardTitle>Recent Events</CardTitle>
              </div>
              <Button
                asChild
                variant='ghost'
                size='sm'
                className='text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-full px-4'
              >
                <Link to='/events'>
                  View All
                  <ChevronRight className='w-3.5 h-3.5' />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {latestEvents.length === 0 ? (
                <div className='text-center py-8'>
                  <Calendar className='w-10 h-10 text-muted-foreground/50 mx-auto mb-3' />
                  <p className='text-muted-foreground text-sm'>
                    No events yet. Create your first event to get started.
                  </p>
                </div>
              ) : (
                latestEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const dateDay = format(eventDate, "d");
                  const dateMonth = format(eventDate, "MMM");
                  const participants = event.raceCategories.reduce(
                    (acc, cur) => acc + cur.registeredCount,
                    0,
                  );
                  const displayLocation = `${event.location.city}, ${event.location.venue}`;

                  return (
                    <div
                      key={event._id}
                      className='flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 group cursor-pointer'
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      {/* Date Badge */}
                      <div className='w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0'>
                        <span className='text-lg font-extrabold text-primary leading-none'>
                          {dateDay}
                        </span>
                        <span className='text-[10px] font-bold text-primary uppercase tracking-wider'>
                          {dateMonth}
                        </span>
                      </div>
                      {/* Info */}
                      <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-foreground group-hover:text-primary transition-colors truncate'>
                          {event.name}
                        </p>
                        <div className='flex items-center gap-3 text-xs text-muted-foreground mt-1'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            {format(eventDate, "MMM dd, yyyy")}
                          </span>
                          <span className='flex items-center gap-1'>
                            <MapPin className='w-3 h-3' />
                            {displayLocation}
                          </span>
                        </div>
                      </div>
                      {/* Participant Count */}
                      <div className='text-right flex-shrink-0'>
                        <p className='text-xl font-extrabold text-foreground'>
                          {participants}
                        </p>
                        <p className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold'>
                          Runners
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                <Zap className='w-4 h-4 text-primary' />
              </div>
              <CardTitle>Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button
              className='w-full justify-start gap-3 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20'
              size='lg'
              onClick={() => navigate("/events")}
            >
              <div className='w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center'>
                <Plus className='w-4 h-4' />
              </div>
              Create New Event
            </Button>
            <Button
              asChild
              variant='outline'
              className='w-full justify-start gap-3 h-12 rounded-xl hover:bg-muted/50'
              size='lg'
            >
              <Link to='/participants'>
                <div className='w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Users className='w-4 h-4 text-primary' />
                </div>
                Manage Participants
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              className='w-full justify-start gap-3 h-12 rounded-xl hover:bg-muted/50'
              size='lg'
            >
              <Link to='/devices'>
                <div className='w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                  <Cpu className='w-4 h-4 text-emerald-500' />
                </div>
                Manage Devices
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
