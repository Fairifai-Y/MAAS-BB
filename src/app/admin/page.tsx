'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  Clock, 
  DollarSign, 
  Plus,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  FileText,
  Loader2
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';

interface Package {
  id: string;
  name: string;
  description: string;
  maxHours: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalCustomers: number;
  totalPackages: number;
  totalHours: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingActivities: number;
}

export default function AdminDashboard() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalPackages: 0,
    totalHours: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingActivities: 0
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    maxHours: 0,
    price: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setIsLoadingStats(true);
      
      try {
        await Promise.all([
          fetchPackages(),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingStats(false);
      }
    };

    loadData();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setPackages(data);
        } else {
          console.error('API returned non-array data:', data);
          setPackages([]);
        }
      } else {
        console.error('Failed to fetch packages:', response.status);
        setPackages([]);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      setPackages([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status);
        setStats({
          totalCustomers: 0,
          totalPackages: 0,
          totalHours: 0,
          totalRevenue: 0,
          activeSubscriptions: 0,
          pendingActivities: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        totalCustomers: 0,
        totalPackages: 0,
        totalHours: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        pendingActivities: 0
      });
    }
  };

  const createPackage = async () => {
    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackage)
      });

      if (response.ok) {
        setNewPackage({ name: '', description: '', maxHours: 0, price: 0 });
        setIsCreateDialogOpen(false);
        fetchPackages();
      }
    } catch (error) {
      console.error('Failed to create package:', error);
    }
  };

  const updatePackage = async () => {
    if (!editingPackage) return;

    try {
      const response = await fetch(`/api/packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPackage)
      });

      if (response.ok) {
        setEditingPackage(null);
        setIsEditDialogOpen(false);
        fetchPackages();
      }
    } catch (error) {
      console.error('Failed to update package:', error);
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit pakket wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPackages();
      }
    } catch (error) {
      console.error('Failed to delete package:', error);
    }
  };

  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsEditDialogOpen(true);
  };

  return (
    <AdminLayout 
      title="M.A.A.S. Admin Dashboard" 
      description="Beheer je M.A.A.S. platform en pakketten"
    >
      {/* Header Actions */}
      <div className="flex justify-end mb-6">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nieuw Pakket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nieuw M.A.A.S. Pakket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                  placeholder="M.A.A.S. XS"
                />
              </div>
              <div>
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                  placeholder="Beschrijving van het pakket..."
                />
              </div>
              <div>
                <Label htmlFor="maxHours">Max Uren</Label>
                <Input
                  id="maxHours"
                  type="number"
                  min="1"
                  value={newPackage.maxHours || ''}
                  onChange={(e) => setNewPackage({ ...newPackage, maxHours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="price">Prijs (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPackage.price || ''}
                  onChange={(e) => setNewPackage({ ...newPackage, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <Button onClick={createPackage} className="w-full">
                Pakket Aanmaken
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Klanten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalCustomers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Actieve klanten
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Pakketten</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalPackages || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Beschikbare pakketten
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Uren</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalHours || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Uren deze maand
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Omzet</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">€{stats.totalRevenue || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Deze maand
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Abonnementen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.activeSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Lopende abonnementen
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wachtende Activiteiten</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.pendingActivities || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Te verwerken
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            M.A.A.S. Pakketten ({Array.isArray(packages) ? packages.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
                          <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="text-lg text-gray-600">Pakketten laden...</span>
            </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Naam</th>
                    <th className="text-left p-2">Beschrijving</th>
                    <th className="text-left p-2">Max Uren</th>
                    <th className="text-left p-2">Prijs</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(packages) && packages.map((pkg) => (
                    <tr key={pkg.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{pkg.name}</td>
                      <td className="p-2 text-sm text-gray-600">{pkg.description}</td>
                      <td className="p-2">{pkg.maxHours}</td>
                      <td className="p-2">€{pkg.price}</td>
                      <td className="p-2">
                        <Badge className={pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {pkg.isActive ? 'Actief' : 'Inactief'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(pkg)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Bewerken
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePackage(pkg.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Verwijderen
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pakket Bewerken</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Naam</Label>
                <Input
                  id="edit-name"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Beschrijving</Label>
                <Textarea
                  id="edit-description"
                  value={editingPackage.description}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-maxHours">Max Uren</Label>
                <Input
                  id="edit-maxHours"
                  type="number"
                  min="1"
                  value={editingPackage.maxHours || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, maxHours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Prijs (€)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingPackage.price || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={updatePackage} className="flex-1">
                  Opslaan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Annuleren
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 