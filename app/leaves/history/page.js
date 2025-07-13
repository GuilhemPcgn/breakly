'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, CheckCircle, XCircle, Search, Filter, Download, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function LeaveHistoryPage() {
  const { getAuthToken } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const token = await getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('/api/leaves', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      } else {
        // Mock data si pas de token Firebase
        setLeaves([
          {
            id: '1',
            type: 'annual',
            startDate: '2024-01-15',
            endDate: '2024-01-19',
            days: 5,
            reason: 'Vacances en famille',
            status: 'approved',
            createdAt: '2024-01-01T10:00:00Z',
          },
          {
            id: '2',
            type: 'sick',
            startDate: '2024-02-10',
            endDate: '2024-02-12',
            days: 3,
            reason: 'Grippe',
            status: 'pending',
            createdAt: '2024-02-08T14:30:00Z',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading leaves:', error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Refusé
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      annual: 'Congés annuels',
      sick: 'Congé maladie',
      personal: 'Congé personnel',
      maternity: 'Congé maternité',
      paternity: 'Congé paternité',
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-purple-100 text-purple-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch = leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getTypeLabel(leave.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    const matchesType = typeFilter === 'all' || leave.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalDays = filteredLeaves.reduce((sum, leave) => sum + leave.days, 0);
  const approvedDays = filteredLeaves
    .filter(leave => leave.status === 'approved')
    .reduce((sum, leave) => sum + leave.days, 0);

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto p-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Link>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des congés</h1>
                <p className="text-gray-600">Consultez toutes vos demandes de congés</p>
              </div>
              <Button asChild className="mt-4 sm:mt-0">
                <Link href="/leaves/new">
                  <Calendar className="h-4 w-4 mr-2" />
                  Nouvelle demande
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total demandé</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDays} jours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Jours approuvés</p>
                    <p className="text-2xl font-bold text-gray-900">{approvedDays} jours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Demandes totales</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredLeaves.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtres et recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Refusé</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="annual">Congés annuels</SelectItem>
                    <SelectItem value="sick">Congé maladie</SelectItem>
                    <SelectItem value="personal">Congé personnel</SelectItem>
                    <SelectItem value="maternity">Congé maternité</SelectItem>
                    <SelectItem value="paternity">Congé paternité</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leaves List */}
          <Card>
            <CardHeader>
              <CardTitle>Mes demandes ({filteredLeaves.length})</CardTitle>
              <CardDescription>
                Liste de toutes vos demandes de congés triées par date de création
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLeaves.length > 0 ? (
                <div className="space-y-4">
                  {filteredLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge className={getTypeColor(leave.type)}>
                              {getTypeLabel(leave.type)}
                            </Badge>
                            {getStatusBadge(leave.status)}
                            <span className="text-sm text-gray-500">
                              Créé le {new Date(leave.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Période</p>
                              <p className="text-sm text-gray-600">
                                Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au{' '}
                                {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Durée</p>
                              <p className="text-sm text-gray-600">
                                {leave.days} jour{leave.days > 1 ? 's' : ''}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Motif</p>
                              <p className="text-sm text-gray-600">
                                {leave.reason || 'Aucun motif spécifié'}
                              </p>
                            </div>
                          </div>

                          {leave.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                              <p className="text-sm font-medium text-red-800">Motif du refus:</p>
                              <p className="text-sm text-red-700">{leave.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                          {leave.attachment && (
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Pièce jointe
                            </Button>
                          )}
                          <div className="flex items-center text-gray-400">
                            {leave.status === 'approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {leave.status === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                            {leave.status === 'pending' && <Clock className="h-5 w-5 text-orange-500" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune demande trouvée
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Aucune demande ne correspond à vos critères de recherche.'
                      : 'Vous n\'avez pas encore fait de demande de congé.'}
                  </p>
                  <Button asChild>
                    <Link href="/leaves/new">
                      <Calendar className="h-4 w-4 mr-2" />
                      Créer ma première demande
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}