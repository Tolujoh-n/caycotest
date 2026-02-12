import React, { useState, useEffect } from 'react';
import { FiPlus, FiBriefcase } from 'react-icons/fi';
import api from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AllWorkTab = ({ teamId }) => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const canManage = hasPermission('work.manage');

  useEffect(() => {
    fetchProjects();
  }, [teamId]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      // Filter projects that include team members
      const allProjects = response.data.data || [];
      // For now, show all projects. Later we can filter by team membership
      setProjects(allProjects);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading projects...</div>;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">All Projects</h3>
          <p className="text-sm text-gray-600 mt-1">Projects this team is working on</p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate('/work/projects')}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div
            key={project._id}
            onClick={() => navigate(`/work/projects/${project._id}`)}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: project.color }}
              />
              <h4 className="font-semibold">{project.name}</h4>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className={`px-2 py-1 rounded text-xs ${
                project.status === 'Active' ? 'bg-green-100 text-green-800' :
                project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
              <span className="text-gray-500">
                {project.members?.length || 0} members
              </span>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FiBriefcase className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No projects assigned to this team</p>
        </div>
      )}
    </div>
  );
};

export default AllWorkTab;
