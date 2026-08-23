import React from 'react';

export default function FormSection({ title, icon, step, description, children }) {
  return (
    <div className="relative p-6 bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-200">
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-blue-500 to-blue-300 rounded-r-full opacity-60" />

      <div className="flex items-start gap-3 mb-6 pl-4">
        {step != null && (
          <div className="shrink-0 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
            {step}
          </div>
        )}
        {icon && !step && (
          <div className="shrink-0 w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && step && <span className="text-lg">{icon}</span>}
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          {description && <p className="text-sm text-gray-600 leading-relaxed">{description}</p>}
        </div>
      </div>

      <div className="space-y-5 pl-4">{children}</div>
    </div>
  );
}
