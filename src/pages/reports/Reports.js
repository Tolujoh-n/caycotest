import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { FiBarChart2, FiTrendingUp, FiTrendingDown, FiDollarSign, FiBriefcase, FiUsers } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const [jobReport, setJobReport] = useState(null);
  const [invoiceReport, setInvoiceReport] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const reports = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'jobs', label: 'Job Reports', icon: FiBriefcase },
    { id: 'invoices', label: 'Invoice Reports', icon: FiDollarSign },
    { id: 'profit-loss', label: 'Profit & Loss', icon: FiTrendingUp }
  ];

  const fetchJobReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/jobs', {
        params: dateRange
      });
      setJobReport(response.data);
    } catch (error) {
      toast.error('Failed to fetch job report');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/invoices', {
        params: dateRange
      });
      setInvoiceReport(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoice report');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitLoss = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/profit-loss', {
        params: dateRange
      });
      setProfitLoss(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch profit & loss report');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeReport === 'jobs') fetchJobReport();
    if (activeReport === 'invoices') fetchInvoiceReport();
    if (activeReport === 'profit-loss') fetchProfitLoss();
  }, [activeReport, dateRange]);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="input"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="input"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeReport === report.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {report.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Report Content */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {activeReport === 'overview' && <OverviewReport />}
            {activeReport === 'jobs' && jobReport && <JobReportView data={jobReport} />}
            {activeReport === 'invoices' && invoiceReport && <InvoiceReportView data={invoiceReport} />}
            {activeReport === 'profit-loss' && profitLoss && <ProfitLossView data={profitLoss} />}
          </>
        )}
      </div>
    </div>
  );
};

const OverviewReport = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Report Overview</h2>
      <p className="text-gray-600">Select a report type from the tabs above to view detailed analytics.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">Job Reports</h3>
          <p className="text-sm text-blue-700 mt-1">View job statistics, status breakdown, and financial metrics</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900">Invoice Reports</h3>
          <p className="text-sm text-green-700 mt-1">Track invoice status, payments, and outstanding amounts</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900">Profit & Loss</h3>
          <p className="text-sm text-purple-700 mt-1">Analyze revenue, costs, and profitability</p>
        </div>
      </div>
    </div>
  );
};

const JobReportView = ({ data }) => {
  const stats = data.statistics || {};
  const jobsByStatus = Object.entries(stats.byStatus || {}).map(([status, count]) => ({
    status,
    count
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Job Report</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Costs</p>
          <p className="text-2xl font-bold text-gray-900">${(stats.totalCosts || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600">Profit Margin</p>
          <p className="text-2xl font-bold text-gray-900">{stats.profitMargin?.toFixed(1) || 0}%</p>
        </div>
      </div>

      {/* Jobs by Status Chart */}
      {jobsByStatus.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Jobs by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const InvoiceReportView = ({ data }) => {
  const stats = data.statistics || {};
  const invoicesByStatus = Object.entries(stats.byStatus || {}).map(([status, count]) => ({
    status,
    count
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Invoice Report</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">${(stats.totalAmount || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600">Paid Amount</p>
          <p className="text-2xl font-bold text-gray-900">${(stats.paidAmount || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-2xl font-bold text-gray-900">${(stats.outstandingAmount || 0).toLocaleString()}</p>
        </div>
      </div>

      {invoicesByStatus.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Invoices by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={invoicesByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {invoicesByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const ProfitLossView = ({ data }) => {
  const costsData = [
    { name: 'Labor', value: data.costs.labor || 0 },
    { name: 'Materials', value: data.costs.materials || 0 },
    { name: 'Equipment', value: data.costs.equipment || 0 },
    { name: 'Subcontractors', value: data.costs.subcontractors || 0 },
    { name: 'Overhead', value: data.costs.overhead || 0 }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Profit & Loss Report</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">${(data.revenue || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Costs</p>
            <p className="text-3xl font-bold text-red-600">${(data.costs.total || 0).toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded-lg ${(data.profit || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className={`text-3xl font-bold ${(data.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(data.profit || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Margin: {data.profitMargin}%</p>
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default Reports;