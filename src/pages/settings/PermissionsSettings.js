import React from 'react';
import { useAuth } from '../../context/AuthContext';

const PermissionsSettings = () => {
  const { user, hasPermission } = useAuth();

  const permissions = [
    { id: 'jobs.view', label: 'View Jobs', description: 'Can view job listings and details' },
    { id: 'jobs.create', label: 'Create Jobs', description: 'Can create new jobs' },
    { id: 'jobs.edit', label: 'Edit Jobs', description: 'Can edit existing jobs' },
    { id: 'jobs.delete', label: 'Delete Jobs', description: 'Can delete jobs' },
    { id: 'schedules.view', label: 'View Schedules', description: 'Can view schedules' },
    { id: 'schedules.create', label: 'Create Schedules', description: 'Can create schedules' },
    { id: 'customers.view', label: 'View Customers', description: 'Can view customer information' },
    { id: 'customers.create', label: 'Create Customers', description: 'Can create new customers' },
    { id: 'estimates.view', label: 'View Estimates', description: 'Can view estimates' },
    { id: 'estimates.create', label: 'Create Estimates', description: 'Can create estimates' },
    { id: 'invoices.view', label: 'View Invoices', description: 'Can view invoices' },
    { id: 'invoices.create', label: 'Create Invoices', description: 'Can create invoices' },
    { id: 'reports.view', label: 'View Reports', description: 'Can access reports' },
    { id: 'users.view', label: 'View Users', description: 'Can view team members' },
    { id: 'users.invite', label: 'Invite Users', description: 'Can invite new team members' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Permissions</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Based on your role: <strong className="text-gray-900 dark:text-white">{user?.role}</strong></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map((permission) => {
          const hasAccess = hasPermission(permission.id);
          return (
            <div
              key={permission.id}
              className={`p-4 rounded-lg border ${
                hasAccess ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{permission.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{permission.description}</p>
                </div>
                <div className={`ml-4 ${hasAccess ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {hasAccess ? '✓' : '✗'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Permissions are automatically assigned based on your role. 
          Contact your Company Owner or Operations Manager to change your role.
        </p>
      </div>
    </div>
  );
};

export default PermissionsSettings;