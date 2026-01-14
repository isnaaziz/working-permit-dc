import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear errors on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        // Redirect based on role
        const role = result.user.role;
        switch (role) {
          case 'SECURITY':
            navigate('/dashboard/access');
            break;
          case 'MANAGER':
          case 'PIC':
            navigate('/dashboard/approvals');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setApiError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setApiError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <i className="ri-server-line text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold text-dark-600">
              DC<span className="text-primary-600">Permit</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-600 mb-2">Welcome back</h1>
            <p className="text-gray-500">
              Enter your credentials to access your account
            </p>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <i className="ri-error-warning-line text-red-500 text-xl"></i>
              <div>
                <p className="text-red-800 font-medium">Login Failed</p>
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username or Email"
              name="username"
              type="text"
              placeholder="Enter your username"
              icon={<i className="ri-user-line"></i>}
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              icon={<i className="ri-lock-line"></i>}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={isLoading}>
              Sign In
            </Button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium text-sm mb-2">
              <i className="ri-information-line mr-1"></i>
              Demo Credentials
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Visitor:</strong> visitor1 / password123</p>
              <p><strong>PIC:</strong> pic1 / password123</p>
              <p><strong>Manager:</strong> manager1 / password123</p>
              <p><strong>Security:</strong> security1 / password123</p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <i className="ri-google-fill text-red-500"></i>
              <span className="text-sm font-medium text-gray-600">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <i className="ri-microsoft-fill text-blue-500"></i>
              <span className="text-sm font-medium text-gray-600">Microsoft</span>
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center mt-8 text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-dark-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')]"></div>
        </div>

        <div className="relative text-center text-white max-w-md">
          <div className="w-32 h-32 bg-white/10 rounded-3xl mx-auto mb-8 flex items-center justify-center backdrop-blur-sm">
            <i className="ri-shield-keyhole-line text-6xl text-white"></i>
          </div>
          <h2 className="text-3xl font-bold mb-4">Secure Access Management</h2>
          <p className="text-primary-100 leading-relaxed">
            Our system ensures secure, compliant access to your data center facilities with 
            multi-level approval workflows and real-time tracking.
          </p>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold">256-bit</div>
              <div className="text-sm text-primary-200">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">2FA</div>
              <div className="text-sm text-primary-200">Authentication</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-primary-200">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
