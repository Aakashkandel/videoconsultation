import React from 'react';

export default function Button({ className = '', label = 'Click Me', icon = null, onClick, ariaLabel, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={`
        inline-flex items-center px-4 py-3 text-sm font-semibold 
        bg-white text-gray-700 border border-gray-300 rounded-md 
        shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none 
        focus:ring-1 focus:ring- focus:border-primary 
        transition duration-200 ease-in-out
        ${className}
      `}
      {...rest}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}
