import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, MapPin, Users, Bed } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Room {
  id: string;
  number: string;
  block: string;
  floor: number;
  type: 'Single' | 'Double' | 'Triple' | 'Quad';
  capacity: number;
  occupied: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  amenities: string[];
  assignedStudents: string[];
  rent: number;
}

const mockRooms: Room[] = [
  {
    id: '1',
    number: 'A-101',
    block: 'A',
    floor: 1,
    type: 'Double',
    capacity: 2,
    occupied: 2,
    status: 'Occupied',
    amenities: ['AC', 'Attached Bathroom', 'Wi-Fi', 'Study Table'],
    assignedStudents: ['John Doe', 'Mike Smith'],
    rent: 12000
  },
  {
    id: '2',
    number: 'A-102',
    block: 'A',
    floor: 1,
    type: 'Single',
    capacity: 1,
    occupied: 0,
    status: 'Available',
    amenities: ['AC', 'Attached Bathroom', 'Wi-Fi', 'Study Table'],
    assignedStudents: [],
    rent: 15000
  },
  {
    id: '3',
    number: 'B-201',
    block: 'B',
    floor: 2,
    type: 'Triple',
    capacity: 3,
    occupied: 1,
    status: 'Available',
    amenities: ['Fan', 'Common Bathroom', 'Wi-Fi', 'Study Table'],
    assignedStudents: ['Alice Johnson'],
    rent: 8000
  },
  {
    id: '4',
    number: 'A-205',
    block: 'A',
    floor: 2,
    type: 'Double',
    capacity: 2,
    occupied: 0,
    status: 'Maintenance',
    amenities: ['AC', 'Attached Bathroom', 'Wi-Fi', 'Study Table'],
    assignedStudents: [],
    rent: 12000
  }
];

export default function Rooms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useLocalStorage<Room[]>('rooms', mockRooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const blocks = ['A', 'B', 'C', 'D'];
  const statuses = ['Available', 'Occupied', 'Maintenance', 'Reserved'];

  const filteredRooms = rooms.filter(room => {
    return (
      (room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
       room.assignedStudents.some(student => 
         student.toLowerCase().includes(searchTerm.toLowerCase())
       )) &&
      (selectedBlock === '' || room.block === selectedBlock) &&
      (selectedStatus === '' || room.status === selectedStatus)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-success/10 text-success border-success/20';
      case 'Occupied': return 'bg-primary/10 text-primary border-primary/20';
      case 'Maintenance': return 'bg-warning/10 text-warning border-warning/20';
      case 'Reserved': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleAllocateRoom = (roomId: string) => {
    toast({
      title: "Room Allocation",
      description: "Room allocation dialog would open here",
    });
  };

  const handleRoomEdit = (roomId: string) => {
    toast({
      title: "Edit Room",
      description: "Room edit form would open here",
    });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Room Number,Block,Floor,Type,Capacity,Occupied,Status,Rent\n"
      + filteredRooms.map(room => 
          `${room.number},${room.block},${room.floor},${room.type},${room.capacity},${room.occupied},${room.status},${room.rent}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rooms.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Rooms data exported to CSV",
    });
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'Available').length,
    occupied: rooms.filter(r => r.status === 'Occupied').length,
    maintenance: rooms.filter(r => r.status === 'Maintenance').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">
            Manage hostel rooms and allocations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          {(user?.role === 'Admin') && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Bed className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <MapPin className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.available}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.occupied}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Bed className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search rooms or students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background"
            >
              <option value="">All Blocks</option>
              {blocks.map(block => (
                <option key={block} value={block}>Block {block}</option>
              ))}
            </select>
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
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="card-elevated hover:shadow-medium transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{room.number}</CardTitle>
                  <CardDescription>
                    Block {room.block} • Floor {room.floor} • {room.type}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(room.status)}>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Capacity:</span>
                <span className="font-medium">{room.occupied}/{room.capacity} students</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rent:</span>
                <span className="font-medium">₹{room.rent.toLocaleString()}/month</span>
              </div>
              
              {room.assignedStudents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Assigned Students:</p>
                  <div className="space-y-1">
                    {room.assignedStudents.map((student, index) => (
                      <Badge key={index} variant="outline" className="mr-1">
                        {student}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {user?.role === 'Admin' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleAllocateRoom(room.id)}
                    >
                      <Users className="mr-1 h-3 w-3" />
                      Allocate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRoomEdit(room.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </>
                )}
                {user?.role === 'Warden' && room.block === 'A' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleRoomEdit(room.id)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Manage
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}