import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Receipt, 
  BarChart3, 
  Users, 
  Menu, 
  X, 
  LogOut,
  ChevronDown
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, logout, checkRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeUserMenu = () => {
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside 
        className={`bg-white shadow-lg fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out 
                   lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded bg-blue-500 text-white font-bold">
              ET
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-800">ExpenseTracker</h1>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden rounded p-1 text-gray-700 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="py-4 px-2">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/" 
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/') 
                    ? 'text-blue-700 bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeSidebar}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/expenses" 
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/expenses') 
                    ? 'text-blue-700 bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeSidebar}
              >
                <Receipt className="mr-3 h-5 w-5" />
                Expenses
              </Link>
            </li>
            {checkRole(['manager', 'admin']) && (
              <li>
                <Link 
                  to="/reports" 
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/reports') 
                      ? 'text-blue-700 bg-blue-50 hover:bg-blue-100' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeSidebar}
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Reports
                </Link>
              </li>
            )}
            {checkRole(['admin']) && (
              <li>
                <Link 
                  to="/admin/users" 
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin/users') 
                      ? 'text-blue-700 bg-blue-50 hover:bg-blue-100' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeSidebar}
                >
                  <Users className="mr-3 h-5 w-5" />
                  User Management
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="lg:hidden rounded p-1.5 text-gray-700 hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
              <h2 className="ml-2 text-lg font-medium text-gray-800">
                {location.pathname === '/' && 'Dashboard'}
                {location.pathname.startsWith('/expenses') && 'Expenses'}
                {location.pathname.startsWith('/reports') && 'Reports'}
                {location.pathname.startsWith('/admin/users') && 'User Management'}
              </h2>
            </div>
            
            {/* User menu */}
            <div className="relative">
              <button 
                onClick={toggleUserMenu}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <img 
                  src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User')}
                  alt={user?.name} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden md:flex items-center ml-2">
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <ChevronDown size={16} className="ml-1 text-gray-500" />
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-gray-500">{user?.email}</div>
                    <div className="text-xs mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full inline-block capitalize">
                      {user?.role}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={closeSidebar}
          ></div>
        )}
        
        {/* User menu overlay */}
        {isUserMenuOpen && (
          <div 
            className="fixed inset-0 z-40"
            onClick={closeUserMenu}
          ></div>
        )}

        {/* Page content */}
        <main className="flex-grow overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;