import React, { useState, useEffect, useMemo } from 'react';
import { FiBriefcase } from 'react-icons/fi';
import api from '../../../../config/api';
import { toast } from 'react-hot-toast';
import ProjectDetailSidebar from '../ProjectDetailSidebar';
import JobSidebar from '../JobSidebar';

const AllWorkTab = ({ teamId }) => {
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const perPage = 12;

  useEffect(() => {
    fetchProjects();
  }, [teamId]);

  const fetchProjects = async () => {
    try {
      const [projectsRes, jobsRes] = await Promise.all([
        api.get('/projects', { params: { teamId } }),
        api.get('/jobs', { params: { teamId } })
      ]);
      const allProjects = projectsRes.data.data || [];
      const allJobs = jobsRes.data.data || [];
      setProjects(allProjects);
      setJobs(allJobs);
    } catch (error) {
      toast.error('Failed to fetch team work');
    } finally {
      setLoading(false);
    }
  };

  const pagedProjects = useMemo(() => {
    const start = (page - 1) * perPage;
    return projects.slice(start, start + perPage);
  }, [projects, page]);
  const totalPages = Math.max(1, Math.ceil(projects.length / perPage));

  if (loading) return <div className="text-center py-8">Loading team work...</div>;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">All Work</h3>
          <p className="text-sm text-gray-600 mt-1">Projects and jobs assigned to this team</p>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Projects</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pagedProjects.map(project => (
          <div
            key={project._id}
            onClick={() => setSelectedProject(project)}
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

      {projects.length > perPage && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
          <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
          <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      )}

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Jobs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <div
              key={job._id}
              onClick={() => setSelectedJob(job)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{job.jobNumber} • {job.title}</h4>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{job.status}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description || 'No description'}</p>
            </div>
          ))}
        </div>
      </div>

      {projects.length === 0 && jobs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FiBriefcase className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No work assigned to this team</p>
        </div>
      )}

      {selectedProject && (
        <ProjectDetailSidebar
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdated={async () => {
            await fetchProjects();
            const updated = projects.find(p => p._id === selectedProject._id);
            if (updated) setSelectedProject(updated);
          }}
        />
      )}
      {selectedJob && (
        <JobSidebar
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdated={fetchProjects}
        />
      )}
    </div>
  );
};

export default AllWorkTab;
