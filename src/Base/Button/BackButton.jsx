import React from 'react';
import { useNavigate } from 'react-router-dom';


export default function BackButton({ className = '', label = 'Back', ...rest }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className={`
        inline-flex items-center px-4 py-3 text-sm font-semibold 
        bg-white text-gray-700 border border-gray-300 rounded-md 
        shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none 
       focus:border-primary focus:ring-primary  focus:ring-1 
        transition duration-200 ease-in-out
        ${className}
      `}
      {...rest}
    >
      <i className="fa-solid fa-backward mr-2 text-gray-500"></i>
      {label}
    </button>
  );
}
