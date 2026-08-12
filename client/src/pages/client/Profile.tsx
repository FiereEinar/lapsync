import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
	Trophy,
	CalendarCheck,
	Bell,
	AlertTriangle,
	User,
	Radio,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import EditProfile from '@/components/EditProfile';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { QUERY_KEYS } from '@/constants';
import { Registration } from '@/types/registration';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/StatusBadge';

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

	return (
		<div className='space-y-6 max-w-4xl animate-appear'>
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
						Manage your account details, notifications, and race history
					</p>
				</div>
			</div>

			<Tabs defaultValue='profile' className='w-full'>
				<TabsList className='grid w-full grid-cols-4 rounded-xl'>
					<TabsTrigger value='profile' className='flex items-center gap-2 rounded-lg'>
						<User className='w-4 h-4' />
						Profile
					</TabsTrigger>
					<TabsTrigger value='notifications' className='flex items-center gap-2 rounded-lg'>
						<Bell className='w-4 h-4' />
						Notifications
					</TabsTrigger>
					<TabsTrigger value='activity' className='flex items-center gap-2 rounded-lg'>
						<Trophy className='w-4 h-4' />
						Activity
					</TabsTrigger>
					<TabsTrigger value='danger' className='flex items-center gap-2 rounded-lg'>
						<AlertTriangle className='w-4 h-4' />
						Danger Zone
					</TabsTrigger>
				</TabsList>

				{/* ── Profile Tab ──────────────────────────────────── */}
				<TabsContent value='profile' className='mt-6'>
					<EditProfile />
				</TabsContent>

				{/* ── Notifications Tab ─────────────────────────────── */}
				<TabsContent value='notifications' className='mt-6'>
					<Card className='rounded-xl border border-border shadow-sm'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
									<Bell className='w-4 h-4 text-primary' />
								</div>
								Notification Preferences
							</CardTitle>
							<CardDescription>
								Choose which notifications you'd like to receive
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-1'>
							<div className='flex items-center justify-between py-4'>
								<div className='space-y-0.5'>
									<Label>Event Reminders</Label>
									<p className='text-sm text-muted-foreground'>
										Get notified before your registered events
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<Separator />
							<div className='flex items-center justify-between py-4'>
								<div className='space-y-0.5'>
									<Label>Race Updates</Label>
									<p className='text-sm text-muted-foreground'>
										Live updates during races you're participating in
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<Separator />
							<div className='flex items-center justify-between py-4'>
								<div className='space-y-0.5'>
									<Label>Hardware Notifications</Label>
									<p className='text-sm text-muted-foreground'>
										Device and bib pickup reminders
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<Separator />
							<div className='flex items-center justify-between py-4'>
								<div className='space-y-0.5'>
									<Label>Results &amp; Leaderboards</Label>
									<p className='text-sm text-muted-foreground'>
										When race results and rankings are published
									</p>
								</div>
								<Switch />
							</div>
							<Separator />
							<div className='flex items-center justify-between py-4'>
								<div className='space-y-0.5'>
									<Label>Marketing Emails</Label>
									<p className='text-sm text-muted-foreground'>
										News, upcoming events, and promotions
									</p>
								</div>
								<Switch />
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── Activity Tab ─────────────────────────────────── */}
				<TabsContent value='activity' className='mt-6 space-y-6'>
					{/* Registrations */}
					<Card className='rounded-xl border border-border shadow-sm'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
									<Trophy className='w-4 h-4 text-primary' />
								</div>
								My Registrations
							</CardTitle>
							<CardDescription>Events you have registered for</CardDescription>
						</CardHeader>
						<CardContent className='space-y-3'>
							{userRegistrations.length === 0 ? (
								<div className='text-center py-10'>
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
												{reg.event?.date
													? format(new Date(reg.event.date), 'MMM d, yyyy')
													: '--'}
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
					<Card className='rounded-xl border border-border shadow-sm'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
									<Radio className='w-4 h-4 text-primary' />
								</div>
								Hardware History
							</CardTitle>
							<CardDescription>RFID tags and tracking devices assigned to you</CardDescription>
						</CardHeader>
						<CardContent className='space-y-3'>
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
				</TabsContent>

				{/* ── Danger Zone Tab ──────────────────────────────── */}
				<TabsContent value='danger' className='mt-6'>
					<Card className='rounded-xl border border-destructive/20 bg-destructive/5 shadow-none'>
						<CardHeader>
							<CardTitle className='text-destructive flex items-center gap-2'>
								<AlertTriangle className='w-5 h-5' />
								Danger Zone
							</CardTitle>
							<CardDescription className='text-muted-foreground'>
								Irreversible actions that affect your account permanently
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<p className='text-sm text-muted-foreground'>
								Once you delete your account, there is no going back. All of your
								historical data, registrations, and leaderboard records will be
								permanently erased.
							</p>
							<Button
								variant='destructive'
								className='rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground'
							>
								Delete Account
							</Button>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
