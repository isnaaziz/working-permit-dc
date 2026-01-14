import React from 'react';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-md hover:shadow-lg',
  accent: 'bg-accent hover:bg-accent-hover text-white shadow-md hover:shadow-lg',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50',
  danger: 'bg-danger hover:bg-danger-600 text-white shadow-md hover:shadow-lg',
  success: 'bg-success hover:bg-success-600 text-white shadow-md hover:shadow-lg',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4\" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default Button;
