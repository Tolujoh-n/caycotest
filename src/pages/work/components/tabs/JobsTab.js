import React, { useEffect, useMemo, useState } from 'react';
import { FiBriefcase, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../../../config/api';
import { toast } from 'react-hot-toast';
import JobSidebar from '../JobSidebar';

const statusPill = (status) => {
  const base = 'text-xs px-2 py-1 rounded';
  switch (status) {
    case 'Quote':
      return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300`;
    case 'Scheduled':
      return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300`;
    case 'In Progress':
      return `${base} bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300`;
    case 'Completed':
      return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
    case 'Cancelled':
      return `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`;
    default:
      return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
  }
};

const JobsTab = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs', { params: { myWork: true } });
      setJobs(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load assigned jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const grouped = useMemo(() => {
    const byStatus = jobs.reduce((acc, j) => {
      const key = j.status || 'Quote';
      acc[key] = acc[key] || [];
      acc[key].push(j);
      return acc;
    }, {});
    return byStatus;
  }, [jobs]);

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading jobs…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Jobs</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Jobs assigned to you and your teams</p>
        </div>
        <button type="button" onClick={fetchJobs} className="btn btn-secondary flex items-center gap-2">
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="card text-center py-12">
          <FiBriefcase className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400">No assigned jobs yet.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => navigate('/jobs')}>
            View Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(grouped).map(([status, items]) => (
            <div key={status} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={statusPill(status)}>{status}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{items.length}</span>
                </div>
                <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline" onClick={() => navigate('/jobs')}>
                  View all <FiExternalLink className="inline h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {items.slice(0, 8).map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {job.jobNumber} • {job.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {job.customerId ? `${job.customerId.firstName || ''} ${job.customerId.lastName || ''}`.trim() : 'No customer'}
                          {job.customerId?.company ? ` • ${job.customerId.company}` : ''}
                        </p>
                      </div>
                      <span className={statusPill(job.status)}>{job.status}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {!!job.assignedTeams?.length && (
                        <div className="flex flex-wrap gap-2">
                          {job.assignedTeams.slice(0, 3).map((t) => (
                            <span
                              key={t._id}
                              className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-1"
                              title={t.name}
                            >
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color || '#10B981' }} />
                              {t.name}
                            </span>
                          ))}
                          {job.assignedTeams.length > 3 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">+{job.assignedTeams.length - 3} teams</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <JobSidebar
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdated={fetchJobs}
        />
      )}
    </div>
  );
};

export default JobsTab;

