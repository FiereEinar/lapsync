import {
  Home,
  Users,
  Calendar,
  Settings,
  FileText,
  Computer,
  Radio,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarHeader,
} from "@/components/ui/sidebar";
import SidebarLink from "./sidebars/SidebarLink";
import LogoutButton from "./buttons/LogoutButton";

export type MenuItem = {
  title: string;
  url: string;
  icon: any;
  asButton?: boolean;
};

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Participants", url: "/participants", icon: Users },
  { title: "Devices", url: "/devices", icon: Computer },
  { title: "RFID Tags", url: "/rfid-tags", icon: Radio },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar className='border-r border-sidebar-border'>
      <SidebarHeader className='p-4 border-b border-sidebar-border'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
            <span className='text-primary-foreground font-bold text-lg'>L</span>
          </div>
          <div>
            <h2 className='font-bold text-sidebar-foreground'>LapSync</h2>
            <p className='text-xs text-sidebar-foreground/60'>
              Event Management
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='text-sidebar-foreground/60'>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <>
                {menuItems.map((item) => (
                  <SidebarLink key={item.title} item={item} />
                ))}
                <LogoutButton />
              </>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
