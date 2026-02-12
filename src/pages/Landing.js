import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiDollarSign, FiBarChart2, FiCalendar, FiFileText, FiCheck, FiArrowRight } from 'react-icons/fi';
import caycoLogo from '../assets/Cayco_logo.png';

const Landing = () => {
  const features = [
    {
      icon: FiBriefcase,
      title: 'Job Management',
      description: 'Track and manage all your projects from start to finish with detailed job costing and progress tracking.'
    },
    {
      icon: FiCalendar,
      title: 'Scheduling',
      description: 'Efficiently schedule your team and resources with a comprehensive calendar system.'
    },
    {
      icon: FiUsers,
      title: 'CRM',
      description: 'Manage customer relationships, track interactions, and build lasting partnerships.'
    },
    {
      icon: FiFileText,
      title: 'Estimating',
      description: 'Create professional estimates quickly with our easy-to-use estimation tools.'
    },
    {
      icon: FiDollarSign,
      title: 'Invoicing',
      description: 'Generate and send invoices, track payments, and manage your cash flow seamlessly.'
    },
    {
      icon: FiBarChart2,
      title: 'Analytics & Reporting',
      description: 'Make data-driven decisions with comprehensive reports and real-time analytics.'
    }
  ];

  const benefits = [
    'Complete business operations in one platform',
    'Real-time collaboration with your team',
    'Track costs and profitability accurately',
    'Professional estimates and invoices',
    'Mobile-first design for field staff',
    'Secure multi-tenant architecture'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-primary-50 border-b border-gray-100 w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src={caycoLogo} 
                  alt="Cayco" 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
              Your Complete Business
              <span className="text-primary-600 block mt-2">Operating System</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Plan work, track costs, manage customers, get paid, and make data-driven decisions—all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Start Free Trial
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to streamline your operations and boost productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 text-primary-600 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Cayco?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built for modern businesses that demand efficiency, accuracy, and growth.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Dashboard</p>
                    <p className="text-sm text-gray-600">Real-time insights</p>
                  </div>
                  <FiBarChart2 className="h-8 w-8 text-primary-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Job Tracking</p>
                    <p className="text-sm text-gray-600">Complete visibility</p>
                  </div>
                  <FiBriefcase className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Financial Control</p>
                    <p className="text-sm text-gray-600">Track everything</p>
                  </div>
                  <FiDollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business Operations?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of businesses using Cayco to streamline their operations and grow their business.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Get Started Free
            <FiArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Cayco</h3>
              <p className="text-sm">
                Your complete business operating system for managing operations, customers, and finances.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Cayco. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;