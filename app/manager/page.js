'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, CheckCircle, XCircle, Eye, FileText, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ManagerPage() {
  const { getAuthToken } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    loadPendingLeaves();
  }, []);

  const loadPendingLeaves = async () => {
    try {
      const token = await getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('/api/leaves/pending', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setPendingLeaves(data);
      } else {
        // Mock data si pas de token Firebase
        setPendingLeaves([
          {
            id: '1',
            employeeUid: 'emp1',
            employeeName: 'Marie Dubois',
            employeeEmail: 'marie.dubois@entreprise.com',
            type: 'annual',
            startDate: '2024-12-20',
            endDate: '2024-12-24',
            days: 5,
            reason: 'Vacances de fin d\'année avec la famille',
            status: 'pending',
            createdAt: '2024-12-01T10:00:00Z',
          },
          {
            id: '2',
            employeeUid: 'emp2',
            employeeName: 'Pierre Martin',
            employeeEmail: 'pierre.martin@entreprise.com',
            type: 'sick',
            startDate: '2024-12-18',
            endDate: '2024-12-19',
            days: 2,
            reason: 'Grippe',
            attachment: 'data:application/pdf;base64,mock-base64-data',
            status: 'pending',
            createdAt: '2024-12-15T14:30:00Z',
          },
          {
            id: '3',
            employeeUid: 'emp3',
            employeeName: 'Sophie Bernard',
            employeeEmail: 'sophie.bernard@entreprise.com',
            type: 'personal',
            startDate: '2024-12-23',
            endDate: '2024-12-23',
            days: 1,
            reason: 'Rendez-vous médical urgent',
            status: 'pending',
            createdAt: '2024-12-16T09:15:00Z',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading pending leaves:', error);
      setPendingLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    setProcessingId(leaveId);
    try {
      const token = await getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch('/api/leaves/approve', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          leaveId,
          action: 'approve',
        }),
      });

      if (response.ok) {
        toast.success('Demande approuvée avec succès !');
        setPendingLeaves(prev => prev.filter(leave => leave.id !== leaveId));
      } else {
        throw new Error('Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Error approving leave:', error);
      toast.error('Erreur lors de l\'approbation de la demande');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave || !rejectionReason.trim()) {
      toast.error('Veuillez fournir un motif de refus');
      return;
    }

    setProcessingId(selectedLeave.id);
    try {
      const token = await getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch('/api/leaves/approve', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          leaveId: selectedLeave.id,
          action: 'reject',
          rejectionReason,
        }),
      });

      if (response.ok) {
        toast.success('Demande refusée');
        setPendingLeaves(prev => prev.filter(leave => leave.id !== selectedLeave.id));
        setShowRejectDialog(false);
        setRejectionReason('');
        setSelectedLeave(null);
      } else {
        throw new Error('Erreur lors du refus');
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error('Erreur lors du refus de la demande');
    } finally {
      setProcessingId(null);
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

  const getPriorityColor = (type, days) => {
    if (type === 'sick') return 'border-red-200 bg-red-50';
    if (days >= 5) return 'border-orange-200 bg-orange-50';
    return 'border-gray-200 bg-white';
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Validation des congés</h1>
                <p className="text-gray-600">Approuvez ou refusez les demandes de congés de votre équipe</p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Badge variant="secondary" className="text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {pendingLeaves.length} en attente
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingLeaves.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgentes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pendingLeaves.filter(leave => leave.type === 'sick').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Employés</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(pendingLeaves.map(leave => leave.employeeUid)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Leaves */}
          <Card>
            <CardHeader>
              <CardTitle>Demandes en attente</CardTitle>
              <CardDescription>
                Examinez et traitez les demandes de congés de votre équipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingLeaves.length > 0 ? (
                <div className="space-y-6">
                  {pendingLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className={`border rounded-lg p-6 ${getPriorityColor(leave.type, leave.days)}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                        <div className="flex-1">
                          {/* Employee Info */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {leave.employeeName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{leave.employeeName}</h3>
                              <p className="text-sm text-gray-600">{leave.employeeEmail}</p>
                            </div>
                            <Badge className={getTypeColor(leave.type)}>
                              {getTypeLabel(leave.type)}
                            </Badge>
                            {leave.type === 'sick' && (
                              <Badge variant="destructive" className="text-xs">URGENT</Badge>
                            )}
                          </div>

                          {/* Leave Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                              <p className="text-sm font-medium text-gray-900">Demandé le</p>
                              <p className="text-sm text-gray-600">
                                {new Date(leave.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>

                          {/* Reason */}
                          {leave.reason && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-900 mb-1">Motif</p>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                                {leave.reason}
                              </p>
                            </div>
                          )}

                          {/* Attachment */}
                          {leave.attachment && (
                            <div className="mb-4">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Voir la pièce jointe
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                          <Button
                            onClick={() => handleApprove(leave.id)}
                            disabled={processingId === leave.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {processingId === leave.id ? 'Approbation...' : 'Approuver'}
                          </Button>
                          
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowRejectDialog(true);
                            }}
                            disabled={processingId === leave.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Refuser
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Détails
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Détails de la demande</DialogTitle>
                                <DialogDescription>
                                  Informations complètes sur cette demande de congé
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">Employé</Label>
                                  <p className="text-sm text-gray-600">{leave.employeeName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Type</Label>
                                  <p className="text-sm text-gray-600">{getTypeLabel(leave.type)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Période</Label>
                                  <p className="text-sm text-gray-600">
                                    Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au{' '}
                                    {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Durée</Label>
                                  <p className="text-sm text-gray-600">{leave.days} jour{leave.days > 1 ? 's' : ''}</p>
                                </div>
                                {leave.reason && (
                                  <div>
                                    <Label className="text-sm font-medium">Motif</Label>
                                    <p className="text-sm text-gray-600">{leave.reason}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune demande en attente
                  </h3>
                  <p className="text-gray-600">
                    Toutes les demandes ont été traitées !
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reject Dialog */}
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Refuser la demande</DialogTitle>
                <DialogDescription>
                  Veuillez indiquer le motif du refus pour {selectedLeave?.employeeName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejection-reason">Motif du refus *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Expliquez pourquoi cette demande est refusée..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || processingId === selectedLeave?.id}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {processingId === selectedLeave?.id ? 'Refus...' : 'Confirmer le refus'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}