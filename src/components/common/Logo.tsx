import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const colorClasses = {
    light: 'text-white',
    dark: 'text-gray-800'
  };

  return (
    <div className="flex items-center space-x-2">
      <img 
        src="/ChatGPT Image 31 jul 2025, 12_39_17.png" 
        alt="ConstructIA Logo" 
        className={`${
          size === 'sm' ? 'h-8 w-8' : 
          size === 'md' ? 'h-10 w-10' : 
          'h-12 w-12'
        } object-contain`}
      />
      <div className={`font-bold ${sizeClasses[size]} ${colorClasses[variant]}`}>
        <span style={{ fontFamily: 'Century Gothic, sans-serif' }}>
          Construct<span className="text-green-600">IA</span>
        </span>
      </div>
    </div>
  );
}