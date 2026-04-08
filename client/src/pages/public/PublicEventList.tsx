import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, Calendar, Users, Trophy } from "lucide-react";
import axiosInstance from "@/api/axios";
import { QUERY_KEYS } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";

export default function PublicEventList() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EVENT, "public"],
    queryFn: async (): Promise<Event[]> => {
      const { data } = await axiosInstance.get("/public/event");
      return Array.isArray(data.data) ? data.data : [];
    },
  });

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8 min-h-[calc(100vh-130px)]">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Live & Upcoming Events</h1>
        <p className="text-muted-foreground">Select an event to view live telemetry and race leaderboards.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse rounded-2xl shadow-sm border border-border">
              <div className="h-40 bg-muted/50 rounded-t-2xl" />
              <CardContent className="p-6 h-36 bg-card rounded-b-2xl" />
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border/50 shadow-sm">
          <Trophy className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold">No Public Events</h3>
          <p className="text-muted-foreground mt-2">There are currently no events configured for public viewing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isActive = event.status === "active";
            const locationStr = `${event.location?.venue ?? ''}, ${event.location?.city ?? ''}`;
            
            return (
              <Card key={event._id} className="rounded-2xl overflow-hidden hover:shadow-lg transition-shadow border border-border bg-card flex flex-col group">
                <div className="h-40 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 relative p-6 flex flex-col justify-between">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent group-hover:opacity-40 transition-opacity" />
                  <div className="relative z-10 flex justify-between items-start">
                    <Badge variant="secondary" className="backdrop-blur-sm bg-background/50 border border-border/50">
                      {event.raceCategories.length} Categories
                    </Badge>
                    {isActive && (
                      <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30 uppercase tracking-wider text-[10px] animate-pulse">
                        Live Now
                      </Badge>
                    )}
                  </div>
                  <div className="relative z-10">
                    <CardTitle className="text-xl font-bold truncate pr-4">{event.name}</CardTitle>
                  </div>
                </div>
                
                <CardContent className="p-6 flex flex-col justify-between flex-1 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="text-sm pt-1 truncate pr-2">
                        <p className="font-medium truncate">{locationStr}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="text-sm pt-1">
                        <p className="font-medium">{event.date ? format(new Date(event.date), "MMMM d, yyyy") : "--"}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link to={`/public/events/${event._id}`} className="w-full">
                    <Button variant={isActive ? "default" : "outline"} className="w-full rounded-xl gap-2 h-10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {isActive ? "Spectate Live" : "View Details"}
                      <Trophy className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
