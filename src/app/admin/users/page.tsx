'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Calendar,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';
import { isValidEmailDomain, getEmailDomainError } from '@/lib/auth-utils';

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.name) {
      alert('Email en naam zijn verplicht');
      return;
    }

    if (!isValidEmailDomain(newUser.email)) {
      alert(getEmailDomainError(newUser.email));
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers([...users, createdUser]);
        setNewUser({ email: '', name: '', role: 'CUSTOMER' });
        setShowAddForm(false);
        alert('Gebruiker succesvol aangemaakt!');
      } else {
        const error = await response.json();
        alert(`Fout: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Er is een fout opgetreden bij het aanmaken van de gebruiker');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: updatedUser.role } : user
        ));
        alert('Rol succesvol bijgewerkt!');
      } else {
        const error = await response.json();
        alert(`Fout: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Er is een fout opgetreden bij het bijwerken van de rol');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        alert('Gebruiker succesvol verwijderd!');
      } else {
        const error = await response.json();
        alert(`Fout: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Er is een fout opgetreden bij het verwijderen van de gebruiker');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'EMPLOYEE': return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'EMPLOYEE': return 'Medewerker';
      case 'CUSTOMER': return 'Klant';
      default: return 'Onbekend';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title="Gebruikersbeheer" description="Beheer gebruikers en hun rollen">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Gebruikers laden...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gebruikersbeheer" description="Beheer gebruikers en hun rollen">

      {/* Search and Add User */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Zoek gebruikers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nieuwe Gebruiker
        </Button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nieuwe Gebruiker Toevoegen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="naam@champ.nl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Naam *
                  </label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Volledige naam"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CUSTOMER">Klant</option>
                    <option value="EMPLOYEE">Medewerker</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Gebruiker Aanmaken
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Annuleren
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.name || 'Geen naam'}
                    </h3>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-1" />
                      {user.email}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      Aangemaakt: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleText(user.role)}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    {/* Role Change Buttons */}
                    {user.role !== 'ADMIN' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRole(user.id, 'ADMIN')}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Maak Admin
                      </Button>
                    )}
                    {user.role !== 'EMPLOYEE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRole(user.id, 'EMPLOYEE')}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        Maak Medewerker
                      </Button>
                    )}
                    {user.role !== 'CUSTOMER' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRole(user.id, 'CUSTOMER')}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        Maak Klant
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen gebruikers gevonden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Probeer een andere zoekterm' : 'Er zijn nog geen gebruikers aangemaakt'}
            </p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
