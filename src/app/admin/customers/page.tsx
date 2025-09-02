'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Euro,
  Package,
  Search,
  Filter,
  Loader2,
  Edit,
  Save,
  X,
  Trash2
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';

interface Customer {
  id: string;
  company: string;
  phone: string;
  address: string;
  isActive: boolean;
  users: {
    email: string;
    name: string;
  };
  customer_packages: Array<{
    packages: {
      name: string;
      price: number;
      maxHours: number;
    };
    status: string;
    startDate: string;
  }>;
}

interface Employee {
  id: string;
  hourlyRate: number;
  contractHours: number;
  isActive: boolean;
  users: {
    email: string;
    name: string;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'employees'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({
    company: '',
    email: '',
    name: '',
    phone: '',
    address: '',
    price: '',
    maxHours: '',
    isActive: true
  });
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editEmployeeForm, setEditEmployeeForm] = useState({
    name: '',
    email: '',
    hourlyRate: '',
    contractHours: ''
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleteEmployeeDialogOpen, setIsDeleteEmployeeDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [customersResponse, employeesResponse] = await Promise.all([
        fetch('/api/admin/customers'),
        fetch('/api/admin/employees')
      ]);

      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData);
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

  const filteredCustomers = customers.filter(customer =>
    customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.users.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployees = employees.filter(employee =>
    employee.users.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.users.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Actief';
      case 'INACTIVE': return 'Inactief';
      case 'PENDING': return 'In behandeling';
      default: return 'Onbekend';
    }
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      company: customer.company || '',
      email: customer.users.email || '',
      name: customer.users.name || '',
      phone: customer.phone || '',
      address: customer.address || '',
      price: String(customer.customer_packages[0]?.packages.price || ''),
      maxHours: String(customer.customer_packages[0]?.packages.maxHours || ''),
      isActive: customer.isActive
    });
    setIsEditDialogOpen(true);
  };

  const updateCustomer = async () => {
    if (!editingCustomer) return;

    try {
      const requestBody = {
        ...editForm,
        price: Number(editForm.price) || 0,
        maxHours: Number(editForm.maxHours) || 0
      };
      
      console.log('🔄 Sending customer update request:', requestBody);
      
      const response = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Customer updated successfully:', result);
        setEditingCustomer(null);
        setIsEditDialogOpen(false);
        fetchData(); // Refresh data
      } else {
        let errorMessage = 'Onbekende fout';
        try {
          const errorData = await response.json();
          console.error('❌ Failed to update customer:', errorData);
          errorMessage = errorData.error || errorData.details || 'Onbekende fout';
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Fout bij bijwerken: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      alert('Netwerkfout bij bijwerken van klant');
    }
  };

  const openEditEmployeeDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditEmployeeForm({
      name: employee.users.name || '',
      email: employee.users.email || '',
      hourlyRate: String(employee.hourlyRate || ''),
      contractHours: String(employee.contractHours || '')
    });
    setIsEditEmployeeDialogOpen(true);
  };

  const updateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      const requestBody = {
        ...editEmployeeForm,
        hourlyRate: Number(editEmployeeForm.hourlyRate) || 0,
        contractHours: Number(editEmployeeForm.contractHours) || 0
      };
      
      console.log('🔄 Sending update request:', requestBody);
      
      const response = await fetch(`/api/admin/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Employee updated successfully:', result);
        setEditingEmployee(null);
        setIsEditEmployeeDialogOpen(false);
        fetchData(); // Refresh data
      } else {
        let errorMessage = 'Onbekende fout';
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          console.error('❌ Failed to update employee:', errorData);
          errorMessage = errorData.error || errorData.details || 'Onbekende fout';
          errorDetails = errorData;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error('❌ Full error details:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorDetails
        });
        
        alert(`Fout bij bijwerken: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error updating employee:', error);
      alert('Netwerkfout bij bijwerken van medewerker');
    }
  };

  const openDeleteDialog = (customer: Customer) => {
    setDeletingCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const deleteCustomer = async () => {
    if (!deletingCustomer) return;

    try {
      console.log('🗑️ Deleting customer:', deletingCustomer.company);
      
      const response = await fetch(`/api/admin/customers/${deletingCustomer.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Customer deleted successfully:', result);
        setDeletingCustomer(null);
        setIsDeleteDialogOpen(false);
        fetchData(); // Refresh data
      } else {
        let errorMessage = 'Onbekende fout';
        
        try {
          const errorData = await response.json();
          console.error('❌ Failed to delete customer:', errorData);
          errorMessage = errorData.error || errorData.details || 'Onbekende fout';
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        alert(`Fout bij verwijderen: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      alert('Netwerkfout bij verwijderen van klant');
    }
  };

  const openDeleteEmployeeDialog = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteEmployeeDialogOpen(true);
  };

  const deleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      console.log('🗑️ Deleting employee:', deletingEmployee.users.name);
      
      const response = await fetch(`/api/admin/employees/${deletingEmployee.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Employee deleted successfully:', result);
        setDeletingEmployee(null);
        setIsDeleteEmployeeDialogOpen(false);
        fetchData(); // Refresh data
      } else {
        let errorMessage = 'Onbekende fout';
        
        try {
          const errorData = await response.json();
          console.error('❌ Failed to delete employee:', errorData);
          errorMessage = errorData.error || errorData.details || 'Onbekende fout';
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        alert(`Fout bij verwijderen: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error deleting employee:', error);
      alert('Netwerkfout bij verwijderen van medewerker');
    }
  };

  return (
    <AdminLayout 
      title="Klanten & Medewerkers" 
      description="Beheer van klanten en medewerkers met echte data"
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
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'customers'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Klanten ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'employees'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Medewerkers ({employees.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={`Zoek in ${activeTab === 'customers' ? 'klanten' : 'medewerkers'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                                              <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">{customer.company}</CardTitle>
                            <Badge className={customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {customer.isActive ? 'Actief' : 'Inactief'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(customer.customer_packages[0]?.status || 'INACTIVE')}>
                              {getStatusText(customer.customer_packages[0]?.status || 'INACTIVE')}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(customer)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDeleteDialog(customer)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          <span>{customer.users.name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{customer.users.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{customer.address}</span>
                        </div>
                        
                        {customer.customer_packages.length > 0 && (
                          <div className="border-t pt-3">
                            <h4 className="font-medium text-sm mb-2">Actieve Pakketten:</h4>
                            {customer.customer_packages.map((cp, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium text-sm">{cp.packages.name}</span>
                                  <span className="text-sm font-bold">€{cp.packages.price}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{cp.packages.maxHours}h/maand</span>
                                  <span className="mx-2">•</span>
                                  <span>Start: {new Date(cp.startDate).toLocaleDateString('nl-NL')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen klanten gevonden</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Probeer een andere zoekterm.' : 'Er zijn nog geen klanten toegevoegd.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                                         <CardHeader>
                       <div className="flex justify-between items-start">
                         <CardTitle className="text-lg">{employee.users.name}</CardTitle>
                                                   <div className="flex items-center space-x-2">
                            <Badge className={employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {employee.isActive ? 'Actief' : 'Inactief'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditEmployeeDialog(employee)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDeleteEmployeeDialog(employee)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                       </div>
                     </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{employee.users.email}</span>
                        </div>
                                                 <div className="flex items-center text-sm text-gray-600">
                           <Euro className="w-4 h-4 mr-2" />
                           <span>€{employee.hourlyRate}/uur</span>
                         </div>
                         <div className="flex items-center text-sm text-gray-600">
                           <Clock className="w-4 h-4 mr-2" />
                           <span>{employee.contractHours}h/maand</span>
                         </div>
                        
                        <div className="border-t pt-3">
                          <h4 className="font-medium text-sm mb-2">Statistieken:</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-blue-50 p-2 rounded">
                              <div className="font-medium text-blue-900">Totaal Uren</div>
                              <div className="text-blue-700">Berekening...</div>
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                              <div className="font-medium text-green-900">Omzet</div>
                              <div className="text-green-700">Berekening...</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen medewerkers gevonden</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Probeer een andere zoekterm.' : 'Er zijn nog geen medewerkers toegevoegd.'}
                  </p>
                </div>
              )}
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
                    <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
                    <div className="text-sm text-gray-600">Totaal Klanten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{employees.length}</div>
                    <div className="text-sm text-gray-600">Totaal Medewerkers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {customers.filter(c => c.customer_packages.some(cp => cp.status === 'ACTIVE')).length}
                    </div>
                    <div className="text-sm text-gray-600">Actieve Klanten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {employees.filter(e => e.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600">Actieve Medewerkers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
                     </div>
         </>
       )}

       {/* Edit Customer Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
         <DialogContent className="sm:max-w-[500px]">
           <DialogHeader>
             <DialogTitle>Klant Bewerken</DialogTitle>
           </DialogHeader>
           {editingCustomer && (
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="company">Bedrijfsnaam</Label>
                   <Input
                     id="company"
                     value={editForm.company}
                     onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                   />
                 </div>
                 <div>
                   <Label htmlFor="name">Contactpersoon</Label>
                   <Input
                     id="name"
                     value={editForm.name}
                     onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                   />
                 </div>
               </div>
               <div>
                 <Label htmlFor="email">E-mail</Label>
                 <Input
                   id="email"
                   type="email"
                   value={editForm.email}
                   onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                 />
               </div>
               <div>
                 <Label htmlFor="phone">Telefoon</Label>
                 <Input
                   id="phone"
                   value={editForm.phone}
                   onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                 />
               </div>
               <div>
                 <Label htmlFor="address">Adres</Label>
                 <Input
                   id="address"
                   value={editForm.address}
                   onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                 />
               </div>
                              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="price">Maandprijs (€)</Label>
                   <Input
                     id="price"
                     type="number"
                     value={editForm.price}
                     onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                   />
                 </div>
                 <div>
                   <Label htmlFor="maxHours">Uren per maand</Label>
                   <Input
                     id="maxHours"
                     type="number"
                     value={editForm.maxHours}
                     onChange={(e) => setEditForm({ ...editForm, maxHours: e.target.value })}
                   />
                 </div>
               </div>
               <div className="flex items-center space-x-2">
                 <input
                   type="checkbox"
                   id="isActive"
                   checked={editForm.isActive}
                   onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                   className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                 />
                 <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                   Klant is actief
                 </Label>
               </div>
               <div className="flex gap-2 pt-4">
                 <Button onClick={updateCustomer} className="flex-1">
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

       {/* Edit Employee Dialog */}
       <Dialog open={isEditEmployeeDialogOpen} onOpenChange={setIsEditEmployeeDialogOpen}>
         <DialogContent className="sm:max-w-[500px]">
           <DialogHeader>
             <DialogTitle>Medewerker Bewerken</DialogTitle>
           </DialogHeader>
           {editingEmployee && (
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="employee-name">Naam</Label>
                   <Input
                     id="employee-name"
                     value={editEmployeeForm.name}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, name: e.target.value })}
                   />
                 </div>
                 <div>
                   <Label htmlFor="employee-email">E-mail</Label>
                   <Input
                     id="employee-email"
                     type="email"
                     value={editEmployeeForm.email}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, email: e.target.value })}
                   />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="employee-hourly-rate">Uurtarief (€)</Label>
                   <Input
                     id="employee-hourly-rate"
                     type="number"
                     value={editEmployeeForm.hourlyRate}
                                           onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, hourlyRate: e.target.value })}
                   />
                 </div>
                 <div>
                   <Label htmlFor="employee-contract-hours">Contracturen/maand</Label>
                   <Input
                     id="employee-contract-hours"
                     type="number"
                     value={editEmployeeForm.contractHours}
                                           onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, contractHours: e.target.value })}
                   />
                 </div>
               </div>
               <div className="flex gap-2 pt-4">
                 <Button onClick={updateEmployee} className="flex-1">
                   <Save className="w-4 h-4 mr-2" />
                   Opslaan
                 </Button>
                 <Button 
                   variant="outline" 
                   onClick={() => setIsEditEmployeeDialogOpen(false)}
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

        {/* Delete Customer Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <Trash2 className="w-5 h-5 mr-2" />
                Klant Verwijderen
              </DialogTitle>
            </DialogHeader>
            {deletingCustomer && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Weet je zeker dat je <strong>{deletingCustomer.company}</strong> wilt verwijderen?
                  </p>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    ⚠️ Deze actie kan niet ongedaan worden gemaakt. Alle klantgegevens, 
                    pakketten en activiteiten worden permanent verwijderd.
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={deleteCustomer} 
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

        {/* Delete Employee Confirmation Dialog */}
        <Dialog open={isDeleteEmployeeDialogOpen} onOpenChange={setIsDeleteEmployeeDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <Trash2 className="w-5 h-5 mr-2" />
                Medewerker Verwijderen
              </DialogTitle>
            </DialogHeader>
            {deletingEmployee && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Weet je zeker dat je <strong>{deletingEmployee.users.name}</strong> wilt verwijderen?
                  </p>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    ⚠️ Deze actie kan niet ongedaan worden gemaakt. Alle medewerkergegevens 
                    en bijbehorende activiteiten worden permanent verwijderd.
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={deleteEmployee} 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Verwijderen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteEmployeeDialogOpen(false)}
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
