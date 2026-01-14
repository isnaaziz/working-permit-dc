import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark-600 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-3 rounded-lg border border-gray-200
            bg-white text-dark-600 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-danger focus:ring-danger' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
