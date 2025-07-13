'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Breakly</h1>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Se connecter
            </Button>
            <Button onClick={() => router.push('/register')}>
              S'inscrire
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Gérez vos congés en
          <span className="text-blue-600"> toute simplicité</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Breakly simplifie la gestion des congés pour votre entreprise. 
          Interface moderne, mobile-first et processus d'approbation fluide.
        </p>
        <div className="space-x-4">
          <Button size="lg" onClick={() => router.push('/register')}>
            Commencer gratuitement
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/login')}>
            Se connecter
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Tableau de bord</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualisez votre solde de congés et vos demandes en cours d'un coup d'œil
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Demandes rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Créez une demande de congé en quelques clics avec pièces jointes
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Calendrier équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Consultez les absences de votre équipe pour mieux planifier
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Approbation facile</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Les managers valident ou rejettent les demandes en un clic
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à simplifier vos congés ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les entreprises qui font confiance à Breakly
          </p>
          <Button size="lg" variant="secondary" onClick={() => router.push('/register')}>
            Démarrer maintenant
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-6 w-6" />
            <span className="text-lg font-semibold">Breakly</span>
          </div>
          <p className="text-gray-400">
            Gestion moderne des congés pour entreprises modernes
          </p>
        </div>
      </footer>
    </div>
  );
}