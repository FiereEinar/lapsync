import { useState } from 'react';
import EditProfile from '@/components/EditProfile';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import AlertThresholds from '@/components/tabs/settings/AlertThresholds';
import { User, Settings2, AlertCircle, Cpu } from 'lucide-react';

export default function Settings() {
	return (
		<div className='space-y-6 max-w-4xl animate-appear'>
			{/* Hero Section */}
			<div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
				<div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
				<div className='relative'>
					<p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
						System
					</p>
					<h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>
						Settings
					</h1>
					<p className='text-muted-foreground mt-1.5 text-sm'>
						Manage your application preferences
					</p>
				</div>
			</div>

			<Tabs defaultValue='profile' className='w-full'>
				<TabsList className='grid w-full grid-cols-4 rounded-xl'>
					<TabsTrigger value='profile' className='flex items-center gap-2 rounded-lg'>
						<User className='w-4 h-4' />
						Profile
					</TabsTrigger>
					<TabsTrigger value='preferences' className='flex items-center gap-2 rounded-lg'>
						<Settings2 className='w-4 h-4' />
						Preferences
					</TabsTrigger>
					<TabsTrigger value='hardware' className='flex items-center gap-2 rounded-lg'>
						<Cpu className='w-4 h-4' />
						Hardware
					</TabsTrigger>
					<TabsTrigger value='thresholds' className='flex items-center gap-2 rounded-lg'>
						<AlertCircle className='w-4 h-4' />
						Alert Thresholds
					</TabsTrigger>
				</TabsList>

				<TabsContent value='profile' className='mt-6'>
					<EditProfile />
				</TabsContent>

				<TabsContent value='preferences' className='mt-6'>
					<Card className='rounded-xl border border-border shadow-sm'>
						<CardHeader>
							<CardTitle>Event Preferences</CardTitle>
							<CardDescription>Configure default event settings</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Auto-publish Results</Label>
									<p className='text-sm text-muted-foreground'>
										Automatically publish results after race completion
									</p>
								</div>
								<Switch />
							</div>
							<Separator />
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Email Notifications</Label>
									<p className='text-sm text-muted-foreground'>
										Send email updates to participants
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<Separator />
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Hardware Auto-Assignment</Label>
									<p className='text-sm text-muted-foreground'>
										Automatically assign RFID tags to new participants
									</p>
								</div>
								<Switch defaultChecked />
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='hardware' className='mt-6'>
					<Card className='rounded-xl border border-border shadow-sm'>
						<CardHeader>
							<CardTitle>Hardware Configuration</CardTitle>
							<CardDescription>
								Manage RFID and tracking hardware settings
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='rfid-prefix'>RFID Tag Prefix</Label>
								<Input id='rfid-prefix' defaultValue='LS-' className='rounded-xl' />
							</div>
							<div className='space-y-2'>
								<Label htmlFor='checkpoint-interval'>
									Checkpoint Check Interval (seconds)
								</Label>
								<Input id='checkpoint-interval' type='number' defaultValue='5' className='rounded-xl' />
							</div>
							<Button className='rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20'>
								Update Configuration
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='thresholds' className='mt-6'>
					<AlertThresholds />
				</TabsContent>
			</Tabs>
		</div>
	);
}
