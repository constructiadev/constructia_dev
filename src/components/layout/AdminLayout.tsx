import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  Database,
  Activity,
  BarChart3,
  Brain,
  LogOut,
  Shield
} from 'lucide-react';
// import { useAuth } from '../../context/AuthContext'; // Temporalmente desactivado
import Logo from '../common/Logo';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Clientes', href: '/admin/clients', icon: Users },
  { name: 'Financiero', href: '/admin/financial', icon: CreditCard },
  { name: 'IA & Integraciones', href: '/admin/ai', icon: Brain },
  { name: 'Gestión Manual', href: '/admin/manual', icon: Settings },
  { name: 'Base de Datos', href: '/admin/database', icon: Database },
  { name: 'API Management', href: '/admin/api', icon: BarChart3 },
  { name: 'Auditoría', href: '/admin/audit', icon: Activity },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  // const { logout, userRole, loading } = useAuth(); // Temporalmente desactivado

  const handleLogout = async () => {
    try {
      // await logout(); // Temporalmente desactivado
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <Logo size="md" />
          <div className="ml-3 flex items-center bg-red-100 px-2 py-1 rounded text-xs text-red-800 font-semibold">
            <Shield className="h-3 w-3 mr-1" />
            ADMIN
          </div>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
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
            Panel de SuperAdministrador
          </h1>
          <div className="flex items-center space-x-4">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              admin@constructia.com
            </span>
          </div>
        </div>
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}