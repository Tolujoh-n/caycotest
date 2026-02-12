import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiUsers, FiBriefcase, FiFileText, FiCalendar,
  FiDollarSign, FiClipboard, FiBarChart2, FiSettings, FiBell,
  FiMenu, FiX, FiLogOut, FiUser, FiMail, FiPackage, FiTool, FiInbox
} from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';
import caycoLogo from '../assets/Cayco_logo.png';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Home', permission: 'jobs.view' },
    // { path: '/jobs', icon: FiBriefcase, label: 'Jobs', permission: 'jobs.view' },
    { path: '/work', icon: FiClipboard, label: 'Work', permission: 'work.view' },
    { path: '/inbox', icon: FiInbox, label: 'Inbox', permission: 'inbox.view' },
    // { path: '/customers', icon: FiUsers, label: 'CRM', permission: 'customers.view' },
    // { path: '/estimates', icon: FiFileText, label: 'Estimates', permission: 'estimates.view' },
    // { path: '/invoices', icon: FiDollarSign, label: 'Invoicing', permission: 'invoices.view' },
    // { path: '/purchasing', icon: FiPackage, label: 'Purchasing', permission: 'jobs.view' },
    // { path: '/equipment', icon: FiTool, label: 'Equipment', permission: 'jobs.view' },
    // { path: '/reports', icon: FiBarChart2, label: 'Reports', permission: 'reports.view' },
  ].filter(item => hasPermission(item.permission));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 ml-2"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <Link to="/dashboard" className="ml-4 flex items-center">
                <img 
                  src={caycoLogo} 
                  alt="Cayco" 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-16'
          } hidden lg:block fixed h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 pb-20`}
        >
          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
            {hasPermission('users.view') && (
              <Link
                to="/settings"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/settings'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FiSettings className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                {sidebarOpen && <span>Settings</span>}
              </Link>
            )}
          </nav>
          
          {/* Sidebar Footer - User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
              {sidebarOpen ? (
                <>
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                    title="Logout"
                  >
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Logout"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
            <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white flex flex-col">
              <nav className="mt-5 px-2 space-y-1 flex-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                {hasPermission('users.view') && (
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      location.pathname === '/settings'
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <FiSettings className="h-5 w-5 mr-3" />
                    <span>Settings</span>
                  </Link>
                )}
              </nav>
              
              {/* Mobile Sidebar Footer */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FiLogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'} transition-all duration-300`}>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;