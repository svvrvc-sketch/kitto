'use client';

import React from 'react';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-xl overflow-hidden border border-amber-500/25 dark:border-stone-800 shadow-xs select-none transition-transform duration-200 group-hover:scale-105 bg-[#141412] ${className}`}
    >
      <img
        src="/kittologo.jpg"
        alt="Kitto Logo"
        width={size}
        height={size}
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  showWordmark = true,
  showTagline = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-sans font-extrabold tracking-tight text-stone-900 dark:text-stone-100 text-xl leading-none">
              Kitto
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
          </div>
          {showTagline && (
            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium tracking-wide mt-0.5 leading-tight">
              Toshkentda kitob almashish platformasi
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
