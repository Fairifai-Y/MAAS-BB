'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import CustomerLayout from '@/components/customer-layout';

interface Action {
  id: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    user: {
      name: string;
    };
  };
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export default function CustomerActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const response = await fetch('/api/customer/actions');
      if (response.ok) {
        const data = await response.json();
        setActions(data);
      } else {
        console.error('Failed to fetch actions');
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Afgerond';
      case 'IN_PROGRESS': return 'In Uitvoering';
      case 'PENDING': return 'Wachtend';
      case 'REJECTED': return 'Afgewezen';
      default: return 'Onbekend';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Hoog';
      case 'MEDIUM': return 'Gemiddeld';
      case 'LOW': return 'Laag';
      default: return 'Onbekend';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'PENDING': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'REJECTED': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <CustomerLayout title="Mijn Acties" description="Overzicht van al je acties en taken">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Acties laden...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="Mijn Acties" description="Overzicht van al je acties en taken">
      {/* Actions List */}
      <div className="grid grid-cols-1 gap-6">
        {actions.map((action) => (
          <Card key={action.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon(action.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {action.description}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(action.status)}>
                        {getStatusText(action.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(action.priority)}>
                        {getPriorityText(action.priority)}
                      </Badge>
                    </div>
                    
                    {action.assignedTo && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{action.assignedTo.user.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Aangemaakt: {new Date(action.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {action.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {new Date(action.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {action.estimatedHours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Geschatte uren: {action.estimatedHours}</span>
                      </div>
                    )}
                    
                    {action.actualHours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Werkelijke uren: {action.actualHours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {actions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen acties gevonden</h3>
            <p className="text-gray-600">
              Er zijn momenteel geen acties voor je aangemaakt. Neem contact op met je account manager voor meer informatie.
            </p>
          </CardContent>
        </Card>
      )}
    </CustomerLayout>
  );
}
