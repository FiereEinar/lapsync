import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  Download,
  Activity,
  Heart,
  AlertTriangle,
  TrendingUp,
  FileText,
  BarChart3,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Event } from '@/types/event';
import { QUERY_KEYS } from '@/constants';
import { StatCard } from '@/components/StatCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState('');

  const { data: events = [] } = useQuery({
    queryKey: [QUERY_KEYS.EVENT],
    queryFn: async (): Promise<Event[]> => {
      const { data } = await axiosInstance.get('/event');
      return data.data;
    },
  });

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  // placeholder leaderboard data (will be replaced later with race-result API)
  const leaderboardData = {
    all: [
      { rank: 1, bibNumber: '001', name: 'John Doe', category: 'Full Marathon', time: '2:10:45', avgHR: 165, alerts: 0 },
      { rank: 2, bibNumber: '002', name: 'Jane Smith', category: 'Full Marathon', time: '2:12:20', avgHR: 162, alerts: 1 },
      { rank: 3, bibNumber: '042', name: 'Mike Wilson', category: 'Half Marathon', time: '1:05:30', avgHR: 170, alerts: 0 },
      { rank: 4, bibNumber: '003', name: 'Sarah Johnson', category: 'Full Marathon', time: '2:18:45', avgHR: 158, alerts: 2 },
      { rank: 5, bibNumber: '005', name: 'Tom Brown', category: '10K', time: '35:20', avgHR: 175, alerts: 0 },
    ],
  };

  const medicalProfiles = [
    {
      bibNumber: '001', name: 'John Doe', category: 'Full Marathon',
      heartRate: { min: 145, max: 185, avg: 165, zones: { z1: 15, z2: 25, z3: 35, z4: 20, z5: 5 } },
      semg: { fatigueLevel: 'Low', peakFatigue: 45, avgFatigue: 28, trend: 'Stable' },
      alerts: [],
    },
    {
      bibNumber: '002', name: 'Jane Smith', category: 'Full Marathon',
      heartRate: { min: 142, max: 182, avg: 162, zones: { z1: 18, z2: 28, z3: 32, z4: 18, z5: 4 } },
      semg: { fatigueLevel: 'Moderate', peakFatigue: 62, avgFatigue: 38, trend: 'Increasing' },
      alerts: [{ time: '01:45:30', type: 'Elevated HR', severity: 'Warning', message: 'Heart rate above 180 bpm' }],
    },
    {
      bibNumber: '003', name: 'Sarah Johnson', category: 'Full Marathon',
      heartRate: { min: 138, max: 178, avg: 158, zones: { z1: 20, z2: 30, z3: 30, z4: 15, z5: 5 } },
      semg: { fatigueLevel: 'High', peakFatigue: 78, avgFatigue: 52, trend: 'Sharp Increase' },
      alerts: [
        { time: '01:30:15', type: 'High Fatigue', severity: 'Caution', message: 'sEMG fatigue above 70%' },
        { time: '02:00:45', type: 'Elevated HR', severity: 'Warning', message: 'Heart rate sustained above 175 bpm' },
      ],
    },
  ];

  const exportLeaderboardPDF = async () => {
    const element = document.getElementById('leaderboard-section');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text('Event Leaderboard Report', 15, 15);
    pdf.setFontSize(12);
    pdf.text(`Event: ${selectedEvent?.name || 'All Events'}`, 15, 25);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 32);
    pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, imgHeight);
    pdf.save(`leaderboard-report.pdf`);
  };

  const exportMedicalReportPDF = async (runner: (typeof medicalProfiles)[0]) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFontSize(18);
    pdf.text('Medical Performance Report', 15, 15);
    pdf.setFontSize(12);
    pdf.text(`Bib Number: ${runner.bibNumber}`, 15, 30);
    pdf.text(`Runner: ${runner.name}`, 15, 37);
    pdf.text(`Category: ${runner.category}`, 15, 44);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 51);
    pdf.setFontSize(14);
    pdf.text('Heart Rate Analysis', 15, 65);
    pdf.setFontSize(10);
    pdf.text(`Average HR: ${runner.heartRate.avg} bpm`, 20, 73);
    pdf.text(`Min HR: ${runner.heartRate.min} bpm`, 20, 79);
    pdf.text(`Max HR: ${runner.heartRate.max} bpm`, 20, 85);
    pdf.setFontSize(14);
    pdf.text('sEMG Fatigue Analysis', 15, 100);
    pdf.setFontSize(10);
    pdf.text(`Fatigue Level: ${runner.semg.fatigueLevel}`, 20, 108);
    pdf.text(`Average: ${runner.semg.avgFatigue}%`, 20, 114);
    pdf.text(`Peak: ${runner.semg.peakFatigue}%`, 20, 120);
    pdf.save(`medical-report-${runner.bibNumber}.pdf`);
  };

  const currentLeaderboard = leaderboardData.all;
  const totalAlerts = medicalProfiles.reduce((sum, r) => sum + r.alerts.length, 0);

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>Analytics</p>
            <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>Reports</h1>
            <p className='text-muted-foreground mt-1.5 text-sm'>Event performance reports and medical analytics</p>
          </div>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className='w-[240px] rounded-xl'>
              <SelectValue placeholder='Select event' />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event._id} value={event._id}>{event.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard title='Runners' value={currentLeaderboard.length} subtitle='Finished the race' icon={Trophy} accentColor='teal' />
        <StatCard title='Medical Profiles' value={medicalProfiles.length} subtitle='Monitored runners' icon={Heart} accentColor='green' />
        <StatCard title='Alerts Triggered' value={totalAlerts} subtitle='During event' icon={AlertTriangle} accentColor='amber' />
      </div>

      <Tabs defaultValue='leaderboard' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 rounded-xl'>
          <TabsTrigger value='leaderboard' className='rounded-lg gap-2'>
            <Trophy className='w-4 h-4' />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value='medical' className='rounded-lg gap-2'>
            <Activity className='w-4 h-4' />
            Medical Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value='leaderboard' className='space-y-4 mt-4'>
          <Card id='leaderboard-section'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                    <Trophy className='w-4 h-4 text-primary' />
                  </div>
                  <div>
                    <CardTitle>Event Leaderboard</CardTitle>
                    <CardDescription>Ranked by finish time</CardDescription>
                  </div>
                </div>
                <Button onClick={exportLeaderboardPDF} variant='outline' size='sm' className='gap-2 rounded-xl'>
                  <Download className='w-4 h-4' />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='rounded-xl border border-border overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/30'>
                      <TableHead className='font-semibold'>Rank</TableHead>
                      <TableHead className='font-semibold'>Bib #</TableHead>
                      <TableHead className='font-semibold'>Name</TableHead>
                      <TableHead className='font-semibold'>Category</TableHead>
                      <TableHead className='font-semibold'>Finish Time</TableHead>
                      <TableHead className='font-semibold'>Avg HR</TableHead>
                      <TableHead className='font-semibold'>Alerts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentLeaderboard.map((runner) => (
                      <TableRow key={runner.bibNumber} className='hover:bg-muted/30 transition-colors'>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {runner.rank === 1 && <Trophy className='w-4 h-4 text-yellow-500' />}
                            {runner.rank === 2 && <Trophy className='w-4 h-4 text-gray-400' />}
                            {runner.rank === 3 && <Trophy className='w-4 h-4 text-amber-600' />}
                            <span className='font-bold'>{runner.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell className='font-mono font-medium text-primary'>{runner.bibNumber}</TableCell>
                        <TableCell className='font-medium'>{runner.name}</TableCell>
                        <TableCell>
                          <Badge className='bg-primary/10 text-primary border-0'>{runner.category}</Badge>
                        </TableCell>
                        <TableCell className='font-mono font-semibold'>{runner.time}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <Heart className='w-3 h-3 text-red-500' />
                            <span className='text-sm'>{runner.avgHR} bpm</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {runner.alerts > 0 ? (
                            <Badge className='bg-destructive/10 text-destructive border-0 gap-1'>
                              <AlertTriangle className='w-3 h-3' />
                              {runner.alerts}
                            </Badge>
                          ) : (
                            <Badge className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0'>None</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='medical' className='space-y-4 mt-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Activity className='w-4 h-4 text-primary' />
                </div>
                <div>
                  <CardTitle>Medical Performance Reports</CardTitle>
                  <CardDescription>Individual runner medical profiles and analytics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {medicalProfiles.map((runner) => (
                <div key={runner.bibNumber} className='rounded-xl border border-border p-5 space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                        <span className='text-sm font-bold text-primary'>#{runner.bibNumber}</span>
                      </div>
                      <div>
                        <h4 className='font-bold'>{runner.name}</h4>
                        <p className='text-xs text-muted-foreground'>{runner.category}</p>
                      </div>
                    </div>
                    <Button onClick={() => exportMedicalReportPDF(runner)} variant='outline' size='sm' className='gap-2 rounded-xl'>
                      <FileText className='w-4 h-4' />
                      Export PDF
                    </Button>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2'>
                    {/* Heart Rate */}
                    <div className='p-4 rounded-xl bg-muted/30 space-y-3'>
                      <h5 className='text-sm font-semibold flex items-center gap-2'>
                        <Heart className='w-4 h-4 text-red-500' />
                        Heart Rate
                      </h5>
                      <div className='grid grid-cols-3 gap-2'>
                        <div className='text-center'>
                          <p className='text-lg font-bold'>{runner.heartRate.min}</p>
                          <p className='text-[10px] text-muted-foreground uppercase tracking-wider'>Min BPM</p>
                        </div>
                        <div className='text-center'>
                          <p className='text-lg font-bold text-primary'>{runner.heartRate.avg}</p>
                          <p className='text-[10px] text-muted-foreground uppercase tracking-wider'>Avg BPM</p>
                        </div>
                        <div className='text-center'>
                          <p className='text-lg font-bold'>{runner.heartRate.max}</p>
                          <p className='text-[10px] text-muted-foreground uppercase tracking-wider'>Max BPM</p>
                        </div>
                      </div>
                      <div className='flex gap-0.5'>
                        {Object.entries(runner.heartRate.zones).map(([zone, percent]) => (
                          <div key={zone} className='flex-1'>
                            <div className='h-2 bg-primary/20 rounded-full overflow-hidden'>
                              <div className='h-full bg-primary rounded-full' style={{ width: `${percent * 2}%` }} />
                            </div>
                            <p className='text-[9px] text-center mt-1 text-muted-foreground'>{zone.toUpperCase()} {percent}%</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* sEMG Fatigue */}
                    <div className='p-4 rounded-xl bg-muted/30 space-y-3'>
                      <h5 className='text-sm font-semibold flex items-center gap-2'>
                        <Activity className='w-4 h-4 text-primary' />
                        sEMG Fatigue
                      </h5>
                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>Level</span>
                          <Badge className={
                            runner.semg.fatigueLevel === 'Low'
                              ? 'bg-emerald-500/10 text-emerald-600 border-0'
                              : runner.semg.fatigueLevel === 'Moderate'
                                ? 'bg-amber-500/10 text-amber-600 border-0'
                                : 'bg-destructive/10 text-destructive border-0'
                          }>{runner.semg.fatigueLevel}</Badge>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>Average</span>
                          <span className='font-semibold'>{runner.semg.avgFatigue}%</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>Peak</span>
                          <span className='font-semibold'>{runner.semg.peakFatigue}%</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>Trend</span>
                          <span className='font-semibold flex items-center gap-1'>
                            <TrendingUp className='w-3 h-3' />
                            {runner.semg.trend}
                          </span>
                        </div>
                        <div className='w-full h-2 bg-muted rounded-full overflow-hidden mt-1'>
                          <div
                            className={`h-full rounded-full ${
                              runner.semg.fatigueLevel === 'Low' ? 'bg-emerald-500'
                                : runner.semg.fatigueLevel === 'Moderate' ? 'bg-amber-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${runner.semg.peakFatigue}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {runner.alerts.length > 0 && (
                    <div className='space-y-2'>
                      {runner.alerts.map((alert, index) => (
                        <div key={index} className='flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10'>
                          <AlertTriangle className='w-4 h-4 text-destructive mt-0.5 flex-shrink-0' />
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-0.5'>
                              <Badge className='bg-destructive/10 text-destructive border-0 text-[10px]'>{alert.severity}</Badge>
                              <span className='text-xs text-muted-foreground'>{alert.time}</span>
                            </div>
                            <p className='text-sm font-medium'>{alert.type}</p>
                            <p className='text-xs text-muted-foreground'>{alert.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
