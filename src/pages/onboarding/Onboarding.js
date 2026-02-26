import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FiCheck, FiArrowRight, FiArrowLeft, FiHome, FiUsers, FiDollarSign, FiUserPlus, FiFileText } from 'react-icons/fi';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const steps = [
    { id: 1, title: 'Company Information', icon: FiHome },
    { id: 2, title: 'Pricing Rules', icon: FiDollarSign },
    { id: 3, title: 'Team Setup', icon: FiUsers },
    { id: 4, title: 'First Customer', icon: FiUserPlus },
    { id: 5, title: 'First Estimate', icon: FiFileText }
  ];

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await api.get('/onboarding/status');
      setOnboardingStatus(response.data.data);
      
      // Find first incomplete step
      const incompleteStep = steps.find((step, index) => {
        const stepKeys = ['companyInfo', 'pricingRules', 'teamSetup', 'firstCustomer', 'firstEstimate'];
        return !response.data.data.steps[stepKeys[index]];
      });
      
      if (incompleteStep) {
        setCurrentStep(incompleteStep.id);
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Mark that we're completing onboarding to prevent redirect loop
      sessionStorage.setItem('onboardingCompleting', 'true');
      
      await api.post('/onboarding/complete');
      
      // Wait a moment for the backend to fully save the changes
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh user data to ensure onboarding status is updated
      await checkAuth();
      
      // Verify onboarding is actually completed before navigating
      const statusResponse = await api.get('/onboarding/status');
      if (statusResponse.data.data.onboardingCompleted) {
        toast.success('Onboarding completed! Please check your email for your Organization ID.', {
          duration: 6000,
        });
        // Clear the flag and navigate
        sessionStorage.removeItem('onboardingCompleting');
        navigate('/dashboard');
      } else {
        // If still not completed, wait a bit more and check again
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryResponse = await api.get('/onboarding/status');
        if (retryResponse.data.data.onboardingCompleted) {
          toast.success('Onboarding completed! Please check your email for your Organization ID.', {
            duration: 6000,
          });
          sessionStorage.removeItem('onboardingCompleting');
          navigate('/dashboard');
        } else {
          sessionStorage.removeItem('onboardingCompleting');
          toast.error('Onboarding completion is being processed. Please wait a moment and refresh.');
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      sessionStorage.removeItem('onboardingCompleting');
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = onboardingStatus ? onboardingStatus.progress : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Cayco!</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = onboardingStatus?.steps[Object.keys(onboardingStatus.steps)[index]];
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 dark:bg-green-600 text-white'
                          : isActive
                          ? 'bg-primary-600 dark:bg-primary-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {isCompleted ? (
                        <FiCheck className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center ${
                        isActive ? 'font-semibold text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="card">
          {currentStep === 1 && <CompanyInfoStep onNext={handleNext} />}
          {currentStep === 2 && <PricingRulesStep onNext={handleNext} onPrevious={handlePrevious} />}
          {currentStep === 3 && <TeamSetupStep onNext={handleNext} onPrevious={handlePrevious} />}
          {currentStep === 4 && <FirstCustomerStep onNext={handleNext} onPrevious={handlePrevious} />}
          {currentStep === 5 && <FirstEstimateStep onComplete={handleComplete} onPrevious={handlePrevious} loading={loading} />}
        </div>
      </div>
    </div>
  );
};

// Step 1: Company Information
const CompanyInfoStep = ({ onNext }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const response = await api.get('/companies/me');
      const company = response.data.data;
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        industry: company.industry || '',
        address: company.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        }
      });
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/companies/me', formData);
      toast.success('Company information saved!');
      onNext();
    } catch (error) {
      toast.error('Failed to save company information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Company Information</h3>
        <p className="text-gray-600 dark:text-gray-300">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
          <input
            type="text"
            required
            className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
          <input
            type="text"
            className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="e.g., Construction, Landscaping"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
          <input
            type="email"
            required
            className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input
            type="tel"
            className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
        <input
          type="text"
          className="input mb-2"
          placeholder="Street Address"
          value={formData.address.street}
          onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            className="input"
            placeholder="City"
            value={formData.address.city}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
          />
          <input
            type="text"
            className="input"
            placeholder="State"
            value={formData.address.state}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
          />
          <input
            type="text"
            className="input"
            placeholder="ZIP Code"
            value={formData.address.zipCode}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Continue <FiArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

// Step 2: Pricing Rules
const PricingRulesStep = ({ onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    defaultMarkup: 25,
    laborRate: 50
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPricingRules();
  }, []);

  const fetchPricingRules = async () => {
    try {
      const response = await api.get('/companies/me');
      const company = response.data.data;
      if (company.pricingRules) {
        setFormData({
          defaultMarkup: (company.pricingRules.defaultMarkup || 0.25) * 100,
          laborRate: company.pricingRules.laborRate || 50
        });
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/companies/me', {
        pricingRules: {
          defaultMarkup: formData.defaultMarkup / 100,
          laborRate: formData.laborRate
        }
      });
      toast.success('Pricing rules saved!');
      onNext();
    } catch (error) {
      toast.error('Failed to save pricing rules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pricing Rules</h3>
        <p className="text-gray-600 dark:text-gray-300">Set your default pricing and markup rules</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Default Markup Percentage
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="input pr-8 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              value={formData.defaultMarkup}
              onChange={(e) => setFormData({ ...formData, defaultMarkup: parseFloat(e.target.value) || 0 })}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default markup applied to estimates and invoices</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Default Labor Rate (per hour)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input pl-8 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              value={formData.laborRate}
              onChange={(e) => setFormData({ ...formData, laborRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default hourly rate for labor costs</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onPrevious} className="btn btn-secondary">
          <FiArrowLeft className="mr-2 h-4 w-4" /> Previous
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Continue <FiArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

// Step 3: Team Setup
const TeamSetupStep = ({ onNext, onPrevious }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Team Setup</h3>
        <p className="text-gray-600 dark:text-gray-300">Invite team members to your organization</p>
      </div>

      {users.length > 1 ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">✓ You have {users.length} team members set up!</p>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200">
            You can invite team members later from Settings. For now, let's continue with setting up your first customer.
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <button type="button" onClick={onPrevious} className="btn btn-secondary">
          <FiArrowLeft className="mr-2 h-4 w-4" /> Previous
        </button>
        <button type="button" onClick={handleSkip} className="btn btn-primary">
          Continue <FiArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Step 4: First Customer
const FirstCustomerStep = ({ onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    type: 'Residential',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/customers', formData);
      toast.success('Customer created!');
      onNext();
    } catch (error) {
      toast.error('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Add Your First Customer</h3>
        <p className="text-gray-600 dark:text-gray-300">Create a sample customer to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
          <input
            type="text"
            required
            className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
          <input
            type="text"
            required
            className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
          <input
            type="email"
            required
            className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input
            type="tel"
            className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select
            className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onPrevious} className="btn btn-secondary">
          <FiArrowLeft className="mr-2 h-4 w-4" /> Previous
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Continue <FiArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

// Step 5: First Estimate
const FirstEstimateStep = ({ onComplete, onPrevious, loading }) => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    description: '',
    lineItems: [
      { description: '', quantity: 1, unit: 'ea', unitPrice: 0, markup: 25, category: 'Labor' }
    ],
    taxRate: 8
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data);
      if (response.data.data.length > 0) {
        setFormData({ ...formData, customerId: response.data.data[0]._id });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/estimates', formData);
      toast.success('Estimate created!');
      onComplete();
    } catch (error) {
      toast.error('Failed to create estimate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create Your First Estimate</h3>
        <p className="text-gray-600 dark:text-gray-300">Create a sample estimate to see how it works</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
        <select
          required
          className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          value={formData.customerId}
          onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.firstName} {customer.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
        <input
          type="text"
          required
          className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Kitchen Renovation Estimate"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          rows="3"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onPrevious} className="btn btn-secondary">
          <FiArrowLeft className="mr-2 h-4 w-4" /> Previous
        </button>
        <div className="space-x-2">
          <button type="button" onClick={handleSkip} className="btn btn-secondary">
            Skip for Now
          </button>
          <button type="submit" className="btn btn-primary flex items-center justify-center gap-2" disabled={submitting || loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Completing...
              </>
            ) : (
              <>
                Complete Setup <FiCheck className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Onboarding;