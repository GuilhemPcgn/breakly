'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TeamPage() {
  const { getAuthToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'week' or 'month'
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamLeaves();
  }, [currentDate]);

  const loadTeamLeaves = async () => {
    try {
      // Simuler les données d'équipe puisque nous n'avons pas encore l'API team
      setTeamLeaves([
        {
          id: '1',
          employeeName: 'Marie Dubois',
          department: 'Marketing',
          type: 'annual',
          startDate: '2024-12-20',
          endDate: '2024-12-24',
          status: 'approved',
        },
        {
          id: '2',
          employeeName: 'Pierre Martin',
          department: 'Engineering',
          type: 'sick',
          startDate: '2024-12-18',
          endDate: '2024-12-19',
          status: 'approved',
        },
        {
          id: '3',
          employeeName: 'Sophie Bernard',
          department: 'Sales',
          type: 'personal',
          startDate: '2024-12-23',
          endDate: '2024-12-23',
          status: 'pending',
        },
      ]);
    } catch (error) {
      console.error('Error loading team leaves:', error);
      setTeamLeaves([]);
    } finally {
      setLoading(false);
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

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
    start.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getMonthCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay() + 1); // Commencer par lundi
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (7 - lastDay.getDay()));
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  };

  const getLeaveForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return teamLeaves.filter(leave => {
      const startDate = leave.startDate;
      const endDate = leave.endDate;
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const formatWeekRange = () => {
    const days = getWeekDays();
    const start = days[0];
    const end = days[6];
    return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendrier d'équipe</h1>
                <p className="text-gray-600">Consultez les absences de votre équipe</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Semaine</SelectItem>
                    <SelectItem value="month">Mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Calendar Navigation */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateMonth(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">
                    {viewMode === 'week' ? formatWeekRange() : formatMonthYear()}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateMonth(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'week' ? (
                // Vue semaine
                <div className="grid grid-cols-7 gap-4">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                    <div key={day} className="text-center font-medium text-gray-700 mb-2">
                      {day}
                    </div>
                  ))}
                  {getWeekDays().map((date, index) => {
                    const leaves = getLeaveForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-2 border rounded-lg ${
                          isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-2 ${
                          isToday ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {leaves.slice(0, 2).map((leave) => (
                            <div
                              key={leave.id}
                              className={`text-xs p-1 rounded text-center ${getTypeColor(leave.type)}`}
                            >
                              {leave.employeeName.split(' ')[0]}
                            </div>
                          ))}
                          {leaves.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{leaves.length - 2} autres
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Vue mois
                <div className="grid grid-cols-7 gap-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="text-center font-medium text-gray-700 p-2">
                      {day}
                    </div>
                  ))}
                  {getMonthCalendar().map((date, index) => {
                    const leaves = getLeaveForDate(date);
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-16 p-1 border rounded ${
                          isToday
                            ? 'bg-blue-50 border-blue-200'
                            : isCurrentMonth
                            ? 'bg-white'
                            : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-blue-700' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {date.getDate()}
                        </div>
                        {isCurrentMonth && leaves.length > 0 && (
                          <div className="flex justify-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Leave List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Absences actuelles
                </CardTitle>
                <CardDescription>Membres de l'équipe actuellement en congé</CardDescription>
              </CardHeader>
              <CardContent>
                {teamLeaves.filter(leave => {
                  const today = new Date().toISOString().split('T')[0];
                  return today >= leave.startDate && today <= leave.endDate && leave.status === 'approved';
                }).length > 0 ? (
                  <div className="space-y-4">
                    {teamLeaves
                      .filter(leave => {
                        const today = new Date().toISOString().split('T')[0];
                        return today >= leave.startDate && today <= leave.endDate && leave.status === 'approved';
                      })
                      .map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{leave.employeeName}</p>
                            <p className="text-sm text-gray-600">{leave.department}</p>
                            <Badge className={`mt-2 ${getTypeColor(leave.type)}`}>
                              {getTypeLabel(leave.type)}
                            </Badge>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <p>Retour le</p>
                            <p className="font-medium">
                              {new Date(new Date(leave.endDate).getTime() + 86400000).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune absence en cours</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Prochaines absences
                </CardTitle>
                <CardDescription>Congés à venir dans l'équipe</CardDescription>
              </CardHeader>
              <CardContent>
                {teamLeaves.filter(leave => {
                  const today = new Date().toISOString().split('T')[0];
                  return leave.startDate > today && leave.status === 'approved';
                }).length > 0 ? (
                  <div className="space-y-4">
                    {teamLeaves
                      .filter(leave => {
                        const today = new Date().toISOString().split('T')[0];
                        return leave.startDate > today && leave.status === 'approved';
                      })
                      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                      .slice(0, 5)
                      .map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{leave.employeeName}</p>
                            <p className="text-sm text-gray-600">{leave.department}</p>
                            <Badge className={`mt-2 ${getTypeColor(leave.type)}`}>
                              {getTypeLabel(leave.type)}
                            </Badge>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <p>Du {new Date(leave.startDate).toLocaleDateString('fr-FR')}</p>
                            <p>au {new Date(leave.endDate).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun congé prévu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}