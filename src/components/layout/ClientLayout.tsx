import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FolderOpen, 
  Upload,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  Bell,
  Search,
  User
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import Logo from '../common/Logo';

const navigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
  { name: 'Mis Empresas', href: '/client/companies', icon: Building2 },
  { name: 'Proyectos', href: '/client/projects', icon: FolderOpen },
  { name: 'Subir Documentos', href: '/client/upload', icon: Upload },
  { name: 'Documentos', href: '/client/documents', icon: FileText },
  { name: 'Métricas', href: '/client/metrics', icon: BarChart3 },
  { name: 'Suscripción', href: '/client/subscription', icon: CreditCard },
  { name: 'Configuración', href: '/client/settings', icon: Settings },
];

export default function ClientLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/landing', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/landing', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200 px-3">
          <Logo size="md" />
          <div className="ml-3 bg-green-100 px-2 py-1 rounded text-xs text-green-800 font-semibold">
            CLIENTE
          </div>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/client/dashboard'}
                    className={({ isActive }) =>
                      [
                        'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                        isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
                      ].join(' ')
                    }
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <div className="flex h-16 items-center justify-between bg-white px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            Portal Cliente
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-green-600" />
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.email || 'Usuario'}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">
                CLIENTE
              </span>
            </div>
          </div>
        </div>
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}