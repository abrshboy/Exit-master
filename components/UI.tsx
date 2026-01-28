
import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-50 active:scale-95";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-md shadow-teal-100",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-400 shadow-sm",
    danger: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400 shadow-md",
    ghost: "bg-transparent text-teal-600 hover:bg-teal-50 border border-transparent"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode, variant?: 'success' | 'warning' | 'info' | 'locked' }> = ({ children, variant = 'info' }) => {
  const variants = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    info: "bg-teal-100 text-teal-700 border-teal-200",
    locked: "bg-gray-100 text-gray-500 border-gray-200"
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold border rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
};
