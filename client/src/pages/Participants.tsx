import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Filter, Download, Users, Calendar, UserCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Registration } from '@/types/registration';
import { QUERY_KEYS } from '@/constants';
import { useState, useMemo } from 'react';
import { useUserStore } from '@/stores/user';
import _ from 'lodash';
import ParticipantActionsDropDown from '@/components/buttons/ParticipantActionsDropDown';
import { StatCard } from '@/components/StatCard';
import AddParticipantDialog from '@/components/modals/AddParticipantDialog';

export default function Participants() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const eventID = searchParams.get('eventID');
  const { user } = useUserStore((state) => state);
  const isAdmin = user?.role === 'admin';

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REGISTRATIONS, eventID],
    queryFn: async (): Promise<Registration[]> => {
      const params = new URLSearchParams();
      if (eventID) {
        params.append('eventID', eventID);
      }
      const { data } = await axiosInstance.get(
        `/registration?${params.toString()}`,
      );
      return Array.isArray(data.data) ? data.data : [];
    },
  });

  const filteredParticipants = useMemo(() => {
    return registrations.filter(
      (reg) =>
        reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [registrations, searchTerm]);

  const confirmedCount = registrations.filter((r) => r.status === 'confirmed').length;
  const pendingCount = registrations.filter((r) => r.status === 'pending').length;

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
              Participants
            </p>
            <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>
              Manage Participants
            </h1>
            <p className='text-muted-foreground mt-1.5 text-sm'>
              {eventID
                ? 'Viewing participants for a specific event'
                : 'All registered participants across events'}
            </p>
          </div>
          {isAdmin && (
            <div className='flex gap-2'>
              <Button variant='outline' className='gap-2 rounded-xl'>
                <Download className='w-4 h-4' />
                Export
              </Button>
              <AddParticipantDialog />
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard
          title='Total Participants'
          value={registrations.length}
          subtitle='All registrations'
          icon={Users}
          accentColor='teal'
        />
        <StatCard
          title='Confirmed'
          value={confirmedCount}
          subtitle='Ready to race'
          icon={UserCheck}
          accentColor='green'
        />
        <StatCard
          title='Pending'
          value={pendingCount}
          subtitle='Awaiting confirmation'
          icon={Calendar}
          accentColor='amber'
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4 mb-6 flex-wrap'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Search by name or email...'
                className='pl-9'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isAdmin && (
              <Button variant='outline' className='gap-2 rounded-xl'>
                <Filter className='w-4 h-4' />
                Filters
              </Button>
            )}
          </div>

          <div className='rounded-xl border border-border overflow-x-hidden overflow-y-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30'>
                  <TableHead className='font-semibold'>Bib No.</TableHead>
                  <TableHead className='font-semibold'>Name</TableHead>
                  <TableHead className='font-semibold'>Email</TableHead>
                  <TableHead className='font-semibold'>Phone</TableHead>
                  <TableHead className='font-semibold'>Event</TableHead>
                  <TableHead className='font-semibold'>Category</TableHead>
                  <TableHead className='font-semibold'>Shirt Size</TableHead>
                  <TableHead className='font-semibold'>Status</TableHead>
                  {isAdmin && (
                    <TableHead className='text-right font-semibold'>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 9 : 8}
                      className='text-center py-12'
                    >
                      <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                      <p className='text-muted-foreground text-sm'>Loading participants...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 9 : 8}
                      className='text-center py-12'
                    >
                      <Users className='w-10 h-10 text-muted-foreground/50 mx-auto mb-3' />
                      <p className='text-muted-foreground text-sm'>No participants found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParticipants.map((registration) => (
                    <TableRow
                      key={registration._id}
                      className='hover:bg-muted/30 transition-colors'
                    >
                      <TableCell className='font-mono font-medium text-primary'>
                        {registration.bibNumber || '--'}
                      </TableCell>
                      <TableCell className='font-medium text-foreground'>
                        {_.startCase(registration.user.name)}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {registration.user.email}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {registration.user.phone || '--'}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        <Link
                          to={`/events/${registration.event._id}`}
                          className='hover:text-primary transition-colors hover:underline'
                        >
                          {registration.event.name}
                        </Link>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        <Link
                          to={`/events/${registration.event._id}`}
                          className='hover:text-primary transition-colors hover:underline'
                        >
                          {registration.raceCategory?.name || '--'}
                        </Link>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {registration.shirtSize || '--'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={registration.status} />
                      </TableCell>
                      {isAdmin && (
                        <TableCell className='text-right'>
                          <ParticipantActionsDropDown
                            registration={registration}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
