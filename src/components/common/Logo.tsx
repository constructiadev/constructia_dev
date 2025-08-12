import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-15',
    lg: 'h-12'
  };

  return (
    <div className="flex items-center space-x-3">
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
      <div className="hidden items-center space-x-2">
        <div className={`${
          size === 'sm' ? 'h-8 w-8' : 
          size === 'md' ? 'h-10 w-10' : 
          'h-12 w-12'
        } bg-green-600 rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <div className={`font-bold ${
          size === 'sm' ? 'text-lg' : 
          size === 'md' ? 'text-2xl' : 
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