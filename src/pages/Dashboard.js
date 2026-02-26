import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUsers, FiDollarSign, FiFileText, FiCalendar, FiTrendingUp, FiTrendingDown, FiArrowRight } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    // Add a small delay before checking onboarding to allow backend to save
    const timer = setTimeout(() => {
      checkOnboarding();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const checkOnboarding = async () => {
    try {
      // Check if we're in the process of completing onboarding
      const isCompleting = sessionStorage.getItem('onboardingCompleting') === 'true';
      
      // If we just completed onboarding, wait a bit longer before checking
      if (isCompleting) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        sessionStorage.removeItem('onboardingCompleting');
      }
      
      const response = await api.get('/onboarding/status');
      setOnboardingStatus(response.data.data);
      
      // Redirect to onboarding if not completed
      // Only redirect if we're sure onboarding is not completed and we're not in the process of completing
      if (!response.data.data.onboardingCompleted && user?.role === 'Company Owner' && !isCompleting) {
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No data available. Please seed the database first.</p>
      </div>
    );
  }

  const overview = data.overview || {};
  const financial = data.financial || {};

  const statsCards = [
    {
      title: 'Total Jobs',
      value: overview.totalJobs || 0,
      icon: FiBriefcase,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Active Jobs',
      value: overview.activeJobs || 0,
      icon: FiCalendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Total Customers',
      value: overview.totalCustomers || 0,
      icon: FiUsers,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Total Revenue',
      value: `$${(financial.totalRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Outstanding',
      value: `$${(financial.outstandingAmount || 0).toLocaleString()}`,
      icon: FiFileText,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      title: 'Total Profit',
      value: `$${(financial.totalProfit || 0).toLocaleString()}`,
      icon: FiTrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      subtitle: `Margin: ${financial.profitMargin || 0}%`
    }
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      {/* Onboarding Banner */}
      {onboardingStatus && !onboardingStatus.onboardingCompleted && user?.role === 'Company Owner' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">Complete Your Setup</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You're {Math.round(onboardingStatus.progress)}% complete. Finish setting up your account to get the most out of Cayco.
              </p>
            </div>
            <Link to="/onboarding" className="btn btn-primary flex items-center gap-2">
              Continue Setup <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
          {data.charts?.revenueTrend && data.charts.revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.charts.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="_id" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} className="dark:bg-gray-800 dark:border-gray-700" />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No revenue data available
            </div>
          )}
        </div>

        {/* Jobs by Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Jobs by Status</h3>
          {data.charts?.jobsByStatus && data.charts.jobsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.charts.jobsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.charts.jobsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} className="dark:bg-gray-800 dark:border-gray-700" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No job status data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Jobs</h3>
            <Link to="/jobs" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {data.recentActivity?.jobs && data.recentActivity.jobs.length > 0 ? (
              data.recentActivity.jobs.slice(0, 5).map((job) => (
              <div key={job._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {job.customerId?.firstName} {job.customerId?.lastName}
                  </p>
                </div>
                <span className={`badge ${
                  job.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  job.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {job.status}
                </span>
              </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent jobs</p>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
            <Link to="/invoices" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {data.recentActivity?.invoices && data.recentActivity.invoices.length > 0 ? (
              data.recentActivity.invoices.slice(0, 5).map((invoice) => (
              <div key={invoice._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {invoice.customerId?.firstName} {invoice.customerId?.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">${invoice.total?.toLocaleString()}</p>
                  <span className={`badge ${
                    invoice.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    invoice.status === 'Overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent invoices</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;