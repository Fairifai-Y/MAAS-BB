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
  Trash2,
  Plus,
  Building,
  FileText,
  Calendar,
  Hash
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';
import { isValidEmailDomain, getEmailDomainError } from '@/lib/auth-utils';

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
  employeeId: string;
  name: string;
  function: string;
  department: string;
  email: string;
  phone: string;
  contractType: 'VAST' | 'TIJDELIJK' | 'ZZP';
  internalHourlyRate: number;
  externalHourlyRate: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIEF' | 'UIT_DIENST' | 'INACTIEF';
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
  
  // Edit dialogs
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
    employeeId: '',
    name: '',
    function: '',
    department: '',
    email: '',
    phone: '',
    contractType: 'VAST' as 'VAST' | 'TIJDELIJK' | 'ZZP',
    internalHourlyRate: '',
    externalHourlyRate: '',
    startDate: '',
    endDate: '',
    status: 'ACTIEF' as 'ACTIEF' | 'UIT_DIENST' | 'INACTIEF'
  });
  
  // Delete dialogs
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleteEmployeeDialogOpen, setIsDeleteEmployeeDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  
  // New item dialogs
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isNewEmployeeDialogOpen, setIsNewEmployeeDialogOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    company: '',
    email: '',
    name: '',
    phone: '',
    address: '',
    price: '',
    maxHours: '',
    isActive: true
  });
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    employeeId: '',
    name: '',
    function: '',
    department: '',
    email: '',
    phone: '',
    contractType: 'VAST' as 'VAST' | 'TIJDELIJK' | 'ZZP',
    internalHourlyRate: '',
    externalHourlyRate: '',
    startDate: '',
    endDate: '',
    status: 'ACTIEF' as 'ACTIEF' | 'UIT_DIENST' | 'INACTIEF'
  });

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
      // Validate email domain
      if (!isValidEmailDomain(editForm.email)) {
        alert(getEmailDomainError(editForm.email));
        return;
      }

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
      employeeId: employee.employeeId || '',
      name: employee.name || employee.users.name || '',
      function: employee.function || '',
      department: employee.department || '',
      email: employee.email || employee.users.email || '',
      phone: employee.phone || '',
      contractType: employee.contractType || 'VAST',
      internalHourlyRate: String(employee.internalHourlyRate || ''),
      externalHourlyRate: String(employee.externalHourlyRate || ''),
      startDate: employee.startDate || '',
      endDate: employee.endDate || '',
      status: employee.status || 'ACTIEF'
    });
    setIsEditEmployeeDialogOpen(true);
  };

  const updateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      // Validate email domain
      if (!isValidEmailDomain(editEmployeeForm.email)) {
        alert(getEmailDomainError(editEmployeeForm.email));
        return;
      }

      const requestBody = {
        ...editEmployeeForm,
        internalHourlyRate: Number(editEmployeeForm.internalHourlyRate) || 0,
        externalHourlyRate: Number(editEmployeeForm.externalHourlyRate) || 0
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

  // New Customer functions
  const openNewCustomerDialog = () => {
    setNewCustomerForm({
      company: '',
      email: '',
      name: '',
      phone: '',
      address: '',
      price: '',
      maxHours: '',
      isActive: true
    });
    setIsNewCustomerDialogOpen(true);
  };

  const createNewCustomer = async () => {
    try {
      // Validate email domain
      if (!isValidEmailDomain(newCustomerForm.email)) {
        alert(getEmailDomainError(newCustomerForm.email));
        return;
      }

      const requestBody = {
        ...newCustomerForm,
        price: Number(newCustomerForm.price) || 0,
        maxHours: Number(newCustomerForm.maxHours) || 0
      };
      
      console.log('🔄 Creating new customer:', requestBody);
      
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Customer created successfully:', result);
        setIsNewCustomerDialogOpen(false);
        fetchData(); // Refresh data
        alert('Klant succesvol aangemaakt!');
      } else {
        let errorMessage = 'Onbekende fout';
        try {
          const errorData = await response.json();
          console.error('❌ Failed to create customer:', errorData);
          errorMessage = errorData.error || errorData.details || 'Onbekende fout';
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Fout bij aanmaken: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      alert('Netwerkfout bij aanmaken van klant');
    }
  };

  // New Employee functions
  const openNewEmployeeDialog = () => {
    setNewEmployeeForm({
      employeeId: '',
      name: '',
      function: '',
      department: '',
      email: '',
      phone: '',
      contractType: 'VAST' as 'VAST' | 'TIJDELIJK' | 'ZZP',
      internalHourlyRate: '',
      externalHourlyRate: '',
      startDate: '',
      endDate: '',
      status: 'ACTIEF' as 'ACTIEF' | 'UIT_DIENST' | 'INACTIEF'
    });
    setIsNewEmployeeDialogOpen(true);
  };

  const createNewEmployee = async () => {
    try {
      // Validate email domain
      if (!isValidEmailDomain(newEmployeeForm.email)) {
        alert(getEmailDomainError(newEmployeeForm.email));
        return;
      }

      const requestBody = {
        ...newEmployeeForm,
        internalHourlyRate: Number(newEmployeeForm.internalHourlyRate) || 0,
        externalHourlyRate: Number(newEmployeeForm.externalHourlyRate) || 0
      };
      
      console.log('🔄 Creating new employee:', requestBody);
      
      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Employee created successfully:', result);
        setIsNewEmployeeDialogOpen(false);
        fetchData(); // Refresh data
        alert('Medewerker succesvol aangemaakt!');
      } else {
        let errorMessage = 'Onbekende fout';
        try {
          const errorData = await response.json();
          console.error('❌ Failed to create employee:', errorData);
          errorMessage = errorData.error || errorData.details || 'Onbekende fout';
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Fout bij aanmaken: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error creating employee:', error);
      alert('Netwerkfout bij aanmaken van medewerker');
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

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-3">
              {activeTab === 'customers' && (
                <Button onClick={openNewCustomerDialog} className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe Klant
                </Button>
              )}
              {activeTab === 'employees' && (
                <Button onClick={openNewEmployeeDialog} className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe Medewerker
                </Button>
              )}
            </div>
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
                        <div>
                          <CardTitle className="text-lg">{employee.name || employee.users.name}</CardTitle>
                          <p className="text-sm text-gray-600">{employee.function || 'Geen functie'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            employee.status === 'ACTIEF' ? 'bg-green-100 text-green-800' :
                            employee.status === 'INACTIEF' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {employee.status === 'ACTIEF' ? 'Actief' :
                             employee.status === 'INACTIEF' ? 'Inactief' : 'Uit dienst'}
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
                          <span>{employee.email || employee.users.email}</span>
                        </div>
                        
                        {employee.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{employee.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="w-4 h-4 mr-2" />
                          <span>{employee.department || 'Geen afdeling'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="w-4 h-4 mr-2" />
                          <span>{employee.contractType || 'Geen contracttype'}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Euro className="w-4 h-4 mr-2" />
                            <span>Intern: €{employee.internalHourlyRate || 0}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Euro className="w-4 h-4 mr-2" />
                            <span>Extern: €{employee.externalHourlyRate || 0}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Start: {employee.startDate ? new Date(employee.startDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          {employee.endDate && (
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Eind: {new Date(employee.endDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        {employee.employeeId && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Hash className="w-4 h-4 mr-2" />
                            <span>ID: {employee.employeeId}</span>
                          </div>
                        )}
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
                      {employees.filter(e => e.status === 'ACTIEF').length}
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
         <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Medewerker Bewerken</DialogTitle>
           </DialogHeader>
           {editingEmployee && (
             <div className="space-y-4">
               {/* Basic Information */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="employee-id">Medewerker ID</Label>
                   <Input
                     id="employee-id"
                     value={editEmployeeForm.employeeId}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, employeeId: e.target.value })}
                     placeholder="Uniek nummer of UUID"
                   />
                 </div>
                 <div>
                   <Label htmlFor="employee-name">Naam</Label>
                   <Input
                     id="employee-name"
                     value={editEmployeeForm.name}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, name: e.target.value })}
                     placeholder="Voor- en achternaam"
                   />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="employee-function">Functie / Rol</Label>
                   <Input
                     id="employee-function"
                     value={editEmployeeForm.function}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, function: e.target.value })}
                     placeholder="bijv. consultant, developer, projectmanager"
                   />
                 </div>
                 <div>
                   <Label htmlFor="employee-department">Afdeling / Team</Label>
                   <Input
                     id="employee-department"
                     value={editEmployeeForm.department}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, department: e.target.value })}
                     placeholder="Afdeling of team naam"
                   />
                 </div>
               </div>

               {/* Contact Information */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="employee-email">E-mail</Label>
                   <Input
                     id="employee-email"
                     type="email"
                     value={editEmployeeForm.email}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, email: e.target.value })}
                     placeholder="email@fitchannel.com"
                   />
                 </div>
                 <div>
                   <Label htmlFor="employee-phone">Telefoon</Label>
                   <Input
                     id="employee-phone"
                     value={editEmployeeForm.phone}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, phone: e.target.value })}
                     placeholder="+31 6 12345678"
                   />
                 </div>
               </div>

               {/* Contract Information */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="employee-contract-type">Contracttype</Label>
                   <select
                     id="employee-contract-type"
                     value={editEmployeeForm.contractType}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, contractType: e.target.value as any })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   >
                     <option value="VAST">Vast</option>
                     <option value="TIJDELIJK">Tijdelijk</option>
                     <option value="ZZP">ZZP</option>
                   </select>
                 </div>
                 <div>
                   <Label htmlFor="employee-status">Status</Label>
                   <select
                     id="employee-status"
                     value={editEmployeeForm.status}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, status: e.target.value as any })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   >
                     <option value="ACTIEF">Actief</option>
                     <option value="UIT_DIENST">Uit dienst</option>
                     <option value="INACTIEF">Inactief</option>
                   </select>
                 </div>
               </div>

               {/* Hourly Rates */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="employee-internal-rate">Uurtarief Intern (€)</Label>
                   <Input
                     id="employee-internal-rate"
                     type="number"
                     step="0.01"
                     value={editEmployeeForm.internalHourlyRate}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, internalHourlyRate: e.target.value })}
                     placeholder="Kostprijs voor margeanalyse"
                   />
                 </div>
                 <div>
                   <Label htmlFor="employee-external-rate">Uurtarief Extern (€)</Label>
                   <Input
                     id="employee-external-rate"
                     type="number"
                     step="0.01"
                     value={editEmployeeForm.externalHourlyRate}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, externalHourlyRate: e.target.value })}
                     placeholder="Verkoopprijs naar klant"
                   />
                 </div>
               </div>

               {/* Dates */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="employee-start-date">Startdatum</Label>
                   <Input
                     id="employee-start-date"
                     type="date"
                     value={editEmployeeForm.startDate}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, startDate: e.target.value })}
                   />
                 </div>
                 <div>
                   <Label htmlFor="employee-end-date">Einddatum (optioneel)</Label>
                   <Input
                     id="employee-end-date"
                     type="date"
                     value={editEmployeeForm.endDate}
                     onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, endDate: e.target.value })}
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

        {/* New Customer Dialog */}
        <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nieuwe Klant Toevoegen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-company">Bedrijfsnaam</Label>
                  <Input
                    id="new-company"
                    value={newCustomerForm.company}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, company: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-name">Contactpersoon</Label>
                  <Input
                    id="new-name"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="new-email">E-mail</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-phone">Telefoon</Label>
                <Input
                  id="new-phone"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-address">Adres</Label>
                <Input
                  id="new-address"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-price">Maandprijs (€)</Label>
                  <Input
                    id="new-price"
                    type="number"
                    value={newCustomerForm.price}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-maxHours">Uren per maand</Label>
                  <Input
                    id="new-maxHours"
                    type="number"
                    value={newCustomerForm.maxHours}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, maxHours: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-isActive"
                  checked={newCustomerForm.isActive}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                />
                <Label htmlFor="new-isActive" className="text-sm font-medium text-gray-700">
                  Klant is actief
                </Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={createNewCustomer} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Klant Toevoegen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewCustomerDialogOpen(false)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuleren
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Employee Dialog */}
        <Dialog open={isNewEmployeeDialogOpen} onOpenChange={setIsNewEmployeeDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nieuwe Medewerker Toevoegen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-employee-id">Medewerker ID</Label>
                  <Input
                    id="new-employee-id"
                    value={newEmployeeForm.employeeId}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, employeeId: e.target.value })}
                    placeholder="Uniek nummer of UUID"
                  />
                </div>
                <div>
                  <Label htmlFor="new-employee-name">Naam</Label>
                  <Input
                    id="new-employee-name"
                    value={newEmployeeForm.name}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, name: e.target.value })}
                    placeholder="Voor- en achternaam"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-employee-function">Functie / Rol</Label>
                  <Input
                    id="new-employee-function"
                    value={newEmployeeForm.function}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, function: e.target.value })}
                    placeholder="bijv. consultant, developer, projectmanager"
                  />
                </div>
                <div>
                  <Label htmlFor="new-employee-department">Afdeling / Team</Label>
                  <Input
                    id="new-employee-department"
                    value={newEmployeeForm.department}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, department: e.target.value })}
                    placeholder="Afdeling of team naam"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-employee-email">E-mail</Label>
                  <Input
                    id="new-employee-email"
                    type="email"
                    value={newEmployeeForm.email}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                    placeholder="email@fitchannel.com"
                  />
                </div>
                <div>
                  <Label htmlFor="new-employee-phone">Telefoon</Label>
                  <Input
                    id="new-employee-phone"
                    value={newEmployeeForm.phone}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                    placeholder="+31 6 12345678"
                  />
                </div>
              </div>

              {/* Contract Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-employee-contract-type">Contracttype</Label>
                  <select
                    id="new-employee-contract-type"
                    value={newEmployeeForm.contractType}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, contractType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VAST">Vast</option>
                    <option value="TIJDELIJK">Tijdelijk</option>
                    <option value="ZZP">ZZP</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="new-employee-status">Status</Label>
                  <select
                    id="new-employee-status"
                    value={newEmployeeForm.status}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIEF">Actief</option>
                    <option value="UIT_DIENST">Uit dienst</option>
                    <option value="INACTIEF">Inactief</option>
                  </select>
                </div>
              </div>

              {/* Hourly Rates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-employee-internal-rate">Uurtarief Intern (€)</Label>
                  <Input
                    id="new-employee-internal-rate"
                    type="number"
                    step="0.01"
                    value={newEmployeeForm.internalHourlyRate}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, internalHourlyRate: e.target.value })}
                    placeholder="Kostprijs voor margeanalyse"
                  />
                </div>
                <div>
                  <Label htmlFor="new-employee-external-rate">Uurtarief Extern (€)</Label>
                  <Input
                    id="new-employee-external-rate"
                    type="number"
                    step="0.01"
                    value={newEmployeeForm.externalHourlyRate}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, externalHourlyRate: e.target.value })}
                    placeholder="Verkoopprijs naar klant"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-employee-start-date">Startdatum</Label>
                  <Input
                    id="new-employee-start-date"
                    type="date"
                    value={newEmployeeForm.startDate}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-employee-end-date">Einddatum (optioneel)</Label>
                  <Input
                    id="new-employee-end-date"
                    type="date"
                    value={newEmployeeForm.endDate}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createNewEmployee} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Medewerker Toevoegen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewEmployeeDialogOpen(false)}
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
