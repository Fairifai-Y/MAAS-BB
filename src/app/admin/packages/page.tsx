'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus,
  Edit,
  Trash2,
  Package,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Share2,
  Mail,
  Image,
  Search,
  BarChart3,
  Users,
  Settings,
  Briefcase,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  ChevronDown
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';

interface ActivityTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedHours: number;
  isActive: boolean;
}

interface PackageActivity {
  id: string;
  packageId: string;
  activityTemplateId: string;
  quantity: number;
  isIncluded: boolean;
  activityTemplate: ActivityTemplate;
}

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
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
  const [packageActivities, setPackageActivities] = useState<PackageActivity[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; company: string; users: { name: string } }>>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBuilderDialogOpen, setIsBuilderDialogOpen] = useState(false);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editingPackageActivities, setEditingPackageActivities] = useState<Array<{ activityTemplateId: string; quantity: number }>>([]);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    maxHours: 0,
    price: 0
  });
  const [composeForm, setComposeForm] = useState({
    name: '',
    description: '',
    maxHours: 0,
    price: 0,
    customerId: '',
    activities: [] as Array<{ activityTemplateId: string; quantity: number }>
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchPackages(),
          fetchActivityTemplates(),
          fetchPackageActivities(),
          fetchCustomers()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
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
        setPackages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      setPackages([]);
    }
  };

  const fetchActivityTemplates = async () => {
    try {
      const response = await fetch('/api/admin/activity-templates');
      if (response.ok) {
        const data = await response.json();
        setActivityTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch activity templates:', error);
    }
  };

  const fetchPackageActivities = async () => {
    try {
      const response = await fetch('/api/admin/package-activities');
      if (response.ok) {
        const data = await response.json();
        setPackageActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch package activities:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
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
      // Update pakket met nieuwe prijs en max uren
      const updatedPackage = {
        ...editingPackage,
        price: calculatePriceFromActivities(editingPackageActivities),
        maxHours: calculateMaxHoursFromActivities(editingPackageActivities)
      };

      const response = await fetch(`/api/packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPackage)
      });

      if (response.ok) {
        // Update package activities
        for (const activity of editingPackageActivities) {
          if (activity.quantity > 0) {
            await fetch('/api/admin/package-activities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                packageId: editingPackage.id,
                activityTemplateId: activity.activityTemplateId,
                quantity: activity.quantity
              })
            });
          }
        }

        // Verwijder activiteiten met quantity 0
        const currentActivities = getPackageActivities(editingPackage.id);
        for (const currentActivity of currentActivities) {
          const shouldKeep = editingPackageActivities.find(
            ea => ea.activityTemplateId === currentActivity.activityTemplateId
          );
          if (!shouldKeep) {
            // Verwijder deze activiteit uit het pakket
            await fetch(`/api/admin/package-activities/${currentActivity.id}`, {
              method: 'DELETE'
            });
          }
        }

        setEditingPackage(null);
        setEditingPackageActivities([]);
        setIsEditDialogOpen(false);
        fetchPackages();
        fetchPackageActivities();
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

  const composePackage = async () => {
    if (!composeForm.customerId || !composeForm.name) {
      alert('Vul een klant en pakketnaam in');
      return;
    }

    // Bereken max uren en prijs dynamisch
    const calculatedMaxHours = composeForm.activities.reduce((sum, a) => {
      const activity = activityTemplates.find(at => at.id === a.activityTemplateId);
      return sum + ((activity?.estimatedHours || 0) * a.quantity);
    }, 0);

    const calculatedPrice = composeForm.activities.reduce((sum, a) => {
      const activity = activityTemplates.find(at => at.id === a.activityTemplateId);
      if (activity) {
        const hourlyRate = 50; // €50 per uur
        return sum + (activity.estimatedHours * a.quantity * hourlyRate);
      }
      return sum;
    }, 0);

    try {
      // Eerst het pakket aanmaken
      const packageResponse = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: composeForm.name,
          description: composeForm.description,
          maxHours: calculatedMaxHours,
          price: calculatedPrice
        })
      });

      if (packageResponse.ok) {
        const newPackage = await packageResponse.json();
        
        // Dan de klant-pakket koppeling maken
        const customerPackageResponse = await fetch('/api/admin/customer-packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: composeForm.customerId,
            packageId: newPackage.id,
            status: 'ACTIVE',
            startDate: new Date().toISOString()
          })
        });

        if (customerPackageResponse.ok) {
          // Dan de activiteiten toevoegen
          for (const activity of composeForm.activities) {
            if (activity.quantity > 0) {
              await fetch('/api/admin/package-activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  packageId: newPackage.id,
                  activityTemplateId: activity.activityTemplateId,
                  quantity: activity.quantity
                })
              });
            }
          }

          // Reset form en sluit dialog
          setComposeForm({
            name: '',
            description: '',
            maxHours: 0,
            price: 0,
            customerId: '',
            activities: []
          });
          setIsComposeDialogOpen(false);
          fetchPackages();
          fetchPackageActivities();
        }
      }
    } catch (error) {
      console.error('Failed to compose package:', error);
      alert('Fout bij het samenstellen van het pakket');
    }
  };

  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg);
    
    // Laad huidige activiteiten voor dit pakket
    const currentActivities = getPackageActivities(pkg.id);
    const activitiesForEdit = currentActivities.map(pa => ({
      activityTemplateId: pa.activityTemplateId,
      quantity: pa.quantity
    }));
    setEditingPackageActivities(activitiesForEdit);
    
    setIsEditDialogOpen(true);
  };

  const openBuilderDialog = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsBuilderDialogOpen(true);
  };

  const addActivityToCompose = (activityTemplateId: string, quantity: number) => {
    setComposeForm(prev => {
      const existingIndex = prev.activities.findIndex(a => a.activityTemplateId === activityTemplateId);
      if (existingIndex >= 0) {
        const newActivities = [...prev.activities];
        newActivities[existingIndex] = { activityTemplateId, quantity };
        return { ...prev, activities: newActivities };
      } else {
        return { ...prev, activities: [...prev.activities, { activityTemplateId, quantity }] };
      }
    });
  };

  const calculatePriceFromActivities = (activities: Array<{ activityTemplateId: string; quantity: number }>) => {
    return activities.reduce((total, activity) => {
      const template = activityTemplates.find(at => at.id === activity.activityTemplateId);
      if (template) {
        // Bereken prijs op basis van geschatte uren (bijvoorbeeld €50 per uur)
        const hourlyRate = 50;
        return total + (template.estimatedHours * activity.quantity * hourlyRate);
      }
      return total;
    }, 0);
  };

  const calculateCostFromActivities = (activities: Array<{ activityTemplateId: string; quantity: number }>) => {
    return activities.reduce((total, activity) => {
      const template = activityTemplates.find(at => at.id === activity.activityTemplateId);
      if (template) {
        // Bereken kostprijs op basis van gemiddeld uurtarief van €50 per uur
        const hourlyRate = 50;
        return total + (template.estimatedHours * activity.quantity * hourlyRate);
      }
      return total;
    }, 0);
  };

  const calculateMaxHoursFromActivities = (activities: Array<{ activityTemplateId: string; quantity: number }>) => {
    return activities.reduce((total, activity) => {
      const template = activityTemplates.find(at => at.id === activity.activityTemplateId);
      if (template) {
        return total + (template.estimatedHours * activity.quantity);
      }
      return total;
    }, 0);
  };

  const updateEditingPackageActivity = (activityTemplateId: string, quantity: number) => {
    console.log('Updating activity:', activityTemplateId, 'to quantity:', quantity);
    setEditingPackageActivities(prev => {
      const existingIndex = prev.findIndex(a => a.activityTemplateId === activityTemplateId);
      if (existingIndex >= 0) {
        if (quantity === 0) {
          // Verwijder activiteit als quantity 0 is
          const newActivities = prev.filter(a => a.activityTemplateId !== activityTemplateId);
          console.log('Removed activity, new state:', newActivities);
          return newActivities;
        } else {
          // Update bestaande activiteit
          const newActivities = [...prev];
          newActivities[existingIndex] = { activityTemplateId, quantity };
          console.log('Updated activity, new state:', newActivities);
          return newActivities;
        }
      } else if (quantity > 0) {
        // Voeg nieuwe activiteit toe
        const newActivities = [...prev, { activityTemplateId, quantity }];
        console.log('Added activity, new state:', newActivities);
        return newActivities;
      }
      return prev;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'WEBSITE': return <Globe className="w-4 h-4" />;
      case 'SOCIAL_MEDIA': return <Share2 className="w-4 h-4" />;
      case 'EMAIL_MARKETING': return <Mail className="w-4 h-4" />;
      case 'DESIGN': return <Image className="w-4 h-4" />;
      case 'CONTENT': return <FileText className="w-4 h-4" />;
      case 'SEO': return <Search className="w-4 h-4" />;
      case 'PAID_ADVERTISING': return <BarChart3 className="w-4 h-4" />;
      case 'CONSULTING': return <Users className="w-4 h-4" />;
      case 'TECHNICAL': return <Settings className="w-4 h-4" />;
      case 'ADMINISTRATION': return <Briefcase className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WEBSITE': return 'bg-blue-100 text-blue-800';
      case 'SOCIAL_MEDIA': return 'bg-purple-100 text-purple-800';
      case 'EMAIL_MARKETING': return 'bg-green-100 text-green-800';
      case 'DESIGN': return 'bg-pink-100 text-pink-800';
      case 'CONTENT': return 'bg-orange-100 text-orange-800';
      case 'SEO': return 'bg-yellow-100 text-yellow-800';
      case 'PAID_ADVERTISING': return 'bg-indigo-100 text-indigo-800';
      case 'CONSULTING': return 'bg-teal-100 text-teal-800';
      case 'TECHNICAL': return 'bg-gray-100 text-gray-800';
      case 'ADMINISTRATION': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageActivities = (packageId: string) => {
    return packageActivities.filter(pa => pa.packageId === packageId);
  };

  const groupActivitiesByCategory = () => {
    const grouped = activityTemplates.reduce((acc, activity) => {
      const category = activity.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(activity);
      return acc;
    }, {} as Record<string, ActivityTemplate[]>);
    
    return grouped;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const calculatePackageUsage = (packageId: string) => {
    const activities = getPackageActivities(packageId);
    const totalHours = activities.reduce((sum, pa) => {
      const hours = pa.activityTemplate?.estimatedHours ?? 0;
      return sum + (hours * pa.quantity);
    }, 0);
    const packageData = packages.find(p => p.id === packageId);
    const maxHours = packageData?.maxHours || 0;
    return maxHours > 0 ? (totalHours / maxHours) * 100 : 0;
  };

  const calculatePackageCost = (packageId: string) => {
    const activities = getPackageActivities(packageId);
    // Bereken kostprijs op basis van gemiddeld uurtarief van €50
    const averageHourlyRate = 50;
    const totalHours = activities.reduce((sum, pa) => {
      const hours = pa.activityTemplate?.estimatedHours ?? 0;
      return sum + (hours * pa.quantity);
    }, 0);
    return totalHours * averageHourlyRate;
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage <= 80) return { color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> };
    if (percentage <= 100) return { color: 'text-yellow-600', icon: <AlertCircle className="w-4 h-4" /> };
    return { color: 'text-red-600', icon: <AlertCircle className="w-4 h-4" /> };
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout 
      title="Pakketten Beheer" 
      description="Beheer en samenstellen van pakketten"
    >
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Zoek in pakketten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuw Pakket
          </Button>
          
          <Button 
            variant="outline" 
            className="border-amber-600 text-amber-600 hover:bg-amber-50"
            onClick={() => setIsComposeDialogOpen(true)}
          >
            <Package className="w-4 h-4 mr-2" />
            Pakket Samenstellen
          </Button>
        </div>
      </div>

      {/* Create Package Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nieuw Pakket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Naam</Label>
              <Input
                id="name"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                placeholder="Basis Pakket"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxHours">Max Uren</Label>
                <Input
                  id="maxHours"
                  type="number"
                  value={newPackage.maxHours || ''}
                  onChange={(e) => setNewPackage({ ...newPackage, maxHours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="price">Verkoopprijs</Label>
                <Input
                  id="price"
                  type="number"
                  value={newPackage.price || ''}
                  onChange={(e) => setNewPackage({ ...newPackage, price: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <Button onClick={createPackage} className="w-full">
              Pakket Aanmaken
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="text-lg text-gray-600">Pakketten laden...</span>
            </div>
          </div>
        ) : filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => {
            const usagePercentage = calculatePackageUsage(pkg.id);
            const usageStatus = getUsageStatus(usagePercentage);
            const activities = getPackageActivities(pkg.id);
            
            return (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openBuilderDialog(pkg)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <Badge className={pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {pkg.isActive ? 'Actief' : 'Inactief'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{pkg.maxHours}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{pkg.price}</span>
                      </div>
                    </div>

                    {/* Prijs en Kostprijs */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <span className="font-medium">Verkoopprijs</span>
                        </div>
                        <div className="text-lg font-bold text-green-800">{pkg.price}</div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-700">
                          <span className="font-medium">Kostprijs</span>
                        </div>
                        <div className="text-lg font-bold text-orange-800">{calculatePackageCost(pkg.id).toFixed(0)}</div>
                      </div>
                    </div>

                    {/* Winstmarge */}
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700 font-medium">Winstmarge</span>
                        <span className="text-blue-800 font-bold">
                          {(pkg.price - calculatePackageCost(pkg.id)).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-blue-600">
                        <span>Percentage</span>
                        <span>
                          {pkg.price > 0 ? ((pkg.price - calculatePackageCost(pkg.id)) / pkg.price * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Gebruik</span>
                        <span className={usageStatus.color}>{usagePercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {usageStatus.icon}
                        <span>{activities.length} activiteiten</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(pkg);
                        }}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Bewerken
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePackage(pkg.id);
                        }}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Verwijderen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen pakketten gevonden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Probeer een andere zoekterm.' : 'Er zijn nog geen pakketten toegevoegd.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Package Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pakket Bewerken</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <div className="space-y-6">
              {/* Package Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pakket Informatie</CardTitle>
                </CardHeader>
                <CardContent>
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
                  </div>
                </CardContent>
              </Card>

              {/* Activities Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activiteiten Beheren</CardTitle>
                  <p className="text-sm text-gray-600">
                    Voeg activiteiten toe of verwijder ze om de prijs en uren aan te passen
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(groupActivitiesByCategory()).map(([category, activities]) => {
                      const isExpanded = expandedCategories.has(category);
                      const selectedActivitiesInCategory = activities.filter(activity => 
                        (editingPackageActivities.find(a => a.activityTemplateId === activity.id)?.quantity || 0) > 0
                      );
                      
                      return (
                        <div key={category} className="border rounded-lg overflow-hidden">
                          {/* Categorie header */}
                          <div 
                            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleCategory(category)}
                          >
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(category)}
                              <div>
                                <h3 className="font-medium">{category.replace('_', ' ')}</h3>
                                <p className="text-sm text-gray-600">
                                  {selectedActivitiesInCategory.length} van {activities.length} activiteiten geselecteerd
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getCategoryColor(category)}>
                                {activities.length}
                              </Badge>
                              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                          
                          {/* Activiteiten lijst */}
                          {isExpanded && (
                            <div className="p-4 space-y-3">
                              {activities.map((activity) => {
                                const selectedActivity = editingPackageActivities.find(
                                  a => a.activityTemplateId === activity.id
                                );
                                
                                return (
                                  <div key={activity.id} className="p-4 border rounded-lg space-y-3">
                                    {/* Activiteit tekst sectie */}
                                    <div className="flex items-start space-x-3">
                                      {getCategoryIcon(activity.category)}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium">{activity.name}</h4>
                                        <p className="text-sm text-gray-600">{activity.description}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Uren en invullen aantal sectie */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-500">
                                        {activity.estimatedHours}h per stuk
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="text"
                                          value={selectedActivity?.quantity || 0}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const quantity = value === '' ? 0 : parseInt(value) || 0;
                                            console.log('Edit input changed to:', quantity);
                                            updateEditingPackageActivity(activity.id, quantity);
                                          }}
                                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center"
                                        />
                                        <span className="text-sm text-gray-500">stuks</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Samenvatting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Geselecteerde activiteiten:</span>
                      <span>{editingPackageActivities.filter(a => a.quantity > 0).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Totaal uren:</span>
                      <span className="font-bold">
                        {calculateMaxHoursFromActivities(editingPackageActivities)}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Berekende kostprijs:</span>
                      <span className="font-bold text-orange-600">
                        {calculateCostFromActivities(editingPackageActivities)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Huidige verkoopprijs:</span>
                      <span className="font-bold text-green-600">
                        {editingPackage.price}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Winstmarge:</span>
                      <span className={`font-bold ${editingPackage.price > calculateCostFromActivities(editingPackageActivities) ? 'text-blue-600' : 'text-red-600'}`}>
                        {(editingPackage.price - calculateCostFromActivities(editingPackageActivities)).toFixed(0)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      * Kostprijs wordt berekend op basis van €50 per uur
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={updatePackage} className="w-full">
                Pakket Bijwerken
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Package Builder Dialog */}
      <Dialog open={isBuilderDialogOpen} onOpenChange={setIsBuilderDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              {selectedPackage?.name} - Samenstellen
            </DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-6">
              {/* Package Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pakket Informatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Max Uren</Label>
                      <p className="text-lg font-bold">{selectedPackage.maxHours}h</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Prijs</Label>
                      <p className="text-lg font-bold">{selectedPackage.price}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activiteiten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(groupActivitiesByCategory()).map(([category, activities]) => {
                      const isExpanded = expandedCategories.has(category);
                      const selectedActivitiesInCategory = activities.filter(activity => {
                        const packageActivity = packageActivities.find(
                          pa => pa.packageId === selectedPackage.id && pa.activityTemplateId === activity.id
                        );
                        return (packageActivity?.quantity || 0) > 0;
                      });
                      
                      return (
                        <div key={category} className="border rounded-lg overflow-hidden">
                          {/* Categorie header */}
                          <div 
                            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleCategory(category)}
                          >
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(category)}
                              <div>
                                <h3 className="font-medium">{category.replace('_', ' ')}</h3>
                                <p className="text-sm text-gray-600">
                                  {selectedActivitiesInCategory.length} van {activities.length} activiteiten geselecteerd
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getCategoryColor(category)}>
                                {activities.length}
                              </Badge>
                              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                          
                          {/* Activiteiten lijst */}
                          {isExpanded && (
                            <div className="p-4 space-y-3">
                              {activities.map((activity) => {
                                const packageActivity = packageActivities.find(
                                  pa => pa.packageId === selectedPackage.id && pa.activityTemplateId === activity.id
                                );
                                
                                return (
                                  <div key={activity.id} className="p-4 border rounded-lg space-y-3">
                                    {/* Activiteit tekst sectie */}
                                    <div className="flex items-start space-x-3">
                                      {getCategoryIcon(activity.category)}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium">{activity.name}</h4>
                                        <p className="text-sm text-gray-600">{activity.description}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Uren en invullen aantal sectie */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-500">
                                        {activity.estimatedHours}h per stuk
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="text"
                                          value={packageActivity?.quantity || 0}
                                          onChange={async (e) => {
                                            const value = e.target.value;
                                            const quantity = value === '' ? 0 : parseInt(value) || 0;
                                            console.log('Builder input changed to:', quantity, 'for activity:', activity.name);
                                            
                                            // Update local state immediately for better UX
                                            const updatedPackageActivities = packageActivities.map(pa => 
                                              pa.packageId === selectedPackage.id && pa.activityTemplateId === activity.id
                                                ? { ...pa, quantity }
                                                : pa
                                            );
                                            setPackageActivities(updatedPackageActivities);
                                            
                                            try {
                                              const response = await fetch('/api/admin/package-activities', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                  packageId: selectedPackage.id,
                                                  activityTemplateId: activity.id,
                                                  quantity: quantity
                                                })
                                              });
                                              
                                              if (response.ok) {
                                                const result = await response.json();
                                                console.log('Builder update successful:', result);
                                                // Refresh data to ensure consistency
                                                await fetchPackageActivities();
                                              } else {
                                                const errorText = await response.text();
                                                console.error('Builder update failed:', response.status, errorText);
                                                // Revert on error
                                                await fetchPackageActivities();
                                              }
                                            } catch (error) {
                                              console.error('Failed to update package activity:', error);
                                              // Revert on error
                                              await fetchPackageActivities();
                                            }
                                          }}
                                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center"
                                        />
                                        <span className="text-sm text-gray-500">stuks</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Samenvatting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Totaal activiteiten:</span>
                      <span>{getPackageActivities(selectedPackage.id).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Totaal uren:</span>
                      <span>{getPackageActivities(selectedPackage.id).reduce((sum, pa) => {
                        const hours = pa.activityTemplate?.estimatedHours ?? 0;
                        return sum + (hours * pa.quantity);
                      }, 0)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gebruik:</span>
                      <span>{calculatePackageUsage(selectedPackage.id).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setIsBuilderDialogOpen(false)}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Opslaan & Sluiten
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsBuilderDialogOpen(false)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuleren
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Package Compose Dialog */}
      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Pakket Samenstellen
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Package Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pakket Informatie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="compose-name">Pakket Naam</Label>
                      <Input
                        id="compose-name"
                        value={composeForm.name}
                        onChange={(e) => setComposeForm({ ...composeForm, name: e.target.value })}
                        placeholder="Basis Pakket"
                      />
                    </div>
                    <div>
                      <Label htmlFor="compose-customer">Klant</Label>
                      <select
                        id="compose-customer"
                        value={composeForm.customerId}
                        onChange={(e) => setComposeForm({ ...composeForm, customerId: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Selecteer een klant</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.company} - {customer.users.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="compose-description">Beschrijving</Label>
                    <Textarea
                      id="compose-description"
                      value={composeForm.description}
                      onChange={(e) => setComposeForm({ ...composeForm, description: e.target.value })}
                      placeholder="Beschrijving van het pakket..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="compose-maxHours">Max Uren (Berekend)</Label>
                      <Input
                        id="compose-maxHours"
                        type="number"
                        value={composeForm.activities.reduce((sum, a) => {
                          const activity = activityTemplates.find(at => at.id === a.activityTemplateId);
                          return sum + ((activity?.estimatedHours || 0) * a.quantity);
                        }, 0)}
                        readOnly
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Automatisch berekend op basis van geselecteerde activiteiten</p>
                    </div>
                    <div>
                      <Label htmlFor="compose-price">Prijs (Berekend)</Label>
                      <Input
                        id="compose-price"
                        type="number"
                        value={composeForm.activities.reduce((sum, a) => {
                          const activity = activityTemplates.find(at => at.id === a.activityTemplateId);
                          if (activity) {
                            const hourlyRate = 50; // €50 per uur
                            return sum + (activity.estimatedHours * a.quantity * hourlyRate);
                          }
                          return sum;
                        }, 0)}
                        readOnly
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Automatisch berekend op basis van €50/uur</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activities Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activiteiten Selecteren</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityTemplates.map((activity) => {
                    const selectedActivity = composeForm.activities.find(
                      a => a.activityTemplateId === activity.id
                    );
                    
                    return (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(activity.category)}
                          <div>
                            <h4 className="font-medium">{activity.name}</h4>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <Badge className={getCategoryColor(activity.category)}>
                                {activity.category.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {activity.estimatedHours}h per stuk
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            value={selectedActivity?.quantity || 0}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value) || 0;
                              addActivityToCompose(activity.id, quantity);
                            }}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">stuks</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Samenvatting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Geselecteerde activiteiten:</span>
                    <span>{composeForm.activities.filter(a => a.quantity > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Totaal uren (Berekend):</span>
                    <span className="font-bold">
                      {composeForm.activities.reduce((sum, a) => {
                        const activity = activityTemplates.find(at => at.id === a.activityTemplateId);
                        return sum + ((activity?.estimatedHours || 0) * a.quantity);
                      }, 0)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Berekende kostprijs:</span>
                    <span className="font-bold text-orange-600">
                      €{composeForm.activities.reduce((sum, a) => {
                        const activity = activityTemplates.find(at => at.id === a.activityTemplateId);
                        if (activity) {
                          const hourlyRate = 50; // €50 per uur
                          return sum + (activity.estimatedHours * a.quantity * hourlyRate);
                        }
                        return sum;
                      }, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Klant:</span>
                    <span>
                      {customers.find(c => c.id === composeForm.customerId)?.company || 'Niet geselecteerd'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    * Kostprijs wordt berekend op basis van €50 per uur
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={composePackage}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                disabled={!composeForm.customerId || !composeForm.name}
              >
                <Save className="w-4 h-4 mr-2" />
                Pakket Samenstellen & Opslaan
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsComposeDialogOpen(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Annuleren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 