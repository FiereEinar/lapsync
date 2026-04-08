import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUserStore } from '@/stores/user';
import { User } from 'lucide-react';

export function Topbar() {
	const { user } = useUserStore((state) => state);

	return (
		<header className='h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl flex items-center px-4 sticky top-0 z-10'>
			<SidebarTrigger className='mr-4' />
			<div className='flex-1' />
			{user && (
				<div className='flex items-center gap-2.5'>
					<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
						<User className='w-3.5 h-3.5 text-primary' />
					</div>
					<span className='text-sm font-medium text-foreground'>{user.name}</span>
				</div>
			)}
		</header>
	);
}
