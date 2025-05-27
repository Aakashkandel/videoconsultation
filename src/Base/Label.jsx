import React from 'react';

export default function Label({ htmlFor, children, className = '', required = false }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block mb-1 font-medium text-gray-700 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
