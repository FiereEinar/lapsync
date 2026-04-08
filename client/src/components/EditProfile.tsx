import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Calendar, Loader2 } from 'lucide-react';
import { useUserStore } from '@/stores/user';
import { format } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/api/axios';

export default function EditProfile() {
	const { user, setUser } = useUserStore((state) => state);
	const [name, setName] = useState(user?.name ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const [phone, setPhone] = useState(user?.phone ? String(user.phone) : '');
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async () => {
		if (!user) return;
		setLoading(true);
		try {
			const { data } = await axiosInstance.patch('/user', {
				name,
				email,
				phone,
			});
			setUser(data.data);
			toast({
				title: 'Profile updated',
				description: 'Your profile was updated successfully.',
			});
		} catch (err: any) {
			toast({
				variant: 'destructive',
				title: 'Update failed',
				description: err?.message ?? 'Could not update profile.',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className='rounded-xl border border-border shadow-sm'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
						<User className='w-4 h-4 text-primary' />
					</div>
					Personal Information
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='space-y-2'>
					<Label htmlFor='name'>Full Name</Label>
					<Input
						id='name'
						value={name}
						onChange={(e) => setName(e.target.value)}
						className='rounded-xl'
					/>
				</div>
				<div className='space-y-2'>
					<Label htmlFor='email'>Email Address</Label>
					<Input
						id='email'
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className='rounded-xl'
					/>
				</div>
				<div className='space-y-2'>
					<Label htmlFor='phone'>Phone Number</Label>
					<Input
						id='phone'
						type='tel'
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className='rounded-xl'
					/>
				</div>
				<div className='flex items-center gap-2 text-sm text-muted-foreground'>
					<Calendar className='w-4 h-4' />
					<span>
						Member since{' '}
						{user ? format(new Date(user.createdAt), 'MMM d, yyyy') : ''}
					</span>
				</div>
				<Button
					className='w-max gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20'
					onClick={handleSubmit}
					disabled={loading}
				>
					{loading && <Loader2 className='w-4 h-4 animate-spin' />}
					{loading ? 'Saving...' : 'Update Profile'}
				</Button>
			</CardContent>
		</Card>
	);
}
