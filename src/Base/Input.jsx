import React from 'react';

export default function Input({
  type = 'text',
  placeholder = 'John Doe',
  value,
  onChange,
  name,
  id,
  className = '',
  ...rest
}) {
  return (
    <div className="m-2">
      <input
        type={type}
        id={id || name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full py-3 px-3 rounded-md border border-gray-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition duration-200 ease-in-out ${className}`}
        {...rest}
      />
    </div>
  );
}
