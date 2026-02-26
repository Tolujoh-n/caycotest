import React, { useState, useEffect } from 'react';
import { FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import WorkSubTabs from './components/WorkSubTabs';
import TeamModal from './components/TeamModal';
import OverviewTab from './components/tabs/OverviewTab';
import MembersTab from './components/tabs/MembersTab';
import MessagesTab from './components/tabs/MessagesTab';
import AllWorkTab from './components/tabs/AllWorkTab';
import CalendarTab from './components/tabs/CalendarTab';
import KnowledgeTab from './components/tabs/KnowledgeTab';
import NotesTab from './components/tabs/NotesTab';

const WorkTeams = () => {
  const { hasPermission, user } = useAuth();
  const canManage = hasPermission('work.manage');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState('overview');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      fetchTabConfig();
    }
  }, [selectedTeamId]);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.data);
      if (response.data.data.length > 0 && !selectedTeamId) {
        setSelectedTeamId(response.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabConfig = async () => {
    try {
      const response = await api.get('/tab-configs', {
        params: {
          context: 'team',
          contextId: selectedTeamId
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
        const defaultTabIds = ['overview', 'members', 'messages', 'allwork', 'calendar', 'knowledge', 'notes'];
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
          { id: 'members', label: 'Members', enabled: true },
          { id: 'messages', label: 'Messages', enabled: true },
          { id: 'allwork', label: 'All Work', enabled: true },
          { id: 'calendar', label: 'Calendar', enabled: true },
          { id: 'knowledge', label: 'Knowledge', enabled: true },
          { id: 'notes', label: 'Notes', enabled: true }
        ];
        setTabs(defaultTabs);
      }
    } catch (error) {
      console.error('Failed to fetch tab config:', error);
    }
  };

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setShowTeamModal(true);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setShowTeamModal(true);
  };

  const renderTabContent = () => {
    const selectedTeam = teams.find(t => t._id === selectedTeamId);
    if (!selectedTeam) return null;

    const tabComponents = {
      overview: <OverviewTab teamId={selectedTeamId} type="team" />,
      members: <MembersTab teamId={selectedTeamId} />,
      messages: <MessagesTab teamId={selectedTeamId} type="team" />,
      allwork: <AllWorkTab teamId={selectedTeamId} />,
      calendar: <CalendarTab teamId={selectedTeamId} type="team" />,
      knowledge: <KnowledgeTab teamId={selectedTeamId} />,
      notes: <NotesTab teamId={selectedTeamId} type="team" />
    };

    return tabComponents[activeTabId] || <div>Tab not found</div>;
  };

  const selectedTeam = teams.find(t => t._id === selectedTeamId);

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading teams...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Team picker side nav */}
      <div className={`lg:col-span-1 transition-all duration-300 ${sidebarOpen ? '' : 'hidden lg:block'}`}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title={sidebarOpen ? 'Hide teams' : 'Show teams'}
              >
                {sidebarOpen ? <FiChevronLeft className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
              </button>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Teams</div>
            </div>
            {canManage && (
              <button
                onClick={handleCreateTeam}
                className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="Create team"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            )}
          </div>
          {sidebarOpen && (
            <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
              {teams.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">No teams yet</div>
              ) : (
                teams.map(t => (
                  <div key={t._id} className="relative group">
                    <button
                      onClick={() => setSelectedTeamId(t._id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedTeamId === t._id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="truncate">{t.name}</span>
                    </button>
                    {canManage && (
                      <button
                        onClick={() => handleEditTeam(t)}
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

      {/* Team content */}
      <div className={`space-y-4 ${sidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
        {selectedTeam ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: selectedTeam.color }} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTeam.name}</h2>
                {selectedTeam.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTeam.description}</p>
                )}
              </div>
            </div>

            <WorkSubTabs
              scopeLabel={`Team: ${selectedTeam.name}`}
              tabs={tabs}
              activeTabId={activeTabId}
              onChangeActive={setActiveTabId}
              onChangeTabs={setTabs}
              context="team"
              contextId={selectedTeamId}
            />

            <div className="min-h-[400px]">
              {renderTabContent()}
            </div>
          </>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Select a team to view details</p>
          </div>
        )}
      </div>

      <TeamModal
        isOpen={showTeamModal}
        onClose={() => {
          setShowTeamModal(false);
          setEditingTeam(null);
        }}
        team={editingTeam}
        onSuccess={fetchTeams}
      />
    </div>
  );
};

export default WorkTeams;
