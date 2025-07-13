'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Calendar, Menu, Home, Clock, History, Users, Settings, LogOut, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  // Navigation items pour tous les utilisateurs
  const navItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: Home },
    { path: '/leaves/new', label: 'Nouvelle demande', icon: Clock },
    { path: '/leaves/history', label: 'Historique', icon: History },
    { path: '/team', label: 'Équipe', icon: Users },
    { path: '/profile', label: 'Profil', icon: Settings },
  ];

  // Ajouter la page manager pour les managers et HR
  const managerNavItems = [
    { path: '/manager', label: 'Validation congés', icon: UserCheck },
  ];

  const allNavItems = [...navItems, ...managerNavItems];

  const NavLink = ({ item, mobile = false }) => (
    <Link
      href={item.path}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        isActive(item.path)
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
      } ${mobile ? 'text-base' : 'text-sm'}`}
    >
      <item.icon className={`${mobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b p-4 flex items-center justify-between md:hidden">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900">Breakly</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col h-full">
              <div className="flex items-center space-x-2 mb-8">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h1 className="text-lg font-bold text-gray-900">Breakly</h1>
              </div>
              
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.email || 'Utilisateur'}</p>
                    <Badge variant="secondary" className="text-xs">Employé</Badge>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {allNavItems.map((item) => (
                  <NavLink key={item.path} item={item} mobile />
                ))}
              </nav>

              {/* Sign Out */}
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-4"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Déconnexion
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Sidebar (desktop only) */}
        <aside className="hidden md:flex md:w-64 border-r bg-white flex-col h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Breakly</h1>
            </div>
            
            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.email || 'Utilisateur'}</p>
                  <Badge variant="secondary" className="text-xs">Employé</Badge>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {allNavItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </nav>
          </div>
          
          {/* Sign Out */}
          <div className="p-6 mt-auto">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}