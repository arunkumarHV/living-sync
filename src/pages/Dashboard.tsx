import { 
  Users, Bed, CreditCard, AlertTriangle, TrendingUp, Calendar,
  Package, Wrench, Bell, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth';

interface DashboardCard {
  title: string;
  value: string;
  description: string;
  icon: any;
  trend?: string;
  color: 'primary' | 'success' | 'warning' | 'destructive';
}

const getDashboardData = (role: Role): DashboardCard[] => {
  const commonCards = {
    Admin: [
      {
        title: 'Total Students',
        value: '1,247',
        description: '+12% from last month',
        icon: Users,
        trend: '+12%',
        color: 'primary' as const
      },
      {
        title: 'Occupied Rooms',
        value: '892/1000',
        description: '89.2% occupancy rate',
        icon: Bed,
        trend: '+5%',
        color: 'success' as const
      },
      {
        title: 'Pending Fees',
        value: '₹2,45,000',
        description: '45 students pending',
        icon: CreditCard,
        color: 'warning' as const
      },
      {
        title: 'Active Complaints',
        value: '23',
        description: '8 resolved today',
        icon: AlertTriangle,
        color: 'destructive' as const
      }
    ],
    Warden: [
      {
        title: 'Block Students',
        value: '156',
        description: 'Block A assigned',
        icon: Users,
        color: 'primary' as const
      },
      {
        title: 'Today\'s Attendance',
        value: '142/156',
        description: '91% present',
        icon: CheckCircle,
        color: 'success' as const
      },
      {
        title: 'Pending Requests',
        value: '8',
        description: '3 room changes, 5 leave',
        icon: Clock,
        color: 'warning' as const
      },
      {
        title: 'Maintenance Tasks',
        value: '5',
        description: '2 completed today',
        icon: Wrench,
        color: 'primary' as const
      }
    ],
    Management: [
      {
        title: 'Total Revenue',
        value: '₹45.2L',
        description: 'This month',
        icon: TrendingUp,
        trend: '+8%',
        color: 'success' as const
      },
      {
        title: 'Occupancy Rate',
        value: '89.2%',
        description: 'Above target (85%)',
        icon: Bed,
        color: 'success' as const
      },
      {
        title: 'Staff Count',
        value: '45',
        description: '12 wardens, 33 support',
        icon: Users,
        color: 'primary' as const
      },
      {
        title: 'Satisfaction Score',
        value: '4.2/5',
        description: 'Based on 234 reviews',
        icon: TrendingUp,
        color: 'success' as const
      }
    ],
    Student: [
      {
        title: 'My Room',
        value: 'A-205',
        description: 'Block A, Floor 2',
        icon: Bed,
        color: 'primary' as const
      },
      {
        title: 'Fee Status',
        value: 'Paid',
        description: 'Next due: Apr 2024',
        icon: CheckCircle,
        color: 'success' as const
      },
      {
        title: 'Attendance',
        value: '95%',
        description: 'This month',
        icon: Calendar,
        color: 'success' as const
      },
      {
        title: 'Active Requests',
        value: '2',
        description: '1 pending, 1 approved',
        icon: Clock,
        color: 'warning' as const
      }
    ]
  };

  return commonCards[role] || [];
};

const getRecentActivities = (role: Role) => {
  const activities = {
    Admin: [
      { action: 'New student enrolled', time: '2 hours ago', type: 'success' },
      { action: 'Room change request approved', time: '4 hours ago', type: 'info' },
      { action: 'Maintenance task completed', time: '6 hours ago', type: 'success' },
      { action: 'Fee payment received', time: '1 day ago', type: 'success' }
    ],
    Warden: [
      { action: 'Attendance recorded', time: '1 hour ago', type: 'success' },
      { action: 'Leave request approved', time: '3 hours ago', type: 'info' },
      { action: 'Maintenance task assigned', time: '5 hours ago', type: 'warning' },
      { action: 'Block announcement posted', time: '1 day ago', type: 'info' }
    ],
    Management: [
      { action: 'Monthly report generated', time: '2 hours ago', type: 'success' },
      { action: 'Budget review completed', time: '1 day ago', type: 'info' },
      { action: 'Staff meeting scheduled', time: '2 days ago', type: 'warning' },
      { action: 'Policy update published', time: '3 days ago', type: 'info' }
    ],
    Student: [
      { action: 'Fee payment successful', time: '2 days ago', type: 'success' },
      { action: 'Room change request submitted', time: '5 days ago', type: 'warning' },
      { action: 'Laundry service booked', time: '1 week ago', type: 'info' },
      { action: 'Visitor pre-approval granted', time: '1 week ago', type: 'success' }
    ]
  };

  return activities[role] || [];
};

export default function Dashboard() {
  const { user } = useAuth();
  const dashboardData = getDashboardData(user?.role as Role);
  const recentActivities = getRecentActivities(user?.role as Role);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success':
        return 'text-success border-success/20 bg-success/5';
      case 'warning':
        return 'text-warning border-warning/20 bg-warning/5';
      case 'destructive':
        return 'text-destructive border-destructive/20 bg-destructive/5';
      default:
        return 'text-primary border-primary/20 bg-primary/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.fullName?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your {user?.role.toLowerCase()} portal today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData.map((card, index) => (
          <Card key={index} className="card-elevated transition-all hover:shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${getColorClasses(card.color)}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {card.trend && (
                  <span className="text-success font-medium">{card.trend}</span>
                )}
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest updates and actions in your portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-success' :
                      activity.type === 'warning' ? 'bg-warning' :
                      activity.type === 'error' ? 'bg-destructive' : 'bg-primary'
                    }`} />
                    <span className="text-sm">{activity.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used actions for your role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user?.role === 'Admin' && (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Add New Student
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bed className="mr-2 h-4 w-4" />
                  Allocate Room
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Post Announcement
                </Button>
              </>
            )}
            
            {user?.role === 'Warden' && (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Record Attendance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="mr-2 h-4 w-4" />
                  Assign Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Block Notice
                </Button>
              </>
            )}
            
            {user?.role === 'Management' && (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Financial Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Staff Management
                </Button>
              </>
            )}
            
            {user?.role === 'Student' && (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Fees
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Service
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Submit Request
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}