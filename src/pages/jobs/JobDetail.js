import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/jobs" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
            ← Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-gray-600">{job.jobNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900">{job.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-gray-900">{job.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <p className="mt-1 text-gray-900">{job.priority}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Labor</span>
                <span className="font-medium">
                  ${(job.costs?.labor?.actual || job.costs?.labor?.estimated || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Materials</span>
                <span className="font-medium">
                  ${(job.costs?.materials?.actual || job.costs?.materials?.estimated || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Equipment</span>
                <span className="font-medium">
                  ${(job.costs?.equipment?.actual || job.costs?.equipment?.estimated || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold text-gray-900">Total Cost</span>
                <span className="font-semibold text-gray-900">
                  ${(job.costs?.total?.actual || job.costs?.total?.estimated || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium text-green-600">
                  ${(job.revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost</span>
                <span className="font-medium text-red-600">
                  ${(job.costs?.total?.actual || job.costs?.total?.estimated || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold text-gray-900">Profit</span>
                <span className={`font-semibold ${(job.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(job.profit || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-medium">
                  {job.profitMargin ? `${job.profitMargin.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            <p className="text-gray-900">
              {job.customerId?.firstName} {job.customerId?.lastName}
            </p>
            <p className="text-sm text-gray-600 mt-1">{job.customerId?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;