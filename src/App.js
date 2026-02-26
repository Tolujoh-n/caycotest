import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Landing Page
import Landing from './pages/Landing';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import InviteAccept from './pages/auth/InviteAccept';
import ForgotOrganizationId from './pages/auth/ForgotOrganizationId';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Jobs from './pages/jobs/Jobs';
import JobDetail from './pages/jobs/JobDetail';
import JobCreate from './pages/jobs/JobCreate';
import Schedules from './pages/schedules/Schedules';
import Customers from './pages/customers/Customers';
import CustomerDetail from './pages/customers/CustomerDetail';
import Estimates from './pages/estimates/Estimates';
import EstimateDetail from './pages/estimates/EstimateDetail';
import EstimateCreate from './pages/estimates/EstimateCreate';
import Invoices from './pages/invoices/Invoices';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import Onboarding from './pages/onboarding/Onboarding';
import Purchasing from './pages/purchasing/Purchasing';
import Equipment from './pages/equipment/Equipment';
import Work from './pages/work/Work';
import Inbox from './pages/inbox/Inbox';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-right" />
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="/forgot-organization-id" element={<ForgotOrganizationId />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/jobs"
              element={
                <ProtectedRoute permission="jobs.view">
                  <Layout>
                    <Jobs />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute permission="jobs.create">
                  <Layout>
                    <JobCreate />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute permission="jobs.view">
                  <Layout>
                    <JobDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/schedules"
              element={
                <ProtectedRoute permission="schedules.view">
                  <Layout>
                    <Schedules />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/work/*"
              element={
                <ProtectedRoute permission="work.view">
                  <Layout>
                    <Work />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/inbox"
              element={
                <ProtectedRoute permission="inbox.view">
                  <Layout>
                    <Inbox />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customers"
              element={
                <ProtectedRoute permission="customers.view">
                  <Layout>
                    <Customers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customers/:id"
              element={
                <ProtectedRoute permission="customers.view">
                  <Layout>
                    <CustomerDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/estimates"
              element={
                <ProtectedRoute permission="estimates.view">
                  <Layout>
                    <Estimates />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/estimates/new"
              element={
                <ProtectedRoute permission="estimates.create">
                  <Layout>
                    <EstimateCreate />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/estimates/:id"
              element={
                <ProtectedRoute permission="estimates.view">
                  <Layout>
                    <EstimateDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/invoices"
              element={
                <ProtectedRoute permission="invoices.view">
                  <Layout>
                    <Invoices />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute permission="invoices.view">
                  <Layout>
                    <InvoiceDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <ProtectedRoute permission="reports.view">
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/purchasing"
              element={
                <ProtectedRoute permission="jobs.view">
                  <Layout>
                    <Purchasing />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/equipment"
              element={
                <ProtectedRoute permission="jobs.view">
                  <Layout>
                    <Equipment />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;