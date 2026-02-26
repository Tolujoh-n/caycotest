import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CompanySettings from './CompanySettings';
import UserManagement from './UserManagement';
import TeamSettings from './TeamSettings';
import PermissionsSettings from './PermissionsSettings';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import RolesPermissions from './RolesPermissions';
import { FiSettings, FiUsers, FiShield, FiUser, FiBell, FiHome } from 'react-icons/fi';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const location = useLocation();
  const isCompanyOwner = user?.role === 'Company Owner';

  // Set active tab from URL hash if present
  React.useEffect(() => {
    if (location.hash) {
      const hashTab = location.hash.substring(1);
      // Only allow access to restricted tabs if user is Company Owner
      if ((hashTab === 'team' || hashTab === 'roles') && !isCompanyOwner) {
        setActiveTab('company');
      } else {
        setActiveTab(hashTab);
      }
    }
  }, [location, isCompanyOwner]);

  // Build tabs array - only show Team and Roles & Permissions for Company Owners
  const allTabs = [
    { id: 'company', label: 'Company', icon: FiHome },
    { id: 'profile', label: 'My Profile', icon: FiUser },
    { id: 'team', label: 'Team', icon: FiUsers, restricted: true },
    { id: 'roles', label: 'Roles & Permissions', icon: FiShield, restricted: true },
    { id: 'permissions', label: 'My Permissions', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell }
  ];

  // Filter tabs based on user role
  const tabs = allTabs.filter(tab => {
    if (tab.restricted && !isCompanyOwner) {
      return false;
    }
    return true;
  });

  // If user tries to access restricted tab, redirect to company tab
  React.useEffect(() => {
    if ((activeTab === 'team' || activeTab === 'roles') && !isCompanyOwner) {
      setActiveTab('company');
    }
  }, [activeTab, isCompanyOwner]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and company settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeTab === 'company' && <CompanySettings />}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'team' && <TeamSettings />}
            {activeTab === 'roles' && <RolesPermissions />}
            {activeTab === 'permissions' && <PermissionsSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;