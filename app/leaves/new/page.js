'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewLeavePage() {
  const { getAuthToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null,
  });
  const [error, setError] = useState('');

  const leaveTypes = [
    { value: 'annual', label: 'Congés annuels', description: 'Vacances et repos' },
    { value: 'sick', label: 'Congé maladie', description: 'Arrêt maladie' },
    { value: 'personal', label: 'Congé personnel', description: 'Raisons personnelles' },
    { value: 'maternity', label: 'Congé maternité', description: 'Congé maternité' },
    { value: 'paternity', label: 'Congé paternité', description: 'Congé paternité' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Le fichier ne doit pas dépasser 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, attachment: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const validateForm = () => {
    if (!formData.type) return 'Veuillez sélectionner un type de congé';
    if (!formData.startDate) return 'Veuillez sélectionner une date de début';
    if (!formData.endDate) return 'Veuillez sélectionner une date de fin';
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) return 'La date de début ne peut pas être dans le passé';
    if (end < start) return 'La date de fin doit être après la date de début';
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    
    try {
      const token = await getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Demande de congé créée avec succès !');
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la création de la demande');
      }
    } catch (error) {
      console.error('Error creating leave request:', error);
      setError('Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDays();

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouvelle demande de congé</h1>
            <p className="text-gray-600">Créez une nouvelle demande de congé</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Détails de la demande</CardTitle>
                  <CardDescription>
                    Remplissez tous les champs requis pour votre demande
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Type de congé */}
                    <div className="space-y-2">
                      <Label htmlFor="type">Type de congé *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type de congé" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-gray-500">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Date de début *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Date de fin *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          min={formData.startDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Durée calculée */}
                    {days > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            Durée : {days} jour{days > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Motif */}
                    <div className="space-y-2">
                      <Label htmlFor="reason">Motif (optionnel)</Label>
                      <Textarea
                        id="reason"
                        placeholder="Décrivez brièvement le motif de votre demande..."
                        value={formData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* Pièce jointe */}
                    <div className="space-y-2">
                      <Label htmlFor="attachment">Pièce jointe (optionnel)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <Label htmlFor="attachment" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700">
                              Cliquez pour télécharger un fichier
                            </span>
                            <span className="text-gray-500"> ou glissez-le ici</span>
                          </Label>
                          <Input
                            id="attachment"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            PDF, DOC, JPG jusqu'à 5MB
                          </p>
                        </div>
                      </div>
                      {formData.attachment && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                          ✓ Fichier téléchargé avec succès
                        </div>
                      )}
                    </div>

                    {/* Submit button */}
                    <div className="flex space-x-4">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? 'Création...' : 'Créer la demande'}
                      </Button>
                      <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard">Annuler</Link>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 Conseils</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Anticipez vos demandes</h4>
                    <p className="text-gray-600">
                      Soumettez vos demandes au moins 2 semaines à l'avance pour faciliter l'organisation.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Vérifiez votre solde</h4>
                    <p className="text-gray-600">
                      Consultez votre solde de congés disponible sur le tableau de bord.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Pièces justificatives</h4>
                    <p className="text-gray-600">
                      Pour les congés maladie, n'oubliez pas d'ajouter votre arrêt de travail.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Process */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📋 Processus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Soumission</p>
                      <p className="text-gray-600">Votre demande est envoyée</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Révision</p>
                      <p className="text-gray-600">Examen par votre manager</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Validation</p>
                      <p className="text-gray-600">Approbation ou refus</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}