import React from 'react';

const variants = {
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-secondary-100 text-secondary-700',
  accent: 'bg-accent-100 text-accent-700',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  danger: 'bg-danger-100 text-danger-600',
  info: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          variant === 'success' ? 'bg-success' :
          variant === 'warning' ? 'bg-warning' :
          variant === 'danger' ? 'bg-danger' :
          variant === 'info' ? 'bg-blue-500' :
          'bg-current'
        }`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
