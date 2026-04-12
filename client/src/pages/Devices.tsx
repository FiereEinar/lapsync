import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreVertical, Copy, Computer, Wifi, WifiOff } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddDeviceDialog from '@/components/forms/AddDeviceDialog';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { QUERY_KEYS } from '@/constants';
import { Device } from '@/types/device';
import _ from 'lodash';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/main';
import { useState, useMemo } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditDeviceDialog from '@/components/forms/EditDeviceDialog';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';

export default function Devices() {
  const { toast } = useToast();
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: devices, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DEVICES],
    queryFn: async (): Promise<Device[]> =>
      (await axiosInstance.get('/device')).data.data,
  });

  const filteredDevices = useMemo(() => {
    if (!devices) return [];
    if (!searchTerm) return devices;
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.deviceToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.registration?.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [devices, searchTerm]);

  const assignedCount = devices?.filter((d) => d.registration !== null).length || 0;
  const availableCount = devices?.filter((d) => d.registration === null).length || 0;

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast({ title: 'Copied', description: 'Token copied to clipboard' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to copy token' });
    }
  };

  const handleUnassign = async (deviceID: string) => {
    try {
      await axiosInstance.patch(`/device/unassign/${deviceID}`);
      toast({ title: 'Unassigned', description: 'Device unassigned successfully' });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEVICES] });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed', description: error.message ?? 'Failed to unassign device' });
    }
  };

  const handleRemoveDevice = async (deviceID: string) => {
    try {
      await axiosInstance.delete(`/device/${deviceID}`);
      toast({ title: 'Deleted', description: 'Device deleted successfully' });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEVICES] });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed', description: error.message ?? 'Failed to delete device' });
    }
  };

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>Hardware</p>
            <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>Devices</h1>
            <p className='text-muted-foreground mt-1.5 text-sm'>Manage hardware devices and tracking nodes</p>
          </div>
          <AddDeviceDialog />
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard title='Total Devices' value={devices?.length || 0} subtitle='All registered devices' icon={Computer} accentColor='teal' />
        <StatCard title='Assigned' value={assignedCount} subtitle='Currently in use' icon={Wifi} accentColor='green' />
        <StatCard title='Available' value={availableCount} subtitle='Ready to assign' icon={WifiOff} accentColor='purple' />
      </div>

      {/* Table */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input placeholder='Search by device, token, or runner name...' className='pl-9' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button variant='outline' className='gap-2 rounded-xl'>
              <Filter className='w-4 h-4' />
              Filters
            </Button>
          </div>

          <div className='rounded-xl border border-border overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30'>
                  <TableHead className='font-semibold'>Device Name</TableHead>
                  <TableHead className='font-semibold'>Device Token</TableHead>
                  <TableHead className='font-semibold'>Status</TableHead>
                  <TableHead className='font-semibold'>Assigned To</TableHead>
                  <TableHead className='font-semibold'>Event</TableHead>
                  <TableHead className='text-right font-semibold'>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-12'>
                      <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                      <p className='text-muted-foreground text-sm'>Loading devices...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-12'>
                      <Computer className='w-10 h-10 text-muted-foreground/50 mx-auto mb-3' />
                      <p className='text-muted-foreground text-sm'>No devices found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => (
                    <TableRow key={device._id} className='hover:bg-muted/30 transition-colors'>
                      <TableCell className='font-medium'>{device.name}</TableCell>
                      <TableCell className='text-muted-foreground'>
                        <div className='flex items-center gap-1.5'>
                          <code className='text-xs bg-muted/50 px-1.5 py-0.5 rounded'>{_.truncate(device.deviceToken, { length: 20 })}</code>
                          <Copy onClick={() => handleCopyToken(device.deviceToken)} className='w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors' />
                        </div>
                      </TableCell>
                      <TableCell>
                        {device.registration === null ? (
                          <Badge className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0'>Available</Badge>
                        ) : (
                          <Badge className='bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0'>Assigned</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>{_.startCase(device.registration?.user?.name) || '--'}</TableCell>
                      <TableCell className='text-muted-foreground'>{_.startCase(device.registration?.event?.name) || '--'}</TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm' className='rounded-lg'><MoreVertical className='w-4 h-4' /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => setEditingDevice(device)}>Edit Device</DropdownMenuItem>
                            {device.registration !== null && (
                              <DropdownMenuItem>
                                <button onClick={() => handleUnassign(device._id)}>Unassign Device</button>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className='text-destructive'>
                              <ConfirmDialog onConfirm={() => handleRemoveDevice(device._id)} trigger={<button>Remove Device</button>} />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingDevice && (
        <EditDeviceDialog device={editingDevice} open={!!editingDevice} onOpenChange={(open) => !open && setEditingDevice(null)} />
      )}
    </div>
  );
}
