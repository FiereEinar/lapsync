import { Home, Calendar, Trophy, Activity, User, CheckCircle } from 'lucide-react';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarHeader,
	SidebarFooter,
} from '@/components/ui/sidebar';
import { MenuItem } from './AppSidebar';
import SidebarLink from './sidebars/SidebarLink';
import LogoutButton from './buttons/LogoutButton';

const menuItems: MenuItem[] = [
	{ title: 'Home', url: '/client', icon: Home },
	{ title: 'Events', url: '/client/events', icon: Calendar },
	{ title: 'Completed Events', url: '/client/completed', icon: CheckCircle },
	{ title: 'Live Race', url: '/client/race', icon: Activity },
	{ title: 'Profile', url: '/client/profile', icon: User },
];

export function ClientSidebar() {
	return (
		<Sidebar className='border-r border-sidebar-border animate-appear'>
			<SidebarHeader className='p-4 border-b border-sidebar-border'>
				<div className='flex items-center gap-3'>
					<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20'>
						<span className='text-white font-extrabold text-lg'>L</span>
					</div>
					<div>
						<h2 className='font-bold text-sidebar-foreground tracking-wide'>LapSync</h2>
						<p className='text-[10px] text-sidebar-foreground/40 font-semibold uppercase tracking-[0.15em]'>Runner Portal</p>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className='text-sidebar-foreground/40 text-[10px] font-bold uppercase tracking-[0.15em]'>
						Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<>
								{menuItems.map((item) => (
									<SidebarLink key={item.title} item={item} />
								))}
							</>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className='p-4 border-t border-sidebar-border mt-auto'>
				<SidebarMenu>
					<LogoutButton />
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
