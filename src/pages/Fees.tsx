import { useState } from 'react';
import { Plus, Search, Download, CreditCard, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  feeType: 'Monthly' | 'Semester' | 'Annual' | 'Security Deposit' | 'Mess';
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  paymentMethod?: 'Online' | 'Cash' | 'Cheque' | 'UPI';
  transactionId?: string;
  penalty?: number;
}

const mockFees: FeeRecord[] = [
  {
    id: '1',
    studentId: 'ST001',
    studentName: 'John Doe',
    roomNumber: 'A-101',
    feeType: 'Monthly',
    amount: 12000,
    dueDate: '2024-04-01',
    paidDate: '2024-03-28',
    status: 'Paid',
    paymentMethod: 'UPI',
    transactionId: 'TXN123456789'
  },
  {
    id: '2',
    studentId: 'ST002',
    studentName: 'Mike Smith',
    roomNumber: 'A-101',
    feeType: 'Monthly',
    amount: 12000,
    dueDate: '2024-04-01',
    status: 'Pending'
  },
  {
    id: '3',
    studentId: 'ST003',
    studentName: 'Alice Johnson',
    roomNumber: 'B-201',
    feeType: 'Monthly',
    amount: 8000,
    dueDate: '2024-03-15',
    status: 'Overdue',
    penalty: 500
  },
  {
    id: '4',
    studentId: 'ST001',
    studentName: 'John Doe',
    roomNumber: 'A-101',
    feeType: 'Mess',
    amount: 4500,
    dueDate: '2024-04-05',
    paidDate: '2024-04-02',
    status: 'Paid',
    paymentMethod: 'Online',
    transactionId: 'TXN987654321'
  }
];

export default function Fees() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fees, setFees] = useLocalStorage<FeeRecord[]>('fees', mockFees);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState('');

  const statuses = ['Paid', 'Pending', 'Overdue', 'Partial'];
  const feeTypes = ['Monthly', 'Semester', 'Annual', 'Security Deposit', 'Mess'];

  const filteredFees = fees.filter(fee => {
    const isStudent = user?.role === 'Student';
    const matchesUser = isStudent ? fee.studentName === user?.fullName : true;
    
    return matchesUser &&
      (fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       fee.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === '' || fee.status === selectedStatus) &&
      (selectedFeeType === '' || fee.feeType === selectedFeeType);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-success/10 text-success border-success/20';
      case 'Pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'Overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Partial': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Overdue': return <AlertCircle className="h-4 w-4" />;
      case 'Partial': return <CreditCard className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handlePayFee = (feeId: string) => {
    setFees(prev => prev.map(fee => 
      fee.id === feeId 
        ? { ...fee, status: 'Paid' as const, paidDate: new Date().toISOString().split('T')[0], paymentMethod: 'UPI' as const, transactionId: `TXN${Date.now()}` }
        : fee
    ));
    toast({
      title: "Payment Successful",
      description: "Fee payment completed successfully",
    });
  };

  const handleSendReminder = (feeId: string) => {
    toast({
      title: "Reminder Sent",
      description: "Payment reminder sent to student",
    });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Student Name,Room,Fee Type,Amount,Due Date,Status,Payment Method,Transaction ID\n"
      + filteredFees.map(fee => 
          `${fee.studentName},${fee.roomNumber},${fee.feeType},${fee.amount},${fee.dueDate},${fee.status},${fee.paymentMethod || ''},${fee.transactionId || ''}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Fee records exported to CSV",
    });
  };

  const stats = {
    total: filteredFees.reduce((sum, fee) => sum + fee.amount + (fee.penalty || 0), 0),
    paid: filteredFees.filter(f => f.status === 'Paid').reduce((sum, fee) => sum + fee.amount, 0),
    pending: filteredFees.filter(f => f.status === 'Pending').reduce((sum, fee) => sum + fee.amount + (fee.penalty || 0), 0),
    overdue: filteredFees.filter(f => f.status === 'Overdue').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === 'Student' ? 'My Fees' : 'Fee Management'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'Student' 
              ? 'View and pay your hostel fees' 
              : 'Manage student fee payments and records'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          {user?.role === 'Admin' && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Fee Record
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{stats.paid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">₹{stats.pending.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {user?.role !== 'Student' && (
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by student name or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={selectedFeeType}
                onChange={(e) => setSelectedFeeType(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="">All Fee Types</option>
                {feeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Records */}
      <div className="grid gap-4">
        {filteredFees.map((fee) => (
          <Card key={fee.id} className="card-elevated hover:shadow-medium transition-all">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{fee.studentName}</h3>
                    <Badge variant="outline">{fee.roomNumber}</Badge>
                    <Badge className={getStatusColor(fee.status)}>
                      {getStatusIcon(fee.status)}
                      <span className="ml-1">{fee.status}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{fee.feeType} Fee</span>
                    <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                    {fee.paidDate && (
                      <span>Paid: {new Date(fee.paidDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  {fee.transactionId && (
                    <div className="text-xs text-muted-foreground">
                      Transaction ID: {fee.transactionId}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ₹{fee.amount.toLocaleString()}
                    </div>
                    {fee.penalty && (
                      <div className="text-sm text-destructive">
                        +₹{fee.penalty} penalty
                      </div>
                    )}
                    {fee.paymentMethod && (
                      <div className="text-xs text-muted-foreground">
                        via {fee.paymentMethod}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {fee.status === 'Pending' && user?.role === 'Student' && (
                      <Button onClick={() => handlePayFee(fee.id)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </Button>
                    )}
                    {fee.status !== 'Paid' && user?.role === 'Admin' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendReminder(fee.id)}
                      >
                        Send Reminder
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}