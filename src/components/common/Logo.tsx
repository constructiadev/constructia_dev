import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-15',
    md: 'h-16', 
    lg: 'h-21'
  };

  return (
    <div className="flex items-center">
      <img 
        src="/Logo ConstructIA.png" 
        alt="ConstructIA Logo" 
        className={`${sizeClasses[size]} w-auto`}
        onError={(e) => {
          // Fallback si la imagen no se encuentra
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      {/* Fallback logo */}
      <div className="hidden items-center space-x-3">
        <div className={`${
          size === 'sm' ? 'h-10 w-10' : 
          size === 'md' ? 'h-14 w-14' : 
          'h-18 w-18'
        } bg-green-600 rounded-lg flex items-center justify-center`}>
          <span className={`text-white font-bold ${
            size === 'sm' ? 'text-lg' : 
            size === 'md' ? 'text-2xl' : 
            'text-3xl'
          }`}>C</span>
        </div>
        <div className={`font-bold ${
          size === 'sm' ? 'text-xl' : 
          size === 'md' ? 'text-3xl' : 
          'text-4xl'
        } ${variant === 'light' ? 'text-white' : 'text-gray-800'}`}>
          <span style={{ fontFamily: 'Century Gothic, sans-serif' }}>
            Construct<span className="text-green-600">IA</span>
          </span>
        </div>
      </div>
    </div>
  );
}