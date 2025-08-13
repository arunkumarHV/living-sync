export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  fullName: string;
  avatar?: string;
  blockAssigned?: string; // For Wardens
  permissions: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export type Role = 'Admin' | 'Warden' | 'Management' | 'Student';

export const DUMMY_CREDENTIALS = {
  Admin: { username: 'admin', password: 'admin123' },
  Warden: { username: 'warden', password: 'warden123' },
  Management: { username: 'management', password: 'mgmt123' },
  Student: { username: 'student', password: 'student123' }
};

export const ROLE_PERMISSIONS = {
  Admin: [
    'students.manage', 'rooms.manage', 'fees.manage', 'complaints.manage',
    'assets.manage', 'attendance.manage', 'announcements.manage', 'reports.view',
    'analytics.view', 'requests.approve', 'maintenance.manage', 'staff.manage'
  ],
  Warden: [
    'students.view', 'students.manage_block', 'rooms.view', 'attendance.record',
    'requests.approve_block', 'maintenance.assign', 'announcements.block',
    'blueprint.view', 'service_booking.handle'
  ],
  Management: [
    'students.view', 'fees.view', 'occupancy.view', 'staff.view',
    'reports.view', 'analytics.view'
  ],
  Student: [
    'profile.view', 'profile.edit', 'room.view', 'assets.view',
    'requests.submit', 'attendance.view_self', 'fees.pay',
    'announcements.view', 'complaints.track', 'visitors.request'
  ]
};