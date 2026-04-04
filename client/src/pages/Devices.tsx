import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreVertical, Copy } from 'lucide-react';
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
import { useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditDeviceDialog from '@/components/forms/EditDeviceDialog';

export default function Devices() {
	const { toast } = useToast();
	const [editingDevice, setEditingDevice] = useState<Device | null>(null);

	const { data: devices } = useQuery({
		queryKey: [QUERY_KEYS.DEVICES],
		queryFn: async (): Promise<Device[]> =>
			(await axiosInstance.get('/device')).data.data,
	});

	console.log(devices);

	const handleCopyToken = async (token: string) => {
		try {
			await navigator.clipboard.writeText(token);
			toast({
				title: 'Copied',
				description: 'Token copied to clipboard',
			});
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to copy token',
			});
		}
	};

	const handleUnassign = async (deviceID: string) => {
		try {
			await axiosInstance.patch(`/device/unassign/${deviceID}`);
			toast({
				title: 'Unassigned',
				description: 'Device unassigned successfully',
			});
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEVICES] });
		} catch (error) {
			console.error('Failed to unassign device', error);
			toast({
				variant: 'destructive',
				title: 'Failed to unassign device',
				description: error.message ?? 'Failed to unassign device',
			});
		}
	};

	const handleRemoveDevice = async (deviceID: string) => {
		try {
			await axiosInstance.delete(`/device/${deviceID}`);
			toast({
				title: 'Deleted',
				description: 'Device deleted successfully',
			});
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEVICES] });
		} catch (error) {
			console.error('Failed to delete device', error);
			toast({
				variant: 'destructive',
				title: 'Failed to delete device',
				description: error.message ?? 'Failed to delete device',
			});
		}
	};

	return (
		<div className='space-y-6 animate-appear'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground mb-2'>Devices</h1>
					<p className='text-muted-foreground'>Manage hardware devices</p>
				</div>

				<AddDeviceDialog />
			</div>

			<Card>
				<CardContent className='p-6'>
					<div className='flex flex-col sm:flex-row gap-4 mb-6'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
							<Input
								placeholder='Search by device ID or token...'
								className='pl-9'
							/>
						</div>

						<Button variant='outline' className='gap-2'>
							<Filter className='w-4 h-4' />
							Filters
						</Button>
					</div>

					<div className='rounded-lg border border-border overflow-hidden'>
						<Table>
							<TableHeader>
								<TableRow className='bg-muted/50'>
									<TableHead>Device Name</TableHead>
									<TableHead>Device Token</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Assigned To</TableHead>
									<TableHead>Event</TableHead>
									<TableHead className='text-right'>Actions</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{devices &&
									devices.map((device) => (
										<TableRow key={device._id} className='hover:bg-muted/30'>
											<TableCell className='font-medium'>
												{device.name}
											</TableCell>

											<TableCell className='text-muted-foreground flex items-center'>
												{_.truncate(device.deviceToken, { length: 20 })}
												<Copy
													onClick={() => handleCopyToken(device.deviceToken)}
													className='w-4 h-4 ml-2 cursor-pointer'
												/>
											</TableCell>

											<TableCell>
												{device.registration === null ? (
													<span className='text-green-600 font-medium'>
														Available
													</span>
												) : (
													<span className='text-blue-600 font-medium'>
														Assigned
													</span>
												)}
											</TableCell>

											<TableCell className='text-muted-foreground'>
												{_.startCase(device.registration?.user?.name) || '--'}
											</TableCell>

											<TableCell className='text-muted-foreground'>
												{_.startCase(device.registration?.event?.name) || '--'}
											</TableCell>

											<TableCell className='text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='sm'>
															<MoreVertical className='w-4 h-4' />
														</Button>
													</DropdownMenuTrigger>

													<DropdownMenuContent align='end'>
														<DropdownMenuItem>View Details</DropdownMenuItem>

														<DropdownMenuItem onClick={() => setEditingDevice(device)}>Edit Device</DropdownMenuItem>

														{device.registration !== null && (
															<DropdownMenuItem>
																<button
																	onClick={() => handleUnassign(device._id)}
																>
																	Unassign Device
																</button>
															</DropdownMenuItem>
														)}

														<DropdownMenuItem className='text-destructive'>
															<ConfirmDialog
																onConfirm={() => handleRemoveDevice(device._id)}
																trigger={<button>Remove Device</button>}
															/>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{editingDevice && (
				<EditDeviceDialog
					device={editingDevice}
					open={!!editingDevice}
					onOpenChange={(open) => !open && setEditingDevice(null)}
				/>
			)}
		</div>
	);
}
