import React from 'react';

export default function Checkbox({ id, label, checked, onChange, disabled = false, error = false, size = 'md', className = '', children, ...props }) {
  const sizeBox = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }[size];
  const sizeLabel = { sm: 'text-sm', md: 'text-sm', lg: 'text-base' }[size];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`${sizeBox} rounded border-2 transition-all duration-200
          text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          bg-white cursor-pointer
          ${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        {...props}
      />
      {(label || children) && (
        <div className="flex-1">
          <label htmlFor={id} className={`font-medium cursor-pointer select-none ${sizeLabel} ${error ? 'text-red-700' : 'text-gray-900'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {label}
          </label>
          {children && <div className="mt-1">{children}</div>}
        </div>
      )}
    </div>
  );
}
