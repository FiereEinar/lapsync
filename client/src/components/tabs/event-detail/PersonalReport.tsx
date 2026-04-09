import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Event } from '@/types/event';
import { Registration } from '@/types/registration';
import { useUserStore } from '@/stores/user';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Heart, AlertTriangle, TrendingUp, Calendar, Trophy } from 'lucide-react';

export default function PersonalReport({ event }: { event: Event }) {
  const { user } = useUserStore();

  const { data: userRegistrations = [] } = useQuery({
    queryKey: ['registrations', event._id, user._id],
    queryFn: async (): Promise<Registration[]> => {
      const { data } = await axiosInstance.get(
        `/registration?eventID=${event._id}&userID=${user._id}`,
      );
      return data.data;
    },
    enabled: !!event._id && !!user._id,
  });

  const registration = userRegistrations[0];

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['registrationAnalytics', registration?._id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/telemetry/analytics/registration/${registration._id}`,
      );
      return data.data; // Note: data.data from CustomResponse
    },
    enabled: !!registration?._id,
  });

  if (!registration) {
    return (
      <div className='text-center py-12 p-6 rounded-2xl border border-dashed text-muted-foreground'>
        You are not registered for this event.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='text-center py-12'>
        <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
        <p className='text-muted-foreground text-sm'>Loading your medical report...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className='text-center py-12 p-6 rounded-2xl border border-dashed text-muted-foreground'>
        No analytics data available. Connect your device during the race.
      </div>
    );
  }

  const { heartRate, semg, alerts = [] } = analytics;

  return (
    <div className='space-y-6 animate-appear'>
      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
              <Activity className='w-4 h-4 text-primary' />
            </div>
            <div>
              <CardTitle>Medical Performance Report</CardTitle>
              <CardDescription>Your personalized race analytics and metrics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Heart Rate Block */}
            <div className='p-5 rounded-xl bg-muted/30 space-y-4 border border-border/50'>
              <h5 className='font-semibold flex items-center gap-2 text-foreground'>
                <Heart className='w-4 h-4 text-red-500' />
                Heart Rate Analysis
              </h5>
              <div className='grid grid-cols-3 gap-2'>
                <div className='text-center bg-background rounded-lg p-3 border border-border/50 shadow-sm'>
                  <p className='text-xl font-bold'>{heartRate.min}</p>
                  <p className='text-[10px] text-muted-foreground uppercase tracking-wider mt-1'>Min BPM</p>
                </div>
                <div className='text-center bg-background rounded-lg p-3 border border-primary/20 shadow-sm'>
                  <p className='text-xl font-bold text-primary'>{heartRate.avg}</p>
                  <p className='text-[10px] text-muted-foreground uppercase tracking-wider mt-1'>Avg BPM</p>
                </div>
                <div className='text-center bg-background rounded-lg p-3 border border-border/50 shadow-sm'>
                  <p className='text-xl font-bold'>{heartRate.max}</p>
                  <p className='text-[10px] text-muted-foreground uppercase tracking-wider mt-1'>Max BPM</p>
                </div>
              </div>
              
              <div className='space-y-2 pt-2'>
                <p className='text-xs font-medium text-muted-foreground'>Time in HR Zones</p>
                <div className='flex gap-1'>
                  {Object.entries(heartRate.zones || {}).map(([zone, percent]: [string, any]) => (
                    <div key={zone} className='flex-1 group relative'>
                      <div className='h-3 bg-primary/10 rounded-full overflow-hidden'>
                        <div className='h-full bg-primary/80 transition-all rounded-full' style={{ width: `${percent}%` }} />
                      </div>
                      <p className='text-[10px] text-center mt-1.5 text-muted-foreground font-medium'>
                        {zone.toUpperCase()}
                        <span className="block text-[9px] opacity-70">{percent}%</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* sEMG Block */}
            <div className='p-5 rounded-xl bg-muted/30 space-y-4 border border-border/50'>
              <h5 className='font-semibold flex items-center gap-2 text-foreground'>
                <Activity className='w-4 h-4 text-emerald-500' />
                Muscle Fatigue (sEMG)
              </h5>
              <div className='space-y-3'>
                <div className='flex justify-between items-center text-sm p-2 bg-background rounded-lg border border-border/50 shadow-sm'>
                  <span className='text-muted-foreground font-medium'>Classification Level</span>
                  <Badge className={
                    semg.fatigueLevel === 'Low'
                      ? 'bg-emerald-500/10 text-emerald-600 border-0'
                      : semg.fatigueLevel === 'Moderate'
                        ? 'bg-amber-500/10 text-amber-600 border-0'
                        : 'bg-destructive/10 text-destructive border-0'
                  }>{semg.fatigueLevel}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className='p-3 bg-background rounded-lg border border-border/50 shadow-sm'>
                    <div className='flex justify-between text-sm items-center'>
                      <span className='text-muted-foreground text-xs'>Average</span>
                      <span className='font-bold text-lg'>{semg.avgFatigue}%</span>
                    </div>
                  </div>
                  <div className='p-3 bg-background rounded-lg border border-border/50 shadow-sm'>
                    <div className='flex justify-between text-sm items-center'>
                      <span className='text-muted-foreground text-xs'>Peak Load</span>
                      <span className='font-bold text-lg'>{semg.peakFatigue}%</span>
                    </div>
                  </div>
                </div>

                <div className='pt-2'>
                  <div className='flex justify-between text-xs mb-1.5'>
                    <span className='text-muted-foreground'>Fatigue Tracking</span>
                    <span className='font-semibold flex items-center gap-1 text-primary'>
                      <TrendingUp className='w-3 h-3' />
                      {semg.trend}
                    </span>
                  </div>
                  <div className='w-full h-2 bg-muted rounded-full overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all ${
                        semg.fatigueLevel === 'Low' ? 'bg-emerald-500'
                          : semg.fatigueLevel === 'Moderate' ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${semg.peakFatigue}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Timeline */}
          {alerts.length > 0 ? (
            <div className='mt-6 pt-6 border-t border-border'>
              <h5 className='font-semibold flex items-center gap-2 mb-4'>
                <AlertTriangle className='w-4 h-4 text-amber-500' />
                Medical Alerts & Warnings
              </h5>
              <div className='space-y-3'>
                {alerts.map((alert: any, index: number) => (
                  <div key={index} className='flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10'>
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0 shadow-sm border border-destructive/20 text-destructive">
                      <AlertTriangle className='w-5 h-5' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <Badge className={`border-0 text-[10px] font-bold tracking-wide uppercase ${
                          alert.severity === 'Active' ? 'bg-destructive/15 text-destructive' : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {alert.severity}
                        </Badge>
                        <span className='text-xs text-muted-foreground font-medium flex items-center gap-1'>
                          <Calendar className="w-3 h-3" />
                          {alert.time}
                        </span>
                      </div>
                      <p className='text-sm font-bold text-foreground'>{alert.type.toUpperCase()}</p>
                      <p className='text-sm text-muted-foreground mt-0.5'>{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className='mt-6 pt-6 border-t border-border'>
               <div className='flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-600'>
                 <Trophy className="w-5 h-5 text-emerald-500" />
                 <div>
                   <p className="font-semibold text-sm">Clean Record!</p>
                   <p className="text-xs opacity-80">No significant physiological alerts were triggered during this event.</p>
                 </div>
               </div>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
