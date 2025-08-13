import { useState } from 'react';
import { Search, QrCode, Fingerprint, Calendar, CheckCircle, XCircle, Download, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Partial';
  method?: 'QR Code' | 'Biometric' | 'Manual';
  location?: string;
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    studentId: 'ST001',
    studentName: 'John Doe',
    roomNumber: 'A-101',
    date: '2024-04-01',
    checkIn: '21:45',
    checkOut: '06:30',
    status: 'Present',
    method: 'QR Code',
    location: 'Main Gate'
  },
  {
    id: '2',
    studentId: 'ST002',
    studentName: 'Mike Smith',
    roomNumber: 'A-101',
    date: '2024-04-01',
    checkIn: '23:15',
    status: 'Late',
    method: 'Biometric',
    location: 'Block A Entry'
  },
  {
    id: '3',
    studentId: 'ST003',
    studentName: 'Alice Johnson',
    roomNumber: 'B-201',
    date: '2024-04-01',
    status: 'Absent',
    method: 'Manual'
  },
  {
    id: '4',
    studentId: 'ST001',
    studentName: 'John Doe',
    roomNumber: 'A-101',
    date: '2024-03-31',
    checkIn: '22:00',
    checkOut: '07:00',
    status: 'Present',
    method: 'QR Code',
    location: 'Main Gate'
  }
];

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('attendance', mockAttendance);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  const statuses = ['Present', 'Absent', 'Late', 'Partial'];

  const filteredAttendance = attendance.filter(record => {
    const isStudent = user?.role === 'Student';
    const matchesUser = isStudent ? record.studentName === user?.fullName : true;
    const isWarden = user?.role === 'Warden';
    const matchesBlock = isWarden ? record.roomNumber.startsWith('A') : true; // Assuming warden manages Block A
    
    return matchesUser && matchesBlock &&
      record.date === selectedDate &&
      (record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       record.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === '' || record.status === selectedStatus);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-success/10 text-success border-success/20';
      case 'Absent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Late': return 'bg-warning/10 text-warning border-warning/20';
      case 'Partial': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle className="h-4 w-4" />;
      case 'Absent': return <XCircle className="h-4 w-4" />;
      case 'Late': return <Clock className="h-4 w-4" />;
      case 'Partial': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleQRScan = () => {
    // Simulate QR scan success
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentId: 'ST001',
      studentName: user?.fullName || 'Student',
      roomNumber: 'A-205',
      date: selectedDate,
      checkIn: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      status: 'Present',
      method: 'QR Code',
      location: 'Main Gate'
    };

    setAttendance(prev => [newRecord, ...prev]);
    setShowQRScanner(false);
    
    toast({
      title: "Attendance Recorded",
      description: "QR scan successful - attendance marked as present",
    });
  };

  const handleBiometricScan = () => {
    // Simulate biometric scan
    toast({
      title: "Biometric Scan",
      description: "Place your finger on the scanner",
    });
    
    setTimeout(() => {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        studentId: 'ST001',
        studentName: user?.fullName || 'Student',
        roomNumber: 'A-205',
        date: selectedDate,
        checkIn: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        status: 'Present',
        method: 'Biometric',
        location: 'Block A Entry'
      };

      setAttendance(prev => [newRecord, ...prev]);
      
      toast({
        title: "Attendance Recorded",
        description: "Biometric scan successful - attendance marked as present",
      });
    }, 2000);
  };

  const handleMarkAttendance = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    const existingRecord = attendance.find(r => r.studentId === studentId && r.date === selectedDate);
    
    if (existingRecord) {
      setAttendance(prev => prev.map(record => 
        record.id === existingRecord.id 
          ? { ...record, status, method: 'Manual' }
          : record
      ));
    } else {
      const student = attendance.find(r => r.studentId === studentId);
      if (student) {
        const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          studentId,
          studentName: student.studentName,
          roomNumber: student.roomNumber,
          date: selectedDate,
          status,
          method: 'Manual'
        };
        setAttendance(prev => [newRecord, ...prev]);
      }
    }

    toast({
      title: "Attendance Updated",
      description: `Marked as ${status.toLowerCase()}`,
    });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Student Name,Room,Date,Check In,Check Out,Status,Method,Location\n"
      + filteredAttendance.map(record => 
          `${record.studentName},${record.roomNumber},${record.date},${record.checkIn || ''},${record.checkOut || ''},${record.status},${record.method || ''},${record.location || ''}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Attendance data exported to CSV",
    });
  };

  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(r => r.status === 'Present').length,
    absent: filteredAttendance.filter(r => r.status === 'Absent').length,
    late: filteredAttendance.filter(r => r.status === 'Late').length
  };

  const attendancePercentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === 'Student' ? 'My Attendance' : 'Attendance Management'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'Student' 
              ? 'View your attendance records' 
              : 'Track and manage student attendance'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          {(user?.role === 'Admin' || user?.role === 'Warden') && (
            <div className="flex gap-2">
              <Button onClick={() => setShowQRScanner(true)} variant="outline">
                <QrCode className="mr-2 h-4 w-4" />
                QR Scanner
              </Button>
              <Button onClick={handleBiometricScan}>
                <Fingerprint className="mr-2 h-4 w-4" />
                Biometric
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <Card className="card-elevated border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Point your camera at the QR code to mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/20 h-64 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center space-y-2">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Camera viewfinder would appear here</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleQRScan}>Simulate Scan Success</Button>
              <Button variant="outline" onClick={() => setShowQRScanner(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">For selected date</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.present}</div>
            <p className="text-xs text-muted-foreground">{attendancePercentage}% attendance</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.absent}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.late}</div>
          </CardContent>
        </Card>
      </div>

      {/* Date Selection and Filters */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            {user?.role !== 'Student' && (
              <>
                <div className="flex-1">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background"
                  >
                    <option value="">All Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <div className="grid gap-4">
        {filteredAttendance.map((record) => (
          <Card key={record.id} className="card-elevated hover:shadow-medium transition-all">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold">{record.studentName}</h3>
                    <Badge variant="outline">{record.roomNumber}</Badge>
                    <Badge className={getStatusColor(record.status)}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1">{record.status}</span>
                    </Badge>
                    {record.method && (
                      <Badge variant="secondary">{record.method}</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Date: {new Date(record.date).toLocaleDateString()}</span>
                    {record.checkIn && (
                      <span>Check In: {record.checkIn}</span>
                    )}
                    {record.checkOut && (
                      <span>Check Out: {record.checkOut}</span>
                    )}
                    {record.location && (
                      <span>Location: {record.location}</span>
                    )}
                  </div>
                </div>

                {(user?.role === 'Admin' || user?.role === 'Warden') && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkAttendance(record.studentId, 'Present')}
                    >
                      Present
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkAttendance(record.studentId, 'Late')}
                    >
                      Late
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkAttendance(record.studentId, 'Absent')}
                    >
                      Absent
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}