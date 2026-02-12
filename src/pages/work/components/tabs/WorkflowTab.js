import React, { useState, useEffect, useCallback } from 'react';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../../../config/api';
import { toast } from 'react-hot-toast';

const SortableTaskCard = ({ task, stageId, onMoveForward, onMoveBackward, canMoveForward, canMoveBackward }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-medium text-sm flex-1">{task.title}</h5>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {canMoveBackward && (
            <button
              onClick={() => onMoveBackward(task._id)}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="Move to previous stage"
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
          )}
          {canMoveForward && (
            <button
              onClick={() => onMoveForward(task._id)}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="Move to next stage"
            >
              <FiArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className={`px-2 py-0.5 rounded ${
          task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
          task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

const DroppableStage = ({ stage, tasks, onMoveForward, onMoveBackward, workflowStages, stageIndex }) => {
  const { setNodeRef } = useDroppable({ id: stage.id });
  const canMoveBackward = stageIndex > 0;
  const canMoveForward = stageIndex < workflowStages.length - 1;
  const prevStage = canMoveBackward ? workflowStages[stageIndex - 1] : null;
  const nextStage = canMoveForward ? workflowStages[stageIndex + 1] : null;

  return (
    <div ref={setNodeRef} className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${stage.color}`} />
          <h4 className="font-semibold">{stage.name}</h4>
        </div>
        <span className="text-sm text-gray-500">({tasks.length})</span>
      </div>
      
      <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {tasks.map(task => (
            <SortableTaskCard
              key={task._id}
              task={task}
              stageId={stage.id}
              onMoveForward={canMoveForward ? () => onMoveForward(task._id, nextStage.id) : null}
              onMoveBackward={canMoveBackward ? () => onMoveBackward(task._id, prevStage.id) : null}
              canMoveForward={canMoveForward}
              canMoveBackward={canMoveBackward}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const WorkflowTab = ({ projectId, teamId, type = 'project' }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [workflowStages] = useState([
    { id: 'Not Started', name: 'Not Started', color: 'bg-gray-200' },
    { id: 'In Progress', name: 'In Progress', color: 'bg-blue-200' },
    { id: 'In Review', name: 'In Review', color: 'bg-yellow-200' },
    { id: 'Completed', name: 'Completed', color: 'bg-green-200' }
  ]);

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

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (teamId) params.teamId = teamId;
      
      const response = await api.get('/tasks', { params });
      setTasks(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, teamId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(t => t._id === active.id);
    if (!activeTask) return;

    // Check if dropped on a stage
    const targetStage = workflowStages.find(s => s.id === over.id);
    if (targetStage && activeTask.status !== targetStage.id) {
      handleStatusChange(active.id, targetStage.id);
      return;
    }

    // Check if dropped on another task (move within same stage)
    const overTask = tasks.find(t => t._id === over.id);
    if (overTask && activeTask.status === overTask.status) {
      // Reorder within same stage (optional - can be implemented if needed)
      return;
    }
  };

  if (loading) return <div className="text-center py-8">Loading workflow...</div>;

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Workflow Stages</h3>
        <p className="text-sm text-gray-600">Drag tasks between stages or click arrows to move them</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowStages.map((stage, idx) => {
            const stageTasks = tasks.filter(t => t.status === stage.id);
            
            return (
              <DroppableStage
                key={stage.id}
                stage={stage}
                tasks={stageTasks}
                onMoveForward={handleStatusChange}
                onMoveBackward={handleStatusChange}
                workflowStages={workflowStages}
                stageIndex={idx}
              />
            );
          })}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
              {tasks.find(t => t._id === activeId)?.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default WorkflowTab;
