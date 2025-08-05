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
  Save,
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
  CheckCircle
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
}

export default function PackageBuilderPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
  const [packageActivities, setPackageActivities] = useState<PackageActivity[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    maxHours: 0,
    price: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchPackages(),
          fetchActivityTemplates(),
          fetchPackageActivities()
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
        setPackages(data);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'WEBSITE': return <Globe className="w-4 h-4" />;
      case 'SOCIAL_MEDIA': return <Share2 className="w-4 h-4" />;
      case 'EMAIL_MARKETING': return <Mail className="w-4 h-4" />;
      case 'DESIGN': return <Image className="w-4 h-4" />;
      case 'CONTENT': return <FileText className="w-4 h-4" />;
      case 'SEO': return <Search className="w-4 h-4" />;
      case 'ANALYTICS': return <BarChart3 className="w-4 h-4" />;
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
      case 'ANALYTICS': return 'bg-indigo-100 text-indigo-800';
      case 'CONSULTING': return 'bg-teal-100 text-teal-800';
      case 'TECHNICAL': return 'bg-gray-100 text-gray-800';
      case 'ADMINISTRATION': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageActivities = (packageId: string) => {
    return packageActivities.filter(pa => pa.packageId === packageId);
  };

  const calculatePackageUsage = (packageId: string) => {
    const activities = getPackageActivities(packageId);
    const totalHours = activities.reduce((sum, pa) => {
      return sum + (pa.activityTemplate.estimatedHours * pa.quantity);
    }, 0);
    
    const packageData = packages.find(p => p.id === packageId);
    if (!packageData) return { used: 0, total: 0, percentage: 0, freeHours: 0 };
    
    const percentage = (totalHours / packageData.maxHours) * 100;
    const freeHours = packageData.maxHours - totalHours;
    
    return {
      used: totalHours,
      total: packageData.maxHours,
      percentage: Math.min(percentage, 100),
      freeHours: Math.max(freeHours, 0)
    };
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage <= 80) return { color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" />, text: 'Optimaal' };
    if (percentage <= 95) return { color: 'text-yellow-600', icon: <AlertCircle className="w-4 h-4" />, text: 'Let op' };
    return { color: 'text-red-600', icon: <AlertCircle className="w-4 h-4" />, text: 'Overbelast' };
  };

  return (
    <AdminLayout 
      title="Pakket Samenstelling" 
      description="Stel M.A.A.S. pakketten samen met activiteiten (20% vrij voor diverse inzet)"
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

      {/* Package Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          packages.map((pkg) => {
            const usage = calculatePackageUsage(pkg.id);
            const status = getUsageStatus(usage.percentage);
            const activities = getPackageActivities(pkg.id);
            
            return (
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
                  <div className="space-y-4">
                    {/* Usage Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Tijdsgebruik</span>
                        <div className="flex items-center gap-1">
                          {status.icon}
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                      <Progress value={usage.percentage} className="mb-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{usage.used.toFixed(1)} / {usage.total} uren gebruikt</span>
                        <span>{usage.freeHours.toFixed(1)} uren vrij</span>
                      </div>
                    </div>

                    {/* Package Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-500 mr-1" />
                        <span>{usage.total} uren</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                        <span>€{pkg.price}</span>
                      </div>
                    </div>

                    {/* Activities Summary */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Activiteiten</span>
                        <span className="text-xs text-gray-500">{activities.length} items</span>
                      </div>
                      <div className="space-y-1">
                        {activities.slice(0, 3).map((pa) => (
                          <div key={pa.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(pa.activityTemplate.category)}
                              <span className="truncate">{pa.activityTemplate.name}</span>
                            </div>
                            <span className="text-gray-500">
                              {pa.quantity}x {(pa.activityTemplate.estimatedHours * pa.quantity).toFixed(1)}h
                            </span>
                          </div>
                        ))}
                        {activities.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{activities.length - 3} meer activiteiten
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Samenstellen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Package className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Package Builder Dialog */}
      {selectedPackage && (
        <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                {selectedPackage.name} - Activiteiten Samenstellen
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Package Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pakket Informatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Totaal Uren</Label>
                      <div className="text-xl font-bold">{selectedPackage.maxHours} uren</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Prijs</Label>
                      <div className="text-xl font-bold">€{selectedPackage.price}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{selectedPackage.description}</p>
                </CardContent>
              </Card>

              {/* Usage Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tijdsgebruik Overzicht</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const usage = calculatePackageUsage(selectedPackage.id);
                    const status = getUsageStatus(usage.percentage);
                    const targetHours = selectedPackage.maxHours * 0.8; // 80% target
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Huidig Gebruik</span>
                          <div className="flex items-center gap-1">
                            {status.icon}
                            <span className={`text-sm font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                        </div>
                        
                        <Progress value={usage.percentage} className="mb-2" />
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-amber-600">{usage.used.toFixed(1)}</div>
                            <div className="text-xs text-gray-500">Gebruikt</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{targetHours.toFixed(1)}</div>
                            <div className="text-xs text-gray-500">Doel (80%)</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{usage.freeHours.toFixed(1)}</div>
                            <div className="text-xs text-gray-500">Vrij (20%)</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Available Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Beschikbare Activiteiten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(template.category)}
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-600">{template.description}</div>
                            <Badge className={`mt-1 ${getCategoryColor(template.category)}`}>
                              {template.category.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-medium">{template.estimatedHours} uren</div>
                            <div className="text-xs text-gray-500">per activiteit</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Current Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Huidige Activiteiten</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const activities = getPackageActivities(selectedPackage.id);
                    
                    if (activities.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Nog geen activiteiten toegevoegd</p>
                          <p className="text-sm">Voeg activiteiten toe om het pakket samen te stellen</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        {activities.map((pa) => (
                          <div key={pa.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(pa.activityTemplate.category)}
                              <div>
                                <div className="font-medium">{pa.activityTemplate.name}</div>
                                <div className="text-sm text-gray-600">
                                  {pa.quantity}x {(pa.activityTemplate.estimatedHours * pa.quantity).toFixed(1)} uren
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">-</Button>
                              <span className="w-8 text-center">{pa.quantity}</span>
                              <Button size="sm" variant="outline">+</Button>
                              <Button size="sm" variant="outline" className="text-red-600">
                                <Package className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
} 