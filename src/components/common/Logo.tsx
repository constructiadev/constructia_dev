import React from 'react';
import { Building2 } from 'lucide-react';

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
      <div className="bg-green-600 p-2 rounded-lg">
        <Building2 className="text-white" size={size === 'sm' ? 16 : size === 'md' ? 24 : 32} />
      </div>
      <div className={`font-bold ${sizeClasses[size]} ${colorClasses[variant]}`}>
        <span style={{ fontFamily: 'Century Gothic, sans-serif' }}>
          Construct<span className="text-green-600">IA</span>
        </span>
      </div>
    </div>
  );
}