import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trophy, CalendarCheck, Radio, Bell, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import EditProfile from '@/components/EditProfile';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { QUERY_KEYS } from '@/constants';
import { Registration } from '@/types/registration';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/StatusBadge';

export default function Profile() {
	const { user } = useUserStore((state) => state);

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

	const hardwareHistory = [
		{
			date: 'Jan 15, 2024',
			event: 'City Marathon 2024',
			device: 'RFID Tag #12345',
			status: 'In Use',
		},
		{
			date: 'Dec 22, 2023',
			event: 'Trail Run Challenge',
			device: 'Running Node #89',
			status: 'Returned',
		},
		{
			date: 'Dec 8, 2023',
			event: 'Sprint Series #3',
			device: 'RFID Tag #67890',
			status: 'Returned',
		},
	];

	return (
		<div className='space-y-6 animate-appear'>
			{/* Hero Section */}
			<div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
				<div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
				<div className='relative'>
					<p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
						Account
					</p>
					<h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>
						My Profile
					</h1>
					<p className='text-muted-foreground mt-1.5 text-sm'>
						Manage your account details and notification preferences
					</p>
				</div>
			</div>

			<div className='grid gap-6 md:grid-cols-2'>
				<EditProfile />

				<Card className='rounded-xl border border-border shadow-sm'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
								<Bell className='w-4 h-4 text-primary' />
							</div>
							Notification Preferences
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='space-y-0.5'>
								<Label>Event Reminders</Label>
								<p className='text-xs text-muted-foreground'>
									Get notified before events
								</p>
							</div>
							<Switch defaultChecked />
						</div>
						<div className='flex items-center justify-between'>
							<div className='space-y-0.5'>
								<Label>Race Updates</Label>
								<p className='text-xs text-muted-foreground'>
									Live updates during races
								</p>
							</div>
							<Switch defaultChecked />
						</div>
						<div className='flex items-center justify-between'>
							<div className='space-y-0.5'>
								<Label>Hardware Notifications</Label>
								<p className='text-xs text-muted-foreground'>
									Device pickup reminders
								</p>
							</div>
							<Switch defaultChecked />
						</div>
						<div className='flex items-center justify-between'>
							<div className='space-y-0.5'>
								<Label>Results & Leaderboards</Label>
								<p className='text-xs text-muted-foreground'>
									When results are published
								</p>
							</div>
							<Switch />
						</div>
						<div className='flex items-center justify-between'>
							<div className='space-y-0.5'>
								<Label>Marketing Emails</Label>
								<p className='text-xs text-muted-foreground'>
									News and promotions
								</p>
							</div>
							<Switch />
						</div>
					</CardContent>
				</Card>
			</div>

			<div className='grid gap-6 md:grid-cols-2'>
				{/* Registrations */}
				<Card className='rounded-xl border border-border shadow-sm flex flex-col'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
								<Trophy className='w-4 h-4 text-primary' />
							</div>
							My Registrations
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3 flex-1'>
						{userRegistrations.length === 0 ? (
							<div className='text-center py-8'>
								<CalendarCheck className='w-10 h-10 text-muted-foreground/50 mx-auto mb-3' />
								<p className='text-muted-foreground text-sm'>No registrations yet</p>
							</div>
						) : (
							userRegistrations.map((reg) => (
								<div
									key={reg._id}
									className='flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors'
								>
									<div>
										<p className='font-medium text-sm'>{reg.event?.name || '--'}</p>
										<p className='text-xs text-muted-foreground mt-0.5'>
											{reg.event?.date ? format(new Date(reg.event.date), "MMM d, yyyy") : '--'}
											{reg.raceCategory && ` • ${reg.raceCategory.name}`}
										</p>
									</div>
									<StatusBadge status={reg.status} />
								</div>
							))
						)}
					</CardContent>
				</Card>

				{/* Hardware History */}
				<Card className='rounded-xl border border-border shadow-sm flex flex-col'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
								<Radio className='w-4 h-4 text-primary' />
							</div>
							Hardware History
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3 flex-1'>
						{hardwareHistory.map((item, index) => (
							<div
								key={index}
								className='flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors'
							>
								<div className='space-y-0.5'>
									<p className='font-medium text-sm'>{item.device}</p>
									<p className='text-xs text-muted-foreground'>
										{item.event} • {item.date}
									</p>
								</div>
								<span
									className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
										item.status === 'In Use'
											? 'bg-primary/10 text-primary'
											: 'bg-muted text-muted-foreground'
									}`}
								>
									{item.status}
								</span>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<Card className='rounded-xl border border-destructive/20 bg-destructive/5 shadow-none'>
				<CardHeader>
					<CardTitle className='text-destructive flex items-center gap-2'>
						<AlertTriangle className='w-5 h-5' />
						Danger Zone
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<p className='text-sm text-muted-foreground'>
						Once you delete your account, there is no going back. All of your historical data, registrations, and leaderboard records will be permanently erased.
					</p>
					<Button
						variant='destructive'
						className='rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground'
					>
						Delete Account
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
