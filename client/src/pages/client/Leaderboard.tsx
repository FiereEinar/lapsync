import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Event } from '@/types/event';
import { QUERY_KEYS } from '@/constants';
import { StatCard } from '@/components/StatCard';

export default function Leaderboard() {
  const [selectedEventId, setSelectedEventId] = useState('');

  const { data: events = [] } = useQuery({
    queryKey: [QUERY_KEYS.EVENT],
    queryFn: async (): Promise<Event[]> => {
      const { data } = await axiosInstance.get('/event');
      return data.data;
    },
  });

  const selectedEventName = events.find((e) => e._id === selectedEventId)?.name || 'Select an Event';

  const currentEventStats = {
    yourRank: 3,
    bestTime: '38:45',
  };

  const overallLeaderboard = [
    { rank: 1, name: 'John Doe', bibNumber: '001', time: '2:10:45', techType: 'Running Node' },
    { rank: 2, name: 'Jane Smith', bibNumber: '002', time: '2:12:20', techType: 'Hybrid' },
    { rank: 3, name: 'You', bibNumber: '042', time: '2:15:30', techType: 'Running Node', isUser: true },
    { rank: 4, name: 'Mike Johnson', bibNumber: '003', time: '2:18:45', techType: 'RFID' },
    { rank: 5, name: 'Sarah Williams', bibNumber: '005', time: '2:22:10', techType: 'Hybrid' },
  ];

  const personalStats = [
    { event: 'City Marathon 2024', date: 'Jan 15, 2024', rank: 3, time: '2:15:30', participants: 150 },
    { event: 'Trail Run Challenge', date: 'Dec 22, 2023', rank: 5, time: '1:45:20', participants: 80 },
    { event: 'Sprint Series #3', date: 'Dec 8, 2023', rank: 2, time: '38:45', participants: 60 },
  ];

  const achievements = [
    { title: 'First Marathon', description: 'Completed your first marathon', date: 'Jan 15, 2024' },
    { title: 'Top 5 Finish', description: 'Finished in top 5', date: 'Dec 22, 2023' },
    { title: 'Consistency', description: 'Participated in 3+ events', date: 'Dec 8, 2023' },
  ];

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>Results</p>
            <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>Leaderboards</h1>
            <p className='text-muted-foreground mt-1.5 text-sm'>Track your performance against other runners</p>
          </div>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className='w-[300px] rounded-xl bg-background/50 backdrop-blur-sm'>
              <SelectValue placeholder='Select event to view...' />
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
        <StatCard title='Current Rank' value={`#${currentEventStats.yourRank}`} subtitle={selectedEventId ? selectedEventName : 'Select an event'} icon={Trophy} accentColor='amber' />
        <StatCard title='Best Time' value={currentEventStats.bestTime} subtitle='Sprint Series #3' icon={TrendingUp} accentColor='green' />
        <StatCard title='Achievements' value={achievements.length} subtitle='Unlocked badges' icon={Award} accentColor='purple' />
      </div>

      <Tabs defaultValue='current' className='w-full'>
        <TabsList className='grid w-full grid-cols-3 rounded-xl'>
          <TabsTrigger value='current' className='rounded-lg'>Current Event</TabsTrigger>
          <TabsTrigger value='history' className='rounded-lg'>My History</TabsTrigger>
          <TabsTrigger value='achievements' className='rounded-lg'>Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value='current' className='space-y-4 mt-6'>
          <Card className='rounded-xl border border-border shadow-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Trophy className='w-4 h-4 text-primary' />
                </div>
                Overall Leaderboard {selectedEventId ? `- ${selectedEventName}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='rounded-xl border border-border overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/30'>
                      <TableHead className='font-semibold'>Rank</TableHead>
                      <TableHead className='font-semibold'>Bib #</TableHead>
                      <TableHead className='font-semibold'>Name</TableHead>
                      <TableHead className='font-semibold'>Time</TableHead>
                      <TableHead className='font-semibold'>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overallLeaderboard.map((runner) => (
                      <TableRow
                        key={runner.rank}
                        className={`hover:bg-muted/30 transition-colors ${
                          runner.isUser ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary' : ''
                        }`}
                      >
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {runner.rank === 1 && <Trophy className='w-4 h-4 text-yellow-500' />}
                            {runner.rank === 2 && <Trophy className='w-4 h-4 text-gray-400' />}
                            {runner.rank === 3 && <Trophy className='w-4 h-4 text-amber-600' />}
                            <span className='font-bold'>{runner.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell className='font-mono font-medium text-primary'>
                          {runner.bibNumber}
                        </TableCell>
                        <TableCell className={runner.isUser ? 'font-bold' : 'font-medium'}>
                          {runner.name} {runner.isUser && <Badge className='ml-2 bg-primary/10 text-primary border-0 text-[10px]'>YOU</Badge>}
                        </TableCell>
                        <TableCell className='font-mono font-semibold'>{runner.time}</TableCell>
                        <TableCell>
                          <Badge className='bg-muted text-muted-foreground border-0'>{runner.techType}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='history' className='space-y-4 mt-6'>
          <Card className='rounded-xl border border-border shadow-sm'>
            <CardHeader>
              <CardTitle>Personal Race History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='rounded-xl border border-border overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/30'>
                      <TableHead className='font-semibold'>Event</TableHead>
                      <TableHead className='font-semibold'>Date</TableHead>
                      <TableHead className='font-semibold'>Rank</TableHead>
                      <TableHead className='font-semibold'>Time</TableHead>
                      <TableHead className='font-semibold'>Participants</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personalStats.map((stat, index) => (
                      <TableRow key={index} className='hover:bg-muted/30 transition-colors'>
                        <TableCell className='font-medium'>{stat.event}</TableCell>
                        <TableCell className='text-muted-foreground'>{stat.date}</TableCell>
                        <TableCell>
                          <Badge className='bg-amber-500/10 text-amber-600 border-0'>#{stat.rank}</Badge>
                        </TableCell>
                        <TableCell className='font-mono font-semibold'>{stat.time}</TableCell>
                        <TableCell className='text-muted-foreground'>{stat.participants}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className='rounded-xl border border-border shadow-sm'>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='w-full h-[200px] bg-muted/30 border border-border rounded-xl flex items-center justify-center'>
                <div className='text-center text-muted-foreground'>
                  <TrendingUp className='w-12 h-12 mx-auto mb-2 opacity-50' />
                  <p className='font-medium'>Performance chart</p>
                  <p className='text-sm opacity-75'>Track your improvement over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='achievements' className='space-y-4 mt-6'>
          <Card className='rounded-xl border border-border shadow-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center'>
                  <Award className='w-4 h-4 text-purple-500' />
                </div>
                Unlocked Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className='flex items-start gap-4 p-4 border border-border rounded-xl bg-card hover:bg-muted/30 transition-colors hover:border-primary/30 group'
                  >
                    <div className='w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'>
                      <Award className='w-6 h-6 text-primary' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-semibold truncate tooltip' title={achievement.title}>{achievement.title}</h4>
                      <p className='text-sm text-muted-foreground truncate'>{achievement.description}</p>
                      <p className='text-[10px] text-muted-foreground mt-1 uppercase tracking-wider'>{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
