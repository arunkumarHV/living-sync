import { useState } from 'react';
import { Plus, Search, Package, Monitor, Bed, ChefHat, Wrench, Download, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Asset {
  id: string;
  name: string;
  category: 'Furniture' | 'Electronics' | 'Appliances' | 'Infrastructure' | 'Safety' | 'Other';
  assetId: string;
  assignedTo?: string;
  roomNumber?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry?: string;
  maintenanceSchedule?: string;
  status: 'Available' | 'Assigned' | 'Maintenance' | 'Disposed';
  description?: string;
}

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Study Table',
    category: 'Furniture',
    assetId: 'FUR-001',
    assignedTo: 'John Doe',
    roomNumber: 'A-101',
    condition: 'Good',
    purchaseDate: '2023-01-15',
    purchasePrice: 5000,
    status: 'Assigned',
    description: 'Wooden study table with drawer'
  },
  {
    id: '2',
    name: 'LCD TV 32"',
    category: 'Electronics',
    assetId: 'ELE-001',
    roomNumber: 'Common Room A',
    condition: 'Excellent',
    purchaseDate: '2023-06-20',
    purchasePrice: 25000,
    warrantyExpiry: '2025-06-20',
    status: 'Assigned',
    description: 'Samsung 32 inch LED TV for common room'
  },
  {
    id: '3',
    name: 'Air Conditioner',
    category: 'Appliances',
    assetId: 'APP-001',
    assignedTo: 'Mike Smith',
    roomNumber: 'A-101',
    condition: 'Fair',
    purchaseDate: '2022-03-10',
    purchasePrice: 35000,
    warrantyExpiry: '2025-03-10',
    maintenanceSchedule: 'Quarterly',
    status: 'Maintenance',
    description: '1.5 ton split AC'
  },
  {
    id: '4',
    name: 'Bed Frame',
    category: 'Furniture',
    assetId: 'FUR-002',
    assignedTo: 'Alice Johnson',
    roomNumber: 'B-201',
    condition: 'Good',
    purchaseDate: '2023-02-01',
    purchasePrice: 8000,
    status: 'Assigned',
    description: 'Metal bed frame with mattress'
  },
  {
    id: '5',
    name: 'Fire Extinguisher',
    category: 'Safety',
    assetId: 'SAF-001',
    roomNumber: 'Block A Corridor',
    condition: 'Excellent',
    purchaseDate: '2023-08-15',
    purchasePrice: 2500,
    maintenanceSchedule: 'Monthly',
    status: 'Available',
    description: 'ABC type fire extinguisher'
  }
];

export default function Assets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useLocalStorage<Asset[]>('assets', mockAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  const categories = ['Furniture', 'Electronics', 'Appliances', 'Infrastructure', 'Safety', 'Other'];
  const statuses = ['Available', 'Assigned', 'Maintenance', 'Disposed'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

  const filteredAssets = assets.filter(asset => {
    const isStudent = user?.role === 'Student';
    const matchesUser = isStudent ? asset.assignedTo === user?.fullName : true;
    
    return matchesUser &&
      (asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (selectedCategory === '' || asset.category === selectedCategory) &&
      (selectedStatus === '' || asset.status === selectedStatus) &&
      (selectedCondition === '' || asset.condition === selectedCondition);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-success/10 text-success border-success/20';
      case 'Assigned': return 'bg-primary/10 text-primary border-primary/20';
      case 'Maintenance': return 'bg-warning/10 text-warning border-warning/20';
      case 'Disposed': return 'bg-muted/10 text-muted-foreground border-muted/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'bg-success/10 text-success border-success/20';
      case 'Good': return 'bg-primary/10 text-primary border-primary/20';
      case 'Fair': return 'bg-warning/10 text-warning border-warning/20';
      case 'Poor': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Damaged': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Furniture': return <Bed className="h-4 w-4" />;
      case 'Electronics': return <Monitor className="h-4 w-4" />;
      case 'Appliances': return <ChefHat className="h-4 w-4" />;
      case 'Safety': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleAssetEdit = (assetId: string) => {
    toast({
      title: "Edit Asset",
      description: "Asset edit form would open here",
    });
  };

  const handleAssetDelete = (assetId: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== assetId));
    toast({
      title: "Asset Deleted",
      description: "Asset has been removed from inventory",
    });
  };

  const handleMaintenanceRequest = (assetId: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, status: 'Maintenance' as const }
        : asset
    ));
    toast({
      title: "Maintenance Requested",
      description: "Asset maintenance request has been submitted",
    });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Asset ID,Name,Category,Assigned To,Room,Condition,Status,Purchase Date,Price\n"
      + filteredAssets.map(asset => 
          `${asset.assetId},${asset.name},${asset.category},${asset.assignedTo || ''},${asset.roomNumber || ''},${asset.condition},${asset.status},${asset.purchaseDate},${asset.purchasePrice}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "assets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Asset inventory exported to CSV",
    });
  };

  const stats = {
    total: assets.length,
    assigned: assets.filter(a => a.status === 'Assigned').length,
    available: assets.filter(a => a.status === 'Available').length,
    maintenance: assets.filter(a => a.status === 'Maintenance').length,
    totalValue: assets.reduce((sum, asset) => sum + asset.purchasePrice, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === 'Student' ? 'My Assets' : 'Asset Management'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'Student' 
              ? 'View your assigned assets and request maintenance' 
              : 'Manage hostel assets and inventory'
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
              Add Asset
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.assigned}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.available}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.maintenance}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
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
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
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
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="card-elevated hover:shadow-medium transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getCategoryIcon(asset.category)}
                    {asset.name}
                  </CardTitle>
                  <CardDescription>
                    {asset.assetId} • {asset.category}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                  <Badge className={getConditionColor(asset.condition)}>
                    {asset.condition}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {asset.assignedTo && (
                  <div className="flex justify-between">
                    <span>Assigned to:</span>
                    <span className="font-medium">{asset.assignedTo}</span>
                  </div>
                )}
                {asset.roomNumber && (
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{asset.roomNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Purchase Date:</span>
                  <span className="font-medium">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Value:</span>
                  <span className="font-medium">₹{asset.purchasePrice.toLocaleString()}</span>
                </div>
                {asset.warrantyExpiry && (
                  <div className="flex justify-between">
                    <span>Warranty:</span>
                    <span className={`font-medium ${new Date(asset.warrantyExpiry) < new Date() ? 'text-destructive' : 'text-success'}`}>
                      {new Date(asset.warrantyExpiry).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {asset.maintenanceSchedule && (
                  <div className="flex justify-between">
                    <span>Maintenance:</span>
                    <span className="font-medium">{asset.maintenanceSchedule}</span>
                  </div>
                )}
              </div>

              {asset.description && (
                <div className="text-sm text-muted-foreground border-t pt-2">
                  {asset.description}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {user?.role === 'Student' && asset.status === 'Assigned' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleMaintenanceRequest(asset.id)}
                  >
                    <Wrench className="mr-1 h-3 w-3" />
                    Request Maintenance
                  </Button>
                )}
                
                {user?.role === 'Admin' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAssetEdit(asset.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleAssetDelete(asset.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}