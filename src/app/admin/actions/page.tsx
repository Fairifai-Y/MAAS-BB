'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckSquare, 
  Clock, 
  User, 
  Building2, 
  Search, 
  Filter,
  Loader2,
  Edit,
  Save,
  X,
  Trash2,
  Plus,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';

interface Action {
  id: string;
  title: string;
  description: string | null;
  plannedHours: number;
  actualHours: number | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  activity: {
    id: string;
    description: string;
    customer_packages: {
      customers: {
        company: string;
        users: {
          name: string;
          email: string;
        };
      };
    };
  };
  owner: {
    id: string;
    users: {
      name: string;
      email: string;
    };
  };
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [packageActivities, setPackageActivities] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [deletingAction, setDeletingAction] = useState<Action | null>(null);
  const [createForm, setCreateForm] = useState({
    packageActivityId: '',
    ownerId: '',
    title: '',
    description: '',
    plannedHours: '',
    actualHours: '',
    status: 'PLANNED',
    dueDate: ''
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    plannedHours: '',
    actualHours: '',
    status: 'PLANNED',
    dueDate: '',
    completedAt: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [actionsResponse, packageActivitiesResponse, employeesResponse] = await Promise.all([
        fetch('/api/admin/actions'),
        fetch('/api/admin/package-activities-dropdown'),
        fetch('/api/admin/employees')
      ]);

      if (actionsResponse.ok) {
        const actionsData = await actionsResponse.json();
        setActions(actionsData);
      }

      if (packageActivitiesResponse.ok) {
        const packageActivitiesData = await packageActivitiesResponse.json();
        setPackageActivities(packageActivitiesData);
      }

      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActions = actions.filter(action => {
    const matchesSearch = 
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.activity.customer_packages.customers.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.owner.users.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || action.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'Gepland';
      case 'IN_PROGRESS': return 'In Uitvoering';
      case 'COMPLETED': return 'Voltooid';
      case 'CANCELLED': return 'Geannuleerd';
      default: return 'Onbekend';
    }
  };

  const openCreateDialog = () => {
    setCreateForm({
      packageActivityId: '',
      ownerId: '',
      title: '',
      description: '',
      plannedHours: '',
      actualHours: '',
      status: 'PLANNED',
      dueDate: ''
    });
    setIsCreateDialogOpen(true);
  };

  const handlePackageActivityChange = (packageActivityId: string) => {
    setCreateForm({ ...createForm, packageActivityId });
    
    // Find the selected package activity and auto-fill planned hours
    if (packageActivityId) {
      const selectedPackageActivity = packageActivities.find(pa => pa.id === packageActivityId);
      if (selectedPackageActivity) {
        setCreateForm(prev => ({
          ...prev,
          packageActivityId,
          plannedHours: String(selectedPackageActivity.estimatedHours || 1),
          title: selectedPackageActivity.activityName || '',
          description: selectedPackageActivity.description || ''
        }));
      }
    }
  };

  const createAction = async () => {
    try {
      const response = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Action created successfully:', result);
        setIsCreateDialogOpen(false);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Fout bij aanmaken: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Error creating action:', error);
      alert('Netwerkfout bij aanmaken van actie');
    }
  };

  const openEditDialog = (action: Action) => {
    setEditingAction(action);
    setEditForm({
      title: action.title,
      description: action.description || '',
      plannedHours: String(action.plannedHours),
      actualHours: action.actualHours ? String(action.actualHours) : '',
      status: action.status,
      dueDate: action.dueDate ? action.dueDate.split('T')[0] : '',
      completedAt: action.completedAt ? action.completedAt.split('T')[0] : ''
    });
    setIsEditDialogOpen(true);
  };

  const updateAction = async () => {
    if (!editingAction) return;

    try {
      const response = await fetch(`/api/admin/actions/${editingAction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Action updated successfully:', result);
        setEditingAction(null);
        setIsEditDialogOpen(false);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Fout bij bijwerken: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Error updating action:', error);
      alert('Netwerkfout bij bijwerken van actie');
    }
  };

  const openDeleteDialog = (action: Action) => {
    setDeletingAction(action);
    setIsDeleteDialogOpen(true);
  };

  const deleteAction = async () => {
    if (!deletingAction) return;

    try {
      const response = await fetch(`/api/admin/actions/${deletingAction.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Action deleted successfully:', result);
        setDeletingAction(null);
        setIsDeleteDialogOpen(false);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Fout bij verwijderen: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Error deleting action:', error);
      alert('Netwerkfout bij verwijderen van actie');
    }
  };

  return (
    <AdminLayout 
      title="Acties" 
      description="Beheer van acties gekoppeld aan activiteiten"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="text-lg text-gray-600">Data laden...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Acties</h1>
              <p className="text-gray-600">Beheer acties gekoppeld aan activiteiten</p>
            </div>
            <Button onClick={openCreateDialog} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Actie
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Zoek in acties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Alle Statussen</option>
              <option value="PLANNED">Gepland</option>
              <option value="IN_PROGRESS">In Uitvoering</option>
              <option value="COMPLETED">Voltooid</option>
              <option value="CANCELLED">Geannuleerd</option>
            </select>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActions.map((action) => (
              <Card key={action.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                                     <div className="flex justify-between items-start">
                     <CardTitle className="text-lg">{action.title}</CardTitle>
                     <div className="flex items-center space-x-2">
                       <Badge className={getStatusColor(action.status)}>
                         {getStatusText(action.status)}
                       </Badge>
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => openEditDialog(action)}
                         className="h-8 w-8 p-0"
                       >
                         <Edit className="w-3 h-3" />
                       </Button>
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => openDeleteDialog(action)}
                         className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         <Trash2 className="w-3 h-3" />
                       </Button>
                     </div>
                   </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {action.description && (
                      <div className="text-sm text-gray-600">
                        {action.description}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="w-4 h-4 mr-2" />
                      <span>{action.activity.customer_packages.customers.company}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>Owner: {action.owner.users.name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="w-4 h-4 mr-2" />
                      <span>Gepland: {action.plannedHours}h</span>
                    </div>
                    
                    {action.actualHours && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckSquare className="w-4 h-4 mr-2" />
                        <span>Werkelijk: {action.actualHours}h</span>
                      </div>
                    )}
                    
                    {action.dueDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Deadline: {new Date(action.dueDate).toLocaleDateString('nl-NL')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredActions.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen acties gevonden</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'ALL' ? 'Probeer andere zoekcriteria.' : 'Er zijn nog geen acties toegevoegd.'}
              </p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>📊 Samenvatting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{actions.length}</div>
                    <div className="text-sm text-gray-600">Totaal Acties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {actions.filter(a => a.status === 'IN_PROGRESS').length}
                    </div>
                    <div className="text-sm text-gray-600">In Uitvoering</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {actions.filter(a => a.status === 'COMPLETED').length}
                    </div>
                    <div className="text-sm text-gray-600">Voltooid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {actions.reduce((sum, a) => sum + Number(a.plannedHours), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Totaal Geplande Uren</div>
                  </div>
                </div>
              </CardContent>
            </Card>
                     </div>
         </>
       )}

       {/* Create Action Dialog */}
       <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
         <DialogContent className="sm:max-w-[500px]">
           <DialogHeader>
             <DialogTitle>Nieuwe Actie</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label htmlFor="packageActivity">Pakket Activiteit</Label>
               <select
                 id="packageActivity"
                 value={createForm.packageActivityId}
                 onChange={(e) => handlePackageActivityChange(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
               >
                 <option value="">Selecteer pakket activiteit</option>
                 {packageActivities.map((packageActivity) => (
                   <option key={packageActivity.id} value={packageActivity.id}>
                     {packageActivity.displayName}
                   </option>
                 ))}
               </select>
             </div>
             
             <div>
               <Label htmlFor="owner">Owner</Label>
               <select
                 id="owner"
                 value={createForm.ownerId}
                 onChange={(e) => setCreateForm({ ...createForm, ownerId: e.target.value })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
               >
                 <option value="">Selecteer owner</option>
                 {employees.map((employee) => (
                   <option key={employee.id} value={employee.id}>
                     {employee.users.name}
                   </option>
                 ))}
               </select>
             </div>
             
             <div>
               <Label htmlFor="title">Titel</Label>
               <Input
                 id="title"
                 value={createForm.title}
                 onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
               />
             </div>
             
             <div>
               <Label htmlFor="description">Beschrijving</Label>
               <Textarea
                 id="description"
                 value={createForm.description}
                 onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
               />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="plannedHours">Geplande Uren</Label>
                 <Input
                   id="plannedHours"
                   type="number"
                   step="0.5"
                   value={createForm.plannedHours}
                   onChange={(e) => setCreateForm({ ...createForm, plannedHours: e.target.value })}
                 />
               </div>
               <div>
                 <Label htmlFor="actualHours">Werkelijke Uren</Label>
                 <Input
                   id="actualHours"
                   type="number"
                   step="0.5"
                   value={createForm.actualHours}
                   onChange={(e) => setCreateForm({ ...createForm, actualHours: e.target.value })}
                 />
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="status">Status</Label>
                 <select
                   id="status"
                   value={createForm.status}
                   onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                 >
                   <option value="PLANNED">Gepland</option>
                   <option value="IN_PROGRESS">In Uitvoering</option>
                   <option value="COMPLETED">Voltooid</option>
                   <option value="CANCELLED">Geannuleerd</option>
                 </select>
               </div>
               <div>
                 <Label htmlFor="dueDate">Deadline</Label>
                 <Input
                   id="dueDate"
                   type="date"
                   value={createForm.dueDate}
                   onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                 />
               </div>
             </div>
             
             <div className="flex gap-2 pt-4">
               <Button onClick={createAction} className="flex-1">
                 <Save className="w-4 h-4 mr-2" />
                 Aanmaken
               </Button>
               <Button 
                 variant="outline" 
                 onClick={() => setIsCreateDialogOpen(false)}
                 className="flex-1"
               >
                 <X className="w-4 h-4 mr-2" />
                 Annuleren
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Edit Action Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
         <DialogContent className="sm:max-w-[500px]">
           <DialogHeader>
             <DialogTitle>Actie Bewerken</DialogTitle>
           </DialogHeader>
           {editingAction && (
             <div className="space-y-4">
               <div>
                 <Label htmlFor="edit-title">Titel</Label>
                 <Input
                   id="edit-title"
                   value={editForm.title}
                   onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                 />
               </div>
               
               <div>
                 <Label htmlFor="edit-description">Beschrijving</Label>
                 <Textarea
                   id="edit-description"
                   value={editForm.description}
                   onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="edit-plannedHours">Geplande Uren</Label>
                   <Input
                     id="edit-plannedHours"
                     type="number"
                     step="0.5"
                     value={editForm.plannedHours}
                     onChange={(e) => setEditForm({ ...editForm, plannedHours: e.target.value })}
                   />
                 </div>
                 <div>
                   <Label htmlFor="edit-actualHours">Werkelijke Uren</Label>
                   <Input
                     id="edit-actualHours"
                     type="number"
                     step="0.5"
                     value={editForm.actualHours}
                     onChange={(e) => setEditForm({ ...editForm, actualHours: e.target.value })}
                   />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="edit-status">Status</Label>
                   <select
                     id="edit-status"
                     value={editForm.status}
                     onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                   >
                     <option value="PLANNED">Gepland</option>
                     <option value="IN_PROGRESS">In Uitvoering</option>
                     <option value="COMPLETED">Voltooid</option>
                     <option value="CANCELLED">Geannuleerd</option>
                   </select>
                 </div>
                 <div>
                   <Label htmlFor="edit-dueDate">Deadline</Label>
                   <Input
                     id="edit-dueDate"
                     type="date"
                     value={editForm.dueDate}
                     onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                   />
                 </div>
               </div>
               
               <div>
                 <Label htmlFor="edit-completedAt">Voltooid Op</Label>
                 <Input
                   id="edit-completedAt"
                   type="date"
                   value={editForm.completedAt}
                   onChange={(e) => setEditForm({ ...editForm, completedAt: e.target.value })}
                 />
               </div>
               
               <div className="flex gap-2 pt-4">
                 <Button onClick={updateAction} className="flex-1">
                   <Save className="w-4 h-4 mr-2" />
                   Opslaan
                 </Button>
                 <Button 
                   variant="outline" 
                   onClick={() => setIsEditDialogOpen(false)}
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

       {/* Delete Action Confirmation Dialog */}
       <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <DialogContent className="sm:max-w-[400px]">
           <DialogHeader>
             <DialogTitle className="flex items-center text-red-600">
               <Trash2 className="w-5 h-5 mr-2" />
               Actie Verwijderen
             </DialogTitle>
           </DialogHeader>
           {deletingAction && (
             <div className="space-y-4">
               <div className="text-center">
                 <p className="text-gray-600 mb-4">
                   Weet je zeker dat je <strong>{deletingAction.title}</strong> wilt verwijderen?
                 </p>
                 <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                   ⚠️ Deze actie kan niet ongedaan worden gemaakt.
                 </p>
               </div>
               <div className="flex gap-2 pt-4">
                 <Button 
                   onClick={deleteAction} 
                   className="flex-1 bg-red-600 hover:bg-red-700"
                 >
                   <Trash2 className="w-4 h-4 mr-2" />
                   Verwijderen
                 </Button>
                 <Button 
                   variant="outline" 
                   onClick={() => setIsDeleteDialogOpen(false)}
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
     </AdminLayout>
   );
 }
