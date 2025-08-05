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
  Plus,
  Edit,
  Trash2,
  Package,
  Clock,
  DollarSign,
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

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        await fetchPackages();
      } catch (error) {
        console.error('Failed to load packages data:', error);
      } finally {
        setIsLoading(false);
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
      title="Pakketten Beheer" 
      description="Beheer M.A.A.S. pakketten en prijzen"
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

      {/* Packages Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          Array.isArray(packages) && packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      {pkg.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                  </div>
                  <Badge className={pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {pkg.isActive ? 'Actief' : 'Inactief'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Max Uren:</span>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="font-medium">{pkg.maxHours}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prijs:</span>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="font-medium">€{pkg.price}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(pkg)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Bewerken
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePackage(pkg.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Alle Pakketten ({Array.isArray(packages) ? packages.length : 0})
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
                      <td className="p-2">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-500 mr-1" />
                          {pkg.maxHours}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                          €{pkg.price}
                        </div>
                      </td>
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