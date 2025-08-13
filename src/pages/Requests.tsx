import { useState } from 'react';
import { Plus, Search, Filter, Calendar, Bed, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Request {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  type: 'Leave' | 'Room Change' | 'Maintenance' | 'Service' | 'Other';
  title: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  submittedDate: string;
  processedDate?: string;
  processedBy?: string;
  response?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
}

const mockRequests: Request[] = [
  {
    id: '1',
    studentId: 'ST001',
    studentName: 'John Doe',
    roomNumber: 'A-101',
    type: 'Leave',
    title: 'Home Visit - Family Emergency',
    description: 'Need to visit home due to family emergency. Will be away for 5 days.',
    status: 'Pending',
    priority: 'High',
    submittedDate: '2024-04-01',
    fromDate: '2024-04-05',
    toDate: '2024-04-10',
    reason: 'Family Emergency'
  },
  {
    id: '2',
    studentId: 'ST002',
    studentName: 'Mike Smith',
    roomNumber: 'A-101',
    type: 'Room Change',
    title: 'Room Change Request',
    description: 'Would like to change to a single room due to study requirements.',
    status: 'Approved',
    priority: 'Medium',
    submittedDate: '2024-03-25',
    processedDate: '2024-03-28',
    processedBy: 'Admin',
    response: 'Approved. Single room A-205 will be allocated.'
  },
  {
    id: '3',
    studentId: 'ST003',
    studentName: 'Alice Johnson',
    roomNumber: 'B-201',
    type: 'Maintenance',
    title: 'AC Not Working',
    description: 'Air conditioning unit in room B-201 has stopped working.',
    status: 'In Progress',
    priority: 'Medium',
    submittedDate: '2024-04-02',
    processedDate: '2024-04-02',
    processedBy: 'Warden',
    response: 'Maintenance team assigned.'
  },
  {
    id: '4',
    studentId: 'ST004',
    studentName: 'David Wilson',
    roomNumber: 'C-301',
    type: 'Service',
    title: 'Laundry Service Booking',
    description: 'Request for weekly laundry service pickup.',
    status: 'Approved',
    priority: 'Low',
    submittedDate: '2024-03-30',
    processedDate: '2024-03-31',
    processedBy: 'Warden',
    response: 'Approved. Service will start from Monday.'
  }
];

export default function Requests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useLocalStorage<Request[]>('requests', mockRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'Leave' as const,
    title: '',
    description: '',
    priority: 'Medium' as const,
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const statuses = ['Pending', 'Approved', 'Rejected', 'In Progress'];
  const types = ['Leave', 'Room Change', 'Maintenance', 'Service', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const filteredRequests = requests.filter(request => {
    const isStudent = user?.role === 'Student';
    const matchesUser = isStudent ? request.studentName === user?.fullName : true;
    const isWarden = user?.role === 'Warden';
    const matchesBlock = isWarden ? request.roomNumber.startsWith('A') : true; // Assuming warden manages Block A
    
    return matchesUser && matchesBlock &&
      (request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === '' || request.status === selectedStatus) &&
      (selectedType === '' || request.type === selectedType);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success/10 text-success border-success/20';
      case 'Pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'Rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'High': return 'bg-warning/10 text-warning border-warning/20';
      case 'Medium': return 'bg-primary/10 text-primary border-primary/20';
      case 'Low': return 'bg-muted/10 text-muted-foreground border-muted/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4" />;
      case 'Rejected': return <XCircle className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'In Progress': return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: 'Approved' as const, 
            processedDate: new Date().toISOString().split('T')[0],
            processedBy: user?.role || 'Admin',
            response: 'Request approved by ' + user?.role
          }
        : request
    ));
    toast({
      title: "Request Approved",
      description: "The request has been approved successfully",
    });
  };

  const handleReject = (requestId: string) => {
    setRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: 'Rejected' as const, 
            processedDate: new Date().toISOString().split('T')[0],
            processedBy: user?.role || 'Admin',
            response: 'Request rejected by ' + user?.role
          }
        : request
    ));
    toast({
      title: "Request Rejected",
      description: "The request has been rejected",
    });
  };

  const handleSubmitRequest = () => {
    const request: Request = {
      id: (Date.now()).toString(),
      studentId: 'ST001',
      studentName: user?.fullName || 'Student',
      roomNumber: 'A-205', // Student's room
      type: newRequest.type,
      title: newRequest.title,
      description: newRequest.description,
      status: 'Pending',
      priority: newRequest.priority,
      submittedDate: new Date().toISOString().split('T')[0],
      fromDate: newRequest.fromDate,
      toDate: newRequest.toDate,
      reason: newRequest.reason
    };

    setRequests(prev => [request, ...prev]);
    setShowNewRequest(false);
    setNewRequest({
      type: 'Leave',
      title: '',
      description: '',
      priority: 'Medium',
      fromDate: '',
      toDate: '',
      reason: ''
    });

    toast({
      title: "Request Submitted",
      description: "Your request has been submitted successfully",
    });
  };

  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'Pending').length,
    approved: filteredRequests.filter(r => r.status === 'Approved').length,
    rejected: filteredRequests.filter(r => r.status === 'Rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === 'Student' ? 'My Requests' : 'Request Management'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'Student' 
              ? 'Submit and track your requests' 
              : 'Manage student requests and approvals'
            }
          </p>
        </div>
        {user?.role === 'Student' && (
          <Button onClick={() => setShowNewRequest(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* New Request Form */}
      {showNewRequest && user?.role === 'Student' && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Submit New Request</CardTitle>
            <CardDescription>Fill out the form below to submit your request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Request Type</label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newRequest.title}
                onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title for your request"
                className="mt-1"
              />
            </div>

            {newRequest.type === 'Leave' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">From Date</label>
                  <Input
                    type="date"
                    value={newRequest.fromDate}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, fromDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">To Date</label>
                  <Input
                    type="date"
                    value={newRequest.toDate}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, toDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of your request"
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSubmitRequest}>Submit Request</Button>
              <Button variant="outline" onClick={() => setShowNewRequest(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {user?.role !== 'Student' && (
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search requests..."
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
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="card-elevated hover:shadow-medium transition-all">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold">{request.title}</h3>
                    <Badge variant="outline">{request.studentName}</Badge>
                    <Badge variant="outline">{request.roomNumber}</Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </Badge>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Type: {request.type}</span>
                    <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                    {request.fromDate && request.toDate && (
                      <span>Duration: {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  {request.response && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">Response:</p>
                      <p className="text-sm text-muted-foreground">{request.response}</p>
                      {request.processedBy && request.processedDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By {request.processedBy} on {new Date(request.processedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {request.status === 'Pending' && (user?.role === 'Admin' || user?.role === 'Warden') && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(request.id)}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleReject(request.id)}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Reject
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