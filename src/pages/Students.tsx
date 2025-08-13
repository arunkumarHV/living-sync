import { useState, useMemo } from 'react';
import { 
  Search, Filter, Download, Plus, Edit, Trash2, Eye, Mail, Phone,
  MapPin, Calendar, GraduationCap, User, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  room: string;
  block: string;
  course: string;
  year: number;
  status: 'Active' | 'Inactive' | 'Graduated';
  joinDate: string;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  avatar?: string;
}

// Mock student data
const mockStudents: Student[] = [
  {
    id: 'STU001',
    name: 'Alex Thompson',
    email: 'alex.thompson@student.edu',
    phone: '+1 234 567 8901',
    room: 'A-205',
    block: 'A',
    course: 'Computer Science',
    year: 2,
    status: 'Active',
    joinDate: '2023-08-15',
    feeStatus: 'Paid',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
  },
  {
    id: 'STU002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@student.edu',
    phone: '+1 234 567 8902',
    room: 'B-310',
    block: 'B',
    course: 'Mechanical Engineering',
    year: 3,
    status: 'Active',
    joinDate: '2022-08-20',
    feeStatus: 'Pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
  },
  {
    id: 'STU003',
    name: 'Michael Chen',
    email: 'michael.chen@student.edu',
    phone: '+1 234 567 8903',
    room: 'A-105',
    block: 'A',
    course: 'Business Administration',
    year: 1,
    status: 'Active',
    joinDate: '2024-01-10',
    feeStatus: 'Overdue',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael'
  },
  {
    id: 'STU004',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@student.edu',
    phone: '+1 234 567 8904',
    room: 'C-201',
    block: 'C',
    course: 'Biology',
    year: 4,
    status: 'Active',
    joinDate: '2021-08-25',
    feeStatus: 'Paid',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily'
  },
  {
    id: 'STU005',
    name: 'David Park',
    email: 'david.park@student.edu',
    phone: '+1 234 567 8905',
    room: 'B-405',
    block: 'B',
    course: 'Physics',
    year: 2,
    status: 'Inactive',
    joinDate: '2023-01-15',
    feeStatus: 'Pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
  }
];

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useLocalStorage('hostel_students', mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [blockFilter, setBlockFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.room.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBlock = blockFilter === 'all' || student.block === blockFilter;
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesFee = feeFilter === 'all' || student.feeStatus === feeFilter;
      
      // For Wardens, show only students from their assigned block
      if (user?.role === 'Warden' && user.blockAssigned) {
        return matchesSearch && matchesStatus && matchesFee && student.block === user.blockAssigned.split(' ')[1];
      }
      
      return matchesSearch && matchesBlock && matchesStatus && matchesFee;
    });
  }, [students, searchTerm, blockFilter, statusFilter, feeFilter, user]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Room', 'Block', 'Course', 'Year', 'Status', 'Fee Status'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.id,
        student.name,
        student.email,
        student.phone,
        student.room,
        student.block,
        student.course,
        student.year,
        student.status,
        student.feeStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Student data exported to CSV",
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter(s => s.id !== studentId));
    toast({
      title: "Student Removed",
      description: "Student has been removed from the system",
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-success text-success-foreground">{status}</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">{status}</Badge>;
      case 'Graduated':
        return <Badge className="bg-primary text-primary-foreground">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFeeBadge = (feeStatus: string) => {
    switch (feeStatus) {
      case 'Paid':
        return <Badge className="bg-success text-success-foreground">{feeStatus}</Badge>;
      case 'Pending':
        return <Badge className="bg-warning text-warning-foreground">{feeStatus}</Badge>;
      case 'Overdue':
        return <Badge className="bg-destructive text-destructive-foreground">{feeStatus}</Badge>;
      default:
        return <Badge variant="outline">{feeStatus}</Badge>;
    }
  };

  const canManage = user?.role === 'Admin' || user?.role === 'Warden';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === 'Warden' ? `Block ${user.blockAssigned?.split(' ')[1]} Students` : 'Students'}
          </h1>
          <p className="text-muted-foreground">
            Manage and track student information and enrollment
          </p>
        </div>
        
        {canManage && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((filteredStudents.filter(s => s.feeStatus === 'Paid').length / filteredStudents.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Fees collected this month
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Room utilization rate
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Fresh enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find students using various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {user?.role !== 'Warden' && (
              <Select value={blockFilter} onValueChange={setBlockFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blocks</SelectItem>
                  <SelectItem value="A">Block A</SelectItem>
                  <SelectItem value="B">Block B</SelectItem>
                  <SelectItem value="C">Block C</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={feeFilter} onValueChange={setFeeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Fee Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fees</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="card-elevated">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee Status</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3" />
                        {student.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-3 w-3" />
                        {student.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{student.room}</span>
                      <span className="ml-1 text-muted-foreground">({student.block})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.course}</div>
                      <div className="text-sm text-muted-foreground">Year {student.year}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>{getFeeBadge(student.feeStatus)}</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}