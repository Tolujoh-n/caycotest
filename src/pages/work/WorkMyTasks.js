import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import WorkSubTabs from './components/WorkSubTabs';
import ListTab from './components/tabs/ListTab';
import BoardTab from './components/tabs/BoardTab';
import CalendarTab from './components/tabs/CalendarTab';
import DashboardTab from './components/tabs/DashboardTab';
import FilesTab from './components/tabs/FilesTab';
import NotesTab from './components/tabs/NotesTab';

const WorkMyTasks = () => {
  const { user } = useAuth();
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState('list');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTabConfig();
    fetchTasks();
  }, []);

  const fetchTabConfig = async () => {
    try {
      const response = await api.get('/tab-configs', {
        params: {
          context: 'myTasks'
        }
      });
      
      if (response.data.data.length > 0) {
        const config = response.data.data[0];
        const visibleTabs = config.tabs.filter(t => t.isVisible).sort((a, b) => a.order - b.order);
        setTabs(visibleTabs.map(t => ({ id: t.id, label: t.label, enabled: true })));
        const defaultTab = config.tabs.find(t => t.isDefault);
        if (defaultTab) setActiveTabId(defaultTab.id);
      } else {
        const defaultTabs = [
          { id: 'list', label: 'List', enabled: true },
          { id: 'board', label: 'Board', enabled: true },
          { id: 'calendar', label: 'Calendar', enabled: true },
          { id: 'dashboard', label: 'Dashboard', enabled: true },
          { id: 'files', label: 'Files', enabled: true },
          { id: 'notes', label: 'Notes', enabled: true }
        ];
        setTabs(defaultTabs);
      }
    } catch (error) {
      console.error('Failed to fetch tab config:', error);
      const defaultTabs = [
        { id: 'list', label: 'List', enabled: true },
        { id: 'board', label: 'Board', enabled: true },
        { id: 'calendar', label: 'Calendar', enabled: true },
        { id: 'dashboard', label: 'Dashboard', enabled: true },
        { id: 'files', label: 'Files', enabled: true },
        { id: 'notes', label: 'Notes', enabled: true }
      ];
      setTabs(defaultTabs);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks', {
        params: {
          assignedTo: user?.id
        }
      });
      setTasks(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    const tabComponents = {
      list: <ListTab />,
      board: <BoardTab />,
      calendar: <CalendarTab />,
      dashboard: <DashboardTab />,
      files: <FilesTab />,
      notes: <NotesTab />
    };

    return tabComponents[activeTabId] || <div>Tab not found</div>;
  };

  return (
    <div className="space-y-4">
      <WorkSubTabs
        scopeLabel="My Tasks"
        tabs={tabs}
        activeTabId={activeTabId}
        onChangeActive={setActiveTabId}
        onChangeTabs={setTabs}
        context="myTasks"
      />

      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WorkMyTasks;
