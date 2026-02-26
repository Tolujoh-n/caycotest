import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { FiSun, FiMoon } from 'react-icons/fi';
import loginImage from '../../assets/login-img.png';
import caycoLogo from '../../assets/Cayco_logo.png';

const Login = () => {
  const [formData, setFormData] = useState({ organizationId: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.organizationId, formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left side - Image (hidden on mobile, visible on md+) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 relative overflow-hidden">
        <div className="absolute top-8 right-8 z-10">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-white hover:bg-white/20 transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <FiMoon className="h-5 w-5" />
            ) : (
              <FiSun className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <img
            src={loginImage}
            alt="Login"
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="absolute top-8 left-8">
          <Link to="/" className="inline-block">
            <img 
              src={caycoLogo} 
              alt="Cayco" 
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Welcome Back!</h3>
          <p className="text-primary-100 dark:text-primary-200">
            Sign in to access your business operating system and manage your operations efficiently.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-4 right-4 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <FiMoon className="h-5 w-5" />
            ) : (
              <FiSun className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="text-center md:hidden mb-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">Cayco</span>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                Create one now
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization ID *
                </label>
                <input
                  id="organizationId"
                  name="organizationId"
                  type="text"
                  autoComplete="organization"
                  required
                  className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter your organization ID"
                  value={formData.organizationId}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Forgot your Organization ID?{' '}
                  <Link to="/forgot-organization-id" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium">
                    Click here
                  </Link>
                </p>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium">
                    Forgot password?
                  </Link>
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-base font-medium"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;