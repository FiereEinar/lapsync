import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Radio,
  Zap,
  ChevronRight,
  Trophy,
  Cpu,
  Activity,
  CalendarCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { Event } from "@/types/event";
import { Registration } from "@/types/registration";
import { QUERY_KEYS } from "@/constants";
import { useUserStore } from "@/stores/user";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";

export default function ClientHome() {
  const { user } = useUserStore((state) => state);

  const { data: events = [] } = useQuery({
    queryKey: [QUERY_KEYS.EVENT],
    queryFn: async (): Promise<Event[]> => {
      const { data } = await axiosInstance.get("/event");
      return data.data;
    },
  });

  const { data: userRegistrations = [] } = useQuery({
    queryKey: [QUERY_KEYS.REGISTRATIONS, user?._id],
    queryFn: async (): Promise<Registration[]> => {
      const { data } = await axiosInstance.get(`/registration`, {
        params: { user: user?._id },
      });
      return Array.isArray(data.data) ? data.data : [];
    },
    enabled: !!user?._id,
  });

  const registeredCount = userRegistrations.length;
  const activeRegistrations = userRegistrations.filter(
    (r) => r.event?.status === "active"
  );
  const upcomingRegistrations = userRegistrations.filter(
    (r) => r.event?.status === "upcoming"
  );

  const upcomingEvents = events
    .filter((e) => e.status === "upcoming")
    .slice(0, 3);

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative'>
          <p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
            Home
          </p>
          <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
          </h1>
          <p className='text-muted-foreground mt-1.5 text-sm'>
            Track your events and performance
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        {/* Registered Events */}
        <Card className='group relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity' />
          <CardContent className='p-5 relative'>
            <div className='flex items-start justify-between'>
              <div className='space-y-1.5'>
                <p className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                  Registered Events
                </p>
                <p className='text-3xl font-extrabold text-foreground tracking-tight'>
                  {registeredCount}
                </p>
                <p className='text-xs text-muted-foreground font-medium'>
                  {activeRegistrations.length} active, {upcomingRegistrations.length} upcoming
                </p>
              </div>
              <div className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform'>
                <CalendarCheck className='h-5 w-5 text-primary' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Events */}
        <Card className='group relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity' />
          <CardContent className='p-5 relative'>
            <div className='flex items-start justify-between'>
              <div className='space-y-1.5'>
                <p className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                  Available Events
                </p>
                <p className='text-3xl font-extrabold text-foreground tracking-tight'>
                  {events.length}
                </p>
                <p className='text-xs text-muted-foreground font-medium'>
                  {upcomingEvents.length} upcoming
                </p>
              </div>
              <div className='w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform'>
                <Calendar className='h-5 w-5 text-emerald-500' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Now */}
        <Card className='group relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity' />
          <CardContent className='p-5 relative'>
            <div className='flex items-start justify-between'>
              <div className='space-y-1.5'>
                <p className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                  Active Now
                </p>
                <p className='text-3xl font-extrabold text-foreground tracking-tight'>
                  {activeRegistrations.length}
                </p>
                <p className='text-xs text-muted-foreground font-medium'>
                  Events you're racing in
                </p>
              </div>
              <div className='w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform'>
                <Zap className='h-5 w-5 text-amber-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Registrations */}
      {userRegistrations.length > 0 && (
        <Card>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Trophy className='w-4 h-4 text-primary' />
                </div>
                <CardTitle>My Registrations</CardTitle>
              </div>
              <Button
                asChild
                variant='ghost'
                size='sm'
                className='text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-full px-4'
              >
                <Link to='/client/events'>
                  Browse All
                  <ChevronRight className='w-3.5 h-3.5' />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {userRegistrations.slice(0, 3).map((reg) => {
              const event = reg.event;
              if (!event) return null;
              const eventDate = new Date(event.date);
              return (
                <div
                  key={reg._id}
                  className='flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 group'
                >
                  {/* Date Badge */}
                  <div className='w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0'>
                    <span className='text-lg font-extrabold text-primary leading-none'>
                      {format(eventDate, "d")}
                    </span>
                    <span className='text-[10px] font-bold text-primary uppercase tracking-wider'>
                      {format(eventDate, "MMM")}
                    </span>
                  </div>
                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-semibold group-hover:text-primary transition-colors truncate'>
                      {event.name}
                    </h4>
                    <div className='flex items-center gap-3 text-xs text-muted-foreground mt-1'>
                      <span className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        {format(eventDate, "MMM dd, yyyy")}
                      </span>
                      {reg.raceCategory && (
                        <span className='flex items-center gap-1'>
                          <Activity className='w-3 h-3' />
                          {reg.raceCategory.name}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Status */}
                  <div className='flex items-center gap-2.5 flex-shrink-0'>
                    <StatusBadge status={reg.status} />
                    <Button
                      asChild
                      variant='ghost'
                      size='sm'
                      className='rounded-lg hover:bg-primary/10 text-primary'
                    >
                      <Link to={`/client/events/${event._id}`}>Details</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                <Calendar className='w-4 h-4 text-primary' />
              </div>
              <CardTitle>Upcoming Events</CardTitle>
            </div>
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-full px-4'
            >
              <Link to='/client/events'>
                Browse All
                <ChevronRight className='w-3.5 h-3.5' />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {upcomingEvents.length === 0 ? (
            <div className='text-center py-8'>
              <Calendar className='w-10 h-10 text-muted-foreground/50 mx-auto mb-3' />
              <p className='text-muted-foreground text-sm'>
                No upcoming events at the moment
              </p>
            </div>
          ) : (
            upcomingEvents.map((event) => {
              const eventDate = new Date(event.date);
              const spotsRemaining = event.raceCategories.reduce(
                (acc, cat) => acc + (cat.slots - cat.registeredCount),
                0
              );
              return (
                <div
                  key={event._id}
                  className='flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 group'
                >
                  <div className='w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0'>
                    <span className='text-lg font-extrabold text-primary leading-none'>
                      {format(eventDate, "d")}
                    </span>
                    <span className='text-[10px] font-bold text-primary uppercase tracking-wider'>
                      {format(eventDate, "MMM")}
                    </span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-semibold group-hover:text-primary transition-colors truncate'>
                      {event.name}
                    </h4>
                    <div className='flex items-center gap-3 text-xs text-muted-foreground mt-1'>
                      <span className='flex items-center gap-1'>
                        <MapPin className='w-3 h-3' />
                        {event.location.city}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {spotsRemaining} spots left
                      </span>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant='ghost'
                    size='sm'
                    className='rounded-lg hover:bg-primary/10 text-primary gap-1 flex-shrink-0'
                  >
                    <Link to={`/client/events/${event._id}`}>
                      View
                      <ChevronRight className='w-3.5 h-3.5' />
                    </Link>
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className='flex gap-4'>
        <Button
          asChild
          className='flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20'
        >
          <Link to='/client/events'>
            <Calendar className='w-4 h-4 mr-2' />
            Browse Events
          </Link>
        </Button>
        <Button
          asChild
          variant='outline'
          className='flex-1 h-12 rounded-xl hover:bg-muted/50'
        >
          <Link to='/client/profile'>My Profile</Link>
        </Button>
      </div>
    </div>
  );
}
