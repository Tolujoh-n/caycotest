import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import WorkMyTasks from './WorkMyTasks';
import WorkProjects from './WorkProjects';
import WorkTeams from './WorkTeams';

const Work = () => {
  const { hasPermission } = useAuth();
  const [activeTopTab, setActiveTopTab] = useState('my-tasks'); // my-tasks | projects | teams

  const topTabs = useMemo(() => ([
    { id: 'my-tasks', label: 'My Tasks' },
    { id: 'projects', label: 'Projects' },
    { id: 'teams', label: 'Teams' }
  ]), []);

  const canManage = hasPermission('work.manage');

  return (
    <div className="space-y-6">

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {topTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTopTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTopTab === tab.id
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {activeTopTab === 'my-tasks' && <WorkMyTasks />}
          {activeTopTab === 'projects' && <WorkProjects />}
          {activeTopTab === 'teams' && <WorkTeams />}
        </div>
      </div>
    </div>
  );
};

export default Work;

