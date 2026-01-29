import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    company: '',
    idCardNumber: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.idCardNumber.trim()) newErrors.idCardNumber = 'ID Card number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 4) newErrors.username = 'Username must be at least 4 characters';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        company: formData.company,
        idCardNumber: formData.idCardNumber,
        username: formData.username,
        password: formData.password,
        role: 'VISITOR', // Default role for new registrations
      });
      
      if (result.success) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setApiError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setApiError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary-500 to-primary-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')]"></div>
        </div>

        <div className="relative text-center text-white max-w-md">
          <div className="w-32 h-32 bg-white/10 rounded-3xl mx-auto mb-8 flex items-center justify-center backdrop-blur-sm">
            <i className="ri-user-add-line text-6xl text-white"></i>
          </div>
          <h2 className="text-3xl font-bold mb-4">Join DCPermit Today</h2>
          <p className="text-secondary-100 leading-relaxed">
            Create your account and start requesting working permits for data center access. 
            Simple, secure, and streamlined.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4 text-left">
            {[
              { icon: 'ri-time-line', text: 'Quick approval process' },
              { icon: 'ri-qr-code-line', text: 'Digital QR code access' },
              { icon: 'ri-notification-3-line', text: 'Real-time notifications' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <i className={`${feature.icon} text-lg`}></i>
                </div>
                <span className="text-white/90">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
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
            <h1 className="text-3xl font-bold text-dark-600 mb-2">Create Account</h1>
            <p className="text-gray-500">
              Fill in your details to get started
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <i className="ri-checkbox-circle-line text-green-500 text-xl"></i>
              <div>
                <p className="text-green-800 font-medium">Success!</p>
                <p className="text-green-600 text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {/* API Error Alert */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <i className="ri-error-warning-line text-red-500 text-xl"></i>
              <div>
                <p className="text-red-800 font-medium">Registration Failed</p>
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <Input
                  label="Full Name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  icon={<i className="ri-user-line"></i>}
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  icon={<i className="ri-mail-line"></i>}
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />

                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  icon={<i className="ri-phone-line"></i>}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                />

                <Input
                  label="Company"
                  name="company"
                  type="text"
                  placeholder="Enter your company name"
                  icon={<i className="ri-building-line"></i>}
                  value={formData.company}
                  onChange={handleChange}
                  error={errors.company}
                />

                <Input
                  label="ID Card Number (KTP/Passport)"
                  name="idCardNumber"
                  type="text"
                  placeholder="Enter your ID card number"
                  icon={<i className="ri-id-card-line"></i>}
                  value={formData.idCardNumber}
                  onChange={handleChange}
                  error={errors.idCardNumber}
                />

                <Button type="button" className="w-full" onClick={handleNextStep}>
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  icon={<i className="ri-at-line"></i>}
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  icon={<i className="ri-lock-line"></i>}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  icon={<i className="ri-lock-line"></i>}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                  </span>
                </label>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={handlePrevStep}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" loading={isLoading}>
                    Create Account
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
