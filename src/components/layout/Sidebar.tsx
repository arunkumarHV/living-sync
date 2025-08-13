import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Building2, Home, Users, Bed, CreditCard, MessageSquare, Package,
  ClipboardCheck, Megaphone, BarChart3, Settings, LogOut, ChevronDown,
  UserCheck, Wrench, FileText, Shield, Moon, Sun, Menu, X, 
  Calendar, BookOpen, Car, Bell, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';
import { Role } from '@/types/auth';

interface MenuItem {
  title: string;
  icon: any;
  path: string;
  roles: Role[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['Admin', 'Warden', 'Management', 'Student']
  },
  {
    title: 'Students',
    icon: Users,
    path: '/students',
    roles: ['Admin', 'Warden', 'Management'],
    children: [
      { title: 'All Students', icon: Users, path: '/students', roles: ['Admin', 'Management'] },
      { title: 'Student Onboarding', icon: UserCheck, path: '/students/onboarding', roles: ['Admin'] },
      { title: 'Block Students', icon: Users, path: '/students/block', roles: ['Warden'] }
    ]
  },
  {
    title: 'Rooms & Accommodation',
    icon: Bed,
    path: '/rooms',
    roles: ['Admin', 'Warden', 'Management', 'Student'],
    children: [
      { title: 'Room Management', icon: Bed, path: '/rooms', roles: ['Admin', 'Warden'] },
      { title: 'Room Allocation', icon: MapPin, path: '/rooms/allocation', roles: ['Admin'] },
      { title: 'My Room', icon: Bed, path: '/rooms/my-room', roles: ['Student'] },
      { title: 'Blueprint', icon: MapPin, path: '/rooms/blueprint', roles: ['Warden'] }
    ]
  },
  {
    title: 'Fees & Payments',
    icon: CreditCard,
    path: '/fees',
    roles: ['Admin', 'Management', 'Student'],
    children: [
      { title: 'Fee Management', icon: CreditCard, path: '/fees', roles: ['Admin', 'Management'] },
      { title: 'Pay Fees', icon: CreditCard, path: '/fees/pay', roles: ['Student'] },
      { title: 'Payment History', icon: FileText, path: '/fees/history', roles: ['Student'] }
    ]
  },
  {
    title: 'Requests',
    icon: MessageSquare,
    path: '/requests',
    roles: ['Admin', 'Warden', 'Student'],
    children: [
      { title: 'All Requests', icon: MessageSquare, path: '/requests', roles: ['Admin'] },
      { title: 'Block Requests', icon: MessageSquare, path: '/requests/block', roles: ['Warden'] },
      { title: 'Leave Request', icon: Calendar, path: '/requests/leave', roles: ['Student'] },
      { title: 'Room Change', icon: Bed, path: '/requests/room-change', roles: ['Student'] },
      { title: 'My Requests', icon: MessageSquare, path: '/requests/my-requests', roles: ['Student'] }
    ]
  },
  {
    title: 'Attendance',
    icon: ClipboardCheck,
    path: '/attendance',
    roles: ['Admin', 'Warden', 'Student'],
    children: [
      { title: 'QR/Biometric', icon: ClipboardCheck, path: '/attendance', roles: ['Admin', 'Warden'] },
      { title: 'My Attendance', icon: ClipboardCheck, path: '/attendance/my-attendance', roles: ['Student'] }
    ]
  },
  {
    title: 'Assets & Inventory',
    icon: Package,
    path: '/assets',
    roles: ['Admin', 'Student'],
    children: [
      { title: 'Asset Management', icon: Package, path: '/assets', roles: ['Admin'] },
      { title: 'My Assets', icon: Package, path: '/assets/my-assets', roles: ['Student'] }
    ]
  },
  {
    title: 'Maintenance',
    icon: Wrench,
    path: '/maintenance',
    roles: ['Admin', 'Warden'],
    children: [
      { title: 'All Tasks', icon: Wrench, path: '/maintenance', roles: ['Admin'] },
      { title: 'Assign Tasks', icon: Wrench, path: '/maintenance/assign', roles: ['Warden'] }
    ]
  },
  {
    title: 'Service Booking',
    icon: Calendar,
    path: '/services',
    roles: ['Admin', 'Warden', 'Student'],
    children: [
      { title: 'All Bookings', icon: Calendar, path: '/services', roles: ['Admin'] },
      { title: 'Handle Requests', icon: Calendar, path: '/services/handle', roles: ['Warden'] },
      { title: 'Book Service', icon: Calendar, path: '/services/book', roles: ['Student'] }
    ]
  },
  {
    title: 'Announcements',
    icon: Megaphone,
    path: '/announcements',
    roles: ['Admin', 'Warden', 'Student'],
    children: [
      { title: 'Post Global', icon: Megaphone, path: '/announcements', roles: ['Admin'] },
      { title: 'Post Block Notice', icon: Bell, path: '/announcements/block', roles: ['Warden'] },
      { title: 'View Announcements', icon: Megaphone, path: '/announcements/view', roles: ['Student'] }
    ]
  },
  {
    title: 'Visitors',
    icon: Car,
    path: '/visitors',
    roles: ['Student'],
    children: [
      { title: 'Pre-Approval', icon: Car, path: '/visitors', roles: ['Student'] }
    ]
  },
  {
    title: 'Complaints',
    icon: Shield,
    path: '/complaints',
    roles: ['Admin', 'Student'],
    children: [
      { title: 'All Complaints', icon: Shield, path: '/complaints', roles: ['Admin'] },
      { title: 'My Complaints', icon: Shield, path: '/complaints/my-complaints', roles: ['Student'] }
    ]
  },
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    path: '/reports',
    roles: ['Admin', 'Management'],
    children: [
      { title: 'AI Analytics', icon: BarChart3, path: '/reports', roles: ['Admin', 'Management'] },
      { title: 'Occupancy Reports', icon: FileText, path: '/reports/occupancy', roles: ['Admin', 'Management'] }
    ]
  }
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role as Role)
  );

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="gradient-hero p-2 rounded-lg shadow-glow">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg gradient-hero bg-clip-text text-transparent">
                  HostelHub
                </h1>
                <p className="text-xs text-muted-foreground">{user?.role} Portal</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredMenuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const filteredChildren = item.children?.filter(child => 
            child.roles.includes(user?.role as Role)
          );
          const isExpanded = expandedItems.includes(item.title);
          const isActive = isActiveRoute(item.path);

          return (
            <div key={item.title}>
              {hasChildren ? (
                <div>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-10 transition-all",
                      isActive && "bg-accent text-accent-foreground font-medium",
                      isCollapsed && "justify-center px-2"
                    )}
                    onClick={() => !isCollapsed && toggleExpanded(item.title)}
                  >
                    <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </>
                    )}
                  </Button>
                  
                  {!isCollapsed && isExpanded && filteredChildren && (
                    <div className="ml-4 mt-1 space-y-1">
                      {filteredChildren.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) => cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-all",
                            isActive 
                              ? "bg-primary text-primary-foreground font-medium shadow-soft" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          <child.icon className="h-4 w-4" />
                          <span>{child.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-soft" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className={cn(
            "w-full justify-start",
            isCollapsed && "justify-center px-2"
          )}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!isCollapsed && <span className="ml-3">{isDarkMode ? 'Light' : 'Dark'} Mode</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}