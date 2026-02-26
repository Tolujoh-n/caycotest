import React, { useState, useEffect } from 'react';
import { FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import WorkSubTabs from './components/WorkSubTabs';
import ProjectModal from './components/ProjectModal';
import OverviewTab from './components/tabs/OverviewTab';
import ListTab from './components/tabs/ListTab';
import BoardTab from './components/tabs/BoardTab';
import CalendarTab from './components/tabs/CalendarTab';
import DashboardTab from './components/tabs/DashboardTab';
import TimelineTab from './components/tabs/TimelineTab';
import WorkflowTab from './components/tabs/WorkflowTab';
import MessagesTab from './components/tabs/MessagesTab';
import NotesTab from './components/tabs/NotesTab';
import FilesTab from './components/tabs/FilesTab';

const WorkProjects = () => {
  const { hasPermission, user } = useAuth();
  const canManage = hasPermission('work.manage');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState('overview');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTabConfig();
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
      if (response.data.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(response.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabConfig = async () => {
    try {
      const response = await api.get('/tab-configs', {
        params: {
          context: 'project',
          contextId: selectedProjectId
        }
      });
      
      if (response.data.data.length > 0) {
        const config = response.data.data[0];
        // Load ALL tabs (both visible and hidden) to preserve state
        const allTabsFromConfig = config.tabs.sort((a, b) => a.order - b.order);
        const tabsWithState = allTabsFromConfig.map(t => ({ 
          id: t.id, 
          label: t.label, 
          enabled: t.isVisible 
        }));
        
        // Ensure all default tabs exist
        const defaultTabIds = ['overview', 'list', 'board', 'calendar', 'dashboard', 'timeline', 'workflow', 'messages', 'notes', 'files'];
        defaultTabIds.forEach(tabId => {
          if (!tabsWithState.find(t => t.id === tabId)) {
            tabsWithState.push({ id: tabId, label: tabId.charAt(0).toUpperCase() + tabId.slice(1), enabled: false });
          }
        });
        
        setTabs(tabsWithState);
        const defaultTab = config.tabs.find(t => t.isDefault);
        if (defaultTab && defaultTab.isVisible) {
          setActiveTabId(defaultTab.id);
        } else {
          const firstEnabled = tabsWithState.find(t => t.enabled);
          if (firstEnabled) setActiveTabId(firstEnabled.id);
        }
      } else {
        const defaultTabs = [
          { id: 'overview', label: 'Overview', enabled: true },
          { id: 'list', label: 'List', enabled: true },
          { id: 'board', label: 'Board', enabled: true },
          { id: 'calendar', label: 'Calendar', enabled: true },
          { id: 'dashboard', label: 'Dashboard', enabled: true },
          { id: 'timeline', label: 'Timeline', enabled: true },
          { id: 'workflow', label: 'Workflow', enabled: true },
          { id: 'messages', label: 'Messages', enabled: true },
          { id: 'notes', label: 'Notes', enabled: true },
          { id: 'files', label: 'Files', enabled: true }
        ];
        setTabs(defaultTabs);
      }
    } catch (error) {
      console.error('Failed to fetch tab config:', error);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const renderTabContent = () => {
    const selectedProject = projects.find(p => p._id === selectedProjectId);
    if (!selectedProject) return null;

    const tabComponents = {
      overview: <OverviewTab projectId={selectedProjectId} type="project" />,
      list: <ListTab projectId={selectedProjectId} type="project" />,
      board: <BoardTab projectId={selectedProjectId} type="project" />,
      calendar: <CalendarTab projectId={selectedProjectId} type="project" />,
      dashboard: <DashboardTab projectId={selectedProjectId} type="project" />,
      timeline: <TimelineTab projectId={selectedProjectId} type="project" />,
      workflow: <WorkflowTab projectId={selectedProjectId} type="project" />,
      messages: <MessagesTab projectId={selectedProjectId} type="project" />,
      notes: <NotesTab projectId={selectedProjectId} type="project" />,
      files: <FilesTab projectId={selectedProjectId} type="project" />
    };

    return tabComponents[activeTabId] || <div>Tab not found</div>;
  };

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading projects...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Project picker side nav */}
      <div className={`lg:col-span-1 transition-all duration-300 ${sidebarOpen ? '' : 'hidden lg:block'}`}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title={sidebarOpen ? 'Hide projects' : 'Show projects'}
              >
                {sidebarOpen ? <FiChevronLeft className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
              </button>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Projects</div>
            </div>
            {canManage && (
              <button
                onClick={handleCreateProject}
                className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="Create project"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            )}
          </div>
          {sidebarOpen && (
            <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
              {projects.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">No projects yet</div>
              ) : (
                projects.map(p => (
                  <div key={p._id} className="relative group">
                    <button
                      onClick={() => setSelectedProjectId(p._id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedProjectId === p._id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="truncate">{p.name}</span>
                    </button>
                    {canManage && (
                      <button
                        onClick={() => handleEditProject(p)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-400"
                      >
                        <FiPlus className="h-3 w-3 rotate-45" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project content */}
      <div className={`space-y-4 ${sidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
        {selectedProject ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: selectedProject.color }} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedProject.name}</h2>
                {selectedProject.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProject.description}</p>
                )}
              </div>
            </div>

            <WorkSubTabs
              scopeLabel={`Project: ${selectedProject.name}`}
              tabs={tabs}
              activeTabId={activeTabId}
              onChangeActive={setActiveTabId}
              onChangeTabs={setTabs}
              context="project"
              contextId={selectedProjectId}
            />

            <div className="min-h-[400px]">
              {renderTabContent()}
            </div>
          </>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Select a project to view details</p>
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSuccess={fetchProjects}
      />
    </div>
  );
};

export default WorkProjects;
