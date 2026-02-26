import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { FiPlus, FiMoreHorizontal, FiMenu, FiX } from 'react-icons/fi';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../../config/api';
import { toast } from 'react-hot-toast';

const SortableTab = ({ tab, activeTabId, onActivate, onMenuClick, menuTabId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        onClick={() => onActivate(tab.id)}
        className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
          activeTabId === tab.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <FiMenu className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </span>
        <span>{tab.label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick(tab.id);
          }}
          className="p-1 rounded hover:bg-white/60 dark:hover:bg-gray-600"
          title="Tab actions"
        >
          <FiMoreHorizontal className="h-4 w-4" />
        </button>
      </button>
    </div>
  );
};

// All available tabs by context
const getAvailableTabs = (context) => {
  if (context === 'team') {
    return [
      { id: 'overview', label: 'Overview', enabled: true },
      { id: 'members', label: 'Members', enabled: true },
      { id: 'messages', label: 'Messages', enabled: true },
      { id: 'allwork', label: 'All Work', enabled: true },
      { id: 'calendar', label: 'Calendar', enabled: true },
      { id: 'knowledge', label: 'Knowledge', enabled: true },
      { id: 'notes', label: 'Notes', enabled: true }
    ];
  }
  // Default for project
  return [
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
};

const WorkSubTabs = ({ scopeLabel, tabs, activeTabId, onChangeActive, onChangeTabs, context, contextId }) => {
  const enabledTabs = useMemo(() => tabs.filter(t => t.enabled), [tabs]);
  const disabledTabs = useMemo(() => tabs.filter(t => !t.enabled), [tabs]);
  const [menuTabId, setMenuTabId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState({ isOpen: false, tabId: null, label: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.tab-menu')) {
        setMenuTabId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Get all available tabs (including those not yet added)
  const getAllAvailableTabs = useCallback(() => {
    const existingTabIds = new Set(tabs.map(t => t.id));
    const availableTabs = getAvailableTabs(context);
    const notYetAdded = availableTabs.filter(t => !existingTabIds.has(t.id));
    return [...disabledTabs, ...notYetAdded];
  }, [tabs, disabledTabs, context]);

  const saveTabConfig = async (updatedTabs) => {
    if (!context) return;
    
    try {
      // Save ALL tabs (both enabled and disabled) to preserve state
      const allTabsToSave = [...updatedTabs];
      
      // Ensure all default tabs exist in the config
      const availableTabs = getAvailableTabs(context);
      availableTabs.forEach(defaultTab => {
        const exists = allTabsToSave.find(t => t.id === defaultTab.id);
        if (!exists) {
          allTabsToSave.push({ ...defaultTab, enabled: false });
        }
      });

      // Separate enabled and disabled tabs
      const enabledTabsList = allTabsToSave.filter(t => t.enabled);
      const disabledTabsList = allTabsToSave.filter(t => !t.enabled);

      const tabsData = [
        // Enabled tabs with their order
        ...enabledTabsList.map((tab, idx) => ({
          id: tab.id,
          label: tab.label,
          order: idx,
          isVisible: true,
          isDefault: activeTabId === tab.id
        })),
        // Disabled tabs with high order numbers
        ...disabledTabsList.map((tab, idx) => ({
          id: tab.id,
          label: tab.label,
          order: 1000 + idx, // High order for disabled tabs
          isVisible: false,
          isDefault: false
        }))
      ];

      await api.post('/tab-configs', {
        context,
        contextId: contextId || null,
        tabs: tabsData
      });
    } catch (error) {
      console.error('Failed to save tab config:', error);
      toast.error('Failed to save tab configuration');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = enabledTabs.findIndex(t => t.id === active.id);
    const newIndex = enabledTabs.findIndex(t => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(enabledTabs, oldIndex, newIndex);
    const allTabs = [...tabs];
    
    // Update enabled tabs with new order
    reordered.forEach((tab, idx) => {
      const tabIndex = allTabs.findIndex(t => t.id === tab.id);
      if (tabIndex >= 0) {
        allTabs[tabIndex] = { ...tab };
      }
    });

    onChangeTabs(allTabs);
    await saveTabConfig(allTabs);
  };

  const handleRename = () => {
    if (!showRenameModal.label.trim()) {
      toast.error('Tab name cannot be empty');
      return;
    }
    
    const updated = tabs.map(t => 
      t.id === showRenameModal.tabId 
        ? { ...t, label: showRenameModal.label.trim() } 
        : t
    );
    onChangeTabs(updated);
    saveTabConfig(updated);
    setShowRenameModal({ isOpen: false, tabId: null, label: '' });
    setMenuTabId(null);
    toast.success('Tab renamed');
  };

  const handleDisableTab = async (tabId) => {
    const nextTabs = tabs.map(t => (t.id === tabId ? { ...t, enabled: false } : t));
    onChangeTabs(nextTabs);
    await saveTabConfig(nextTabs);

    if (activeTabId === tabId) {
      const nextEnabled = nextTabs.find(t => t.enabled);
      if (nextEnabled) onChangeActive(nextEnabled.id);
    }
    setMenuTabId(null);
    toast.success('Tab removed');
  };

  const handleEnableTab = async (tabId) => {
    let updated;
    const existingTab = tabs.find(t => t.id === tabId);
    
    if (existingTab) {
      // Tab exists but is disabled
      updated = tabs.map(t => (t.id === tabId ? { ...t, enabled: true } : t));
    } else {
      // Tab doesn't exist yet, add it
      const availableTabs = getAvailableTabs(context);
      const defaultTab = availableTabs.find(t => t.id === tabId);
      if (defaultTab) {
        updated = [...tabs, { ...defaultTab, enabled: true }];
      } else {
        toast.error('Tab not found');
        return;
      }
    }
    
    onChangeTabs(updated);
    await saveTabConfig(updated);
    onChangeActive(tabId);
    setShowAddModal(false);
    toast.success('Tab added');
  };

  const handleSetDefaultTab = async (tabId) => {
    const updated = tabs.map(t => ({
      ...t,
      isDefault: t.id === tabId
    }));
    onChangeTabs(updated);
    await saveTabConfig(updated);
    onChangeActive(tabId);
    setMenuTabId(null);
    toast.success('Default tab set');
  };

  const handleDuplicateTab = async (tabId) => {
    const current = tabs.find(t => t.id === tabId);
    if (!current) {
      toast.error('Tab not found');
      return;
    }
    
    const newId = `${current.id}-copy-${Date.now()}`;
    const newTab = { 
      ...current, 
      id: newId, 
      label: `${current.label} (Copy)`,
      enabled: true
    };
    const updated = [...tabs, newTab];
    onChangeTabs(updated);
    await saveTabConfig(updated);
    onChangeActive(newId);
    setMenuTabId(null);
    toast.success('Tab duplicated');
  };

  const availableTabsToAdd = getAllAvailableTabs();

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{scopeLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 p-2 overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={enabledTabs.map(t => t.id)} strategy={horizontalListSortingStrategy}>
              {enabledTabs.map(tab => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  activeTabId={activeTabId}
                  onActivate={onChangeActive}
                  onMenuClick={setMenuTabId}
                  menuTabId={menuTabId}
                />
              ))}
            </SortableContext>
          </DndContext>

          {menuTabId && (
            <div className="absolute z-30 mt-12 ml-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1 tab-menu">
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                onClick={() => {
                  const tab = tabs.find(t => t.id === menuTabId);
                  setShowRenameModal({ isOpen: true, tabId: menuTabId, label: tab?.label || '' });
                  setMenuTabId(null);
                }}
              >
                Rename
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                onClick={() => handleSetDefaultTab(menuTabId)}
              >
                Set as default
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                onClick={() => handleDuplicateTab(menuTabId)}
              >
                Make a copy
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400"
                onClick={() => handleDisableTab(menuTabId)}
              >
                Remove tab
              </button>
            </div>
          )}

          <div className="ml-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              title={availableTabsToAdd.length ? `Add tab (${availableTabsToAdd.length} available)` : 'All tabs added'}
            >
              <FiPlus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Tab Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" onClick={() => setShowAddModal(false)}></div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Add Tab</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                {availableTabsToAdd.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">All tabs are already added</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableTabsToAdd.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleEnableTab(tab.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{tab.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{tab.id}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Tab Modal */}
      {showRenameModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" onClick={() => setShowRenameModal({ isOpen: false, tabId: null, label: '' })}></div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Rename Tab</h3>
                  <button
                    onClick={() => setShowRenameModal({ isOpen: false, tabId: null, label: '' })}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                <input
                  type="text"
                  className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Tab name"
                  value={showRenameModal.label}
                  onChange={(e) => setShowRenameModal({ ...showRenameModal, label: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRename();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleRename}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 dark:bg-primary-500 text-base font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => setShowRenameModal({ isOpen: false, tabId: null, label: '' })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkSubTabs;
