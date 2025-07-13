'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { getAuthToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const token = await getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('/api/dashboard/stats', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Mock data si pas de token Firebase
        setStats({
          leaveBalance: { annual: 25, sick: 5, personal: 3 },
          recentLeaves: [],
          pendingCount: 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Mock data en cas d'erreur
      setStats({
        leaveBalance: { annual: 25, sick: 5, personal: 3 },
        recentLeaves: [],
        pendingCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="bg-green-100 text-green-800">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Refusé</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
              <p className="text-gray-600">Gérez vos congés facilement</p>
            </div>
            <Button asChild className="mt-4 sm:mt-0">
              <Link href="/leaves/new">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle demande
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Leave Balance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Solde de congés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Congés annuels</span>
                    <span className="font-semibold">{stats?.leaveBalance?.annual || 25} jours</span>
                  </div>
                  <Progress value={(stats?.leaveBalance?.annual || 25) * 4} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Congés maladie</span>
                    <span className="font-semibold">{stats?.leaveBalance?.sick || 5} jours</span>
                  </div>
                  <Progress value={(stats?.leaveBalance?.sick || 5) * 20} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Congés personnels</span>
                    <span className="font-semibold">{stats?.leaveBalance?.personal || 3} jours</span>
                  </div>
                  <Progress value={(stats?.leaveBalance?.personal || 3) * 33.33} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Demandes en cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {stats?.pendingCount || 0}
                  </div>
                  <p className="text-sm text-gray-600">
                    {stats?.pendingCount === 0 ? 'Aucune demande en attente' : 'demandes en attente'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Action */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/leaves/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Demander un congé
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/team">
                    <Calendar className="h-4 w-4 mr-2" />
                    Voir le calendrier équipe
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/leaves/history">
                    <Clock className="h-4 w-4 mr-2" />
                    Historique des congés
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Leaves */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Demandes récentes</CardTitle>
              <CardDescription>Vos dernières demandes de congés</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentLeaves?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{getTypeLabel(leave.type)}</h3>
                          {getStatusBadge(leave.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au{' '}
                          {new Date(leave.endDate).toLocaleDateString('fr-FR')} ({leave.days} jour{leave.days > 1 ? 's' : ''})
                        </p>
                        {leave.reason && (
                          <p className="text-sm text-gray-500 mt-1">{leave.reason}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {leave.status === 'approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {leave.status === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                        {leave.status === 'pending' && <Clock className="h-5 w-5 text-orange-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande récente</h3>
                  <p className="text-gray-600 mb-4">Commencez par créer votre première demande de congé</p>
                  <Button asChild>
                    <Link href="/leaves/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle demande
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