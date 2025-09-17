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
  Clock,
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
  Loader2
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';

interface ActivityTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedHours: number;
  sellingPrice: number;
  costPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PackageActivity {
  id: string;
  packageId: string;
  activityTemplateId: string;
  quantity: number;
  isIncluded: boolean;
  package: {
    name: string;
  };
  activityTemplate: {
    name: string;
    category: string;
    estimatedHours: number;
  };
}

export default function ActivitiesPage() {
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
  const [packageActivities, setPackageActivities] = useState<PackageActivity[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ActivityTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'WEBSITE',
    estimatedHours: 0,
    sellingPrice: 75,
    costPrice: undefined as number | undefined
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setIsLoadingActivities(true);
      
      try {
        await Promise.all([
          fetchActivityTemplates(),
          fetchPackageActivities()
        ]);
      } catch (error) {
        console.error('Failed to load activities data:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingActivities(false);
      }
    };

    loadData();
  }, []);

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

  const createTemplate = async () => {
    try {
      const response = await fetch('/api/admin/activity-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });

      if (response.ok) {
        setNewTemplate({ name: '', description: '', category: 'WEBSITE', estimatedHours: 0, sellingPrice: 75, costPrice: undefined });
        setIsCreateDialogOpen(false);
        fetchActivityTemplates();
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const updateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const response = await fetch(`/api/admin/activity-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate)
      });

      if (response.ok) {
        setEditingTemplate(null);
        setIsEditDialogOpen(false);
        fetchActivityTemplates();
      }
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze activiteit wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/admin/activity-templates/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchActivityTemplates();
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const openEditDialog = (template: ActivityTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
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

  const categories = [
    'WEBSITE', 'SOCIAL_MEDIA', 'EMAIL_MARKETING', 'DESIGN', 'CONTENT',
    'SEO', 'PAID_ADVERTISING', 'CONSULTING', 'TECHNICAL', 'ADMINISTRATION'
  ];

  // Filter activiteiten op basis van zoekterm en categorie
  const filteredActivityTemplates = activityTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !searchCategory || template.category === searchCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout 
      title="Activiteiten Beheer" 
      description="Beheer activiteitenlijsten en pakket samenstellingen"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Zoek in activiteiten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {/* Category Filter */}
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Alle categorieën</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <Button 
          className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe Activiteit
        </Button>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nieuwe Activiteit Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Website Onderhoud"
                />
              </div>
              <div>
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Beschrijving van de activiteit..."
                />
              </div>
              <div>
                <Label htmlFor="category">Categorie</Label>
                <select
                  id="category"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="estimatedHours">Geschatte Uren</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={newTemplate.estimatedHours || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, estimatedHours: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="sellingPrice">Verkoopprijs per Uur (€)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newTemplate.sellingPrice || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, sellingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="costPrice">Kostprijs per Uur (€)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newTemplate.costPrice ?? ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, costPrice: e.target.value === '' ? undefined : (parseFloat(e.target.value) || 0) })}
                />
              </div>
              <Button onClick={createTemplate} className="w-full">
                Activiteit Aanmaken
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Activity Templates */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Activiteit Templates ({filteredActivityTemplates.length} van {activityTemplates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
                          <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="text-lg text-gray-600">Activiteiten laden...</span>
            </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Naam</th>
                    <th className="text-left p-2">Categorie</th>
                    <th className="text-left p-2">Beschrijving</th>
                    <th className="text-left p-2">Uren</th>
                    <th className="text-left p-2">Prijs/uur</th>
                    <th className="text-left p-2">Kostprijs/uur</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivityTemplates.length > 0 ? (
                    filteredActivityTemplates.map((template) => (
                      <tr key={template.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{template.name}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(template.category)}
                            <Badge className={getCategoryColor(template.category)}>
                              {template.category.replace('_', ' ')}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-2 text-sm text-gray-600">{template.description}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            {template.estimatedHours}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <span className="text-green-600 font-medium">€{template.sellingPrice}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <span className="text-orange-600 font-medium">{template.costPrice != null ? `€${template.costPrice}` : '-'}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {template.isActive ? 'Actief' : 'Inactief'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(template)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Bewerken
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Verwijderen
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <p className="text-sm">
                            {searchTerm || searchCategory 
                              ? 'Geen activiteiten gevonden voor de gekozen criteria.' 
                              : 'Geen activiteiten gevonden.'}
                          </p>
                          {(searchTerm || searchCategory) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setSearchCategory('');
                              }}
                            >
                              Zoekopdracht wissen
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Activities Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Pakket Activiteiten Overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingActivities ? (
            <div className="flex items-center justify-center py-12">
                          <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="text-lg text-gray-600">Pakket activiteiten laden...</span>
            </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Pakket</th>
                    <th className="text-left p-2">Activiteit</th>
                    <th className="text-left p-2">Categorie</th>
                    <th className="text-left p-2">Aantal</th>
                    <th className="text-left p-2">Totaal Uren</th>
                  </tr>
                </thead>
                <tbody>
                  {packageActivities.map((packageActivity) => (
                    <tr key={packageActivity.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{packageActivity.package.name}</td>
                      <td className="p-2">{packageActivity.activityTemplate.name}</td>
                      <td className="p-2">
                        <Badge className={getCategoryColor(packageActivity.activityTemplate.category)}>
                          {packageActivity.activityTemplate.category.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-2">{packageActivity.quantity}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {(packageActivity.activityTemplate.estimatedHours * packageActivity.quantity).toFixed(1)}
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
            <DialogTitle>Activiteit Bewerken</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Naam</Label>
                <Input
                  id="edit-name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Beschrijving</Label>
                <Textarea
                  id="edit-description"
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categorie</Label>
                <select
                  id="edit-category"
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-hours">Geschatte Uren</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={editingTemplate.estimatedHours || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, estimatedHours: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-sellingPrice">Verkoopprijs per Uur (€)</Label>
                <Input
                  id="edit-sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingTemplate.sellingPrice || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, sellingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-costPrice">Kostprijs per Uur (€)</Label>
                <Input
                  id="edit-costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingTemplate.costPrice ?? ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate!, costPrice: e.target.value === '' ? undefined : (parseFloat(e.target.value) || 0) })}
                />
              </div>
              <Button onClick={updateTemplate} className="w-full">
                Activiteit Bijwerken
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 