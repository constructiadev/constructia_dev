import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-16',
    md: 'h-20', 
    lg: 'h-24'
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
          size === 'md' ? 'h-12 w-12' : 
          'h-16 w-16'
        } bg-green-600 rounded-lg flex items-center justify-center`}>
          <span className={`text-white font-bold ${
            size === 'sm' ? 'text-lg' : 
            size === 'md' ? 'text-xl' : 
            'text-2xl'
          }`}>C</span>
        </div>
        <div className={`font-bold ${
          size === 'sm' ? 'text-xl' : 
          size === 'md' ? 'text-2xl' : 
          'text-3xl'
        } ${variant === 'light' ? 'text-white' : 'text-gray-800'}`}>
          <span style={{ fontFamily: 'Century Gothic, sans-serif' }}>
            Construct<span className="text-green-600">IA</span>
          </span>
        </div>
      </div>
    </div>
  );
}