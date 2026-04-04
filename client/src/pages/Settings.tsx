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
			<div>
				<h1 className='text-3xl font-bold text-foreground mb-2'>Settings</h1>
				<p className='text-muted-foreground'>
					Manage your application preferences
				</p>
			</div>

			<Tabs defaultValue='profile' className='w-full'>
				<TabsList className='grid w-full grid-cols-4'>
					<TabsTrigger value='profile' className='flex items-center gap-2'>
						<User className='w-4 h-4' />
						Profile
					</TabsTrigger>
					<TabsTrigger value='preferences' className='flex items-center gap-2'>
						<Settings2 className='w-4 h-4' />
						Preferences
					</TabsTrigger>
					<TabsTrigger value='hardware' className='flex items-center gap-2'>
						<Cpu className='w-4 h-4' />
						Hardware
					</TabsTrigger>
					<TabsTrigger value='thresholds' className='flex items-center gap-2'>
						<AlertCircle className='w-4 h-4' />
						Alert Thresholds
					</TabsTrigger>
				</TabsList>

				<TabsContent value='profile' className='mt-6'>
					<EditProfile />
				</TabsContent>

				<TabsContent value='preferences' className='mt-6'>
					<Card>
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
					<Card>
						<CardHeader>
							<CardTitle>Hardware Configuration</CardTitle>
							<CardDescription>
								Manage RFID and tracking hardware settings
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='rfid-prefix'>RFID Tag Prefix</Label>
								<Input id='rfid-prefix' defaultValue='LS-' />
							</div>
							<div className='space-y-2'>
								<Label htmlFor='checkpoint-interval'>
									Checkpoint Check Interval (seconds)
								</Label>
								<Input id='checkpoint-interval' type='number' defaultValue='5' />
							</div>
							<Button>Update Configuration</Button>
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
