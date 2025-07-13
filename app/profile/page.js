'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User, Calendar, Mail, Phone, Building, Settings, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, getAuthToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    department: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = await getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('/api/user', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setFormData({
          displayName: data.displayName || '',
          department: data.department || '',
          phoneNumber: data.phoneNumber || '',
        });
      } else {
        // Mock data si pas de token Firebase
        const mockProfile = {
          uid: 'mock-user',
          email: user?.email || 'user@example.com',
          displayName: 'Utilisateur Demo',
          department: 'Engineering',
          role: 'Employee',
          phoneNumber: '+33 1 23 45 67 89',
          leaveBalance: { annual: 25, sick: 5, personal: 3 },
          createdAt: new Date().toISOString(),
        };
        setUserProfile(mockProfile);
        setFormData({
          displayName: mockProfile.displayName,
          department: mockProfile.department,
          phoneNumber: mockProfile.phoneNumber,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour le profil local
      setUserProfile(prev => ({
        ...prev,
        ...formData,
      }));
      
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'HR':
        return 'bg-purple-100 text-purple-800';
      case 'Manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
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
        <div className="container mx-auto p-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon profil</h1>
            <p className="text-gray-600">Gérez vos informations personnelles et consultez vos statistiques</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informations personnelles
                  </CardTitle>
                  <CardDescription>
                    Mettez à jour vos informations de profil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userProfile?.email || ''}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">L'email ne peut pas être modifié</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Rôle</Label>
                        <div className="flex items-center">
                          <Badge className={getRoleColor(userProfile?.role)}>
                            {userProfile?.role || 'Employee'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nom complet *</Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Département</Label>
                      <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre département" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Ingénierie</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Ventes</SelectItem>
                          <SelectItem value="HR">Ressources Humaines</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Operations">Opérations</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Product">Produit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>

                    <Button type="submit" disabled={saving} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Informations du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Date de création</p>
                      <p className="text-gray-600">
                        {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Dernière connexion</p>
                      <p className="text-gray-600">
                        {userProfile?.lastLogin ? new Date(userProfile.lastLogin).toLocaleDateString('fr-FR') : 'Non disponible'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">ID utilisateur</p>
                      <p className="text-gray-600 font-mono text-xs">{userProfile?.uid || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Leave Balance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Solde de congés
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Congés annuels</span>
                      <span className="font-semibold">{userProfile?.leaveBalance?.annual || 25} jours</span>
                    </div>
                    <Progress value={(userProfile?.leaveBalance?.annual || 25) * 4} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Congés maladie</span>
                      <span className="font-semibold">{userProfile?.leaveBalance?.sick || 5} jours</span>
                    </div>
                    <Progress value={(userProfile?.leaveBalance?.sick || 5) * 20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Congés personnels</span>
                      <span className="font-semibold">{userProfile?.leaveBalance?.personal || 3} jours</span>
                    </div>
                    <Progress value={(userProfile?.leaveBalance?.personal || 3) * 33.33} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/leaves/new">
                      <Calendar className="h-4 w-4 mr-2" />
                      Demander un congé
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/leaves/history">
                      <Calendar className="h-4 w-4 mr-2" />
                      Voir l'historique
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/team">
                      <Calendar className="h-4 w-4 mr-2" />
                      Calendrier équipe
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{userProfile?.email}</span>
                  </div>
                  {userProfile?.phoneNumber && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{userProfile.phoneNumber}</span>
                    </div>
                  )}
                  {userProfile?.department && (
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{userProfile.department}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}