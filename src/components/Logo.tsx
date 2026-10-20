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
      className={`relative flex items-center justify-center shrink-0 rounded-xl bg-[#F8F7F4] dark:bg-[#141413] border border-stone-200/90 dark:border-zinc-800 text-[#141413] dark:text-[#F8F7F4] shadow-xs select-none transition-transform duration-200 group-hover:scale-105 ${className}`}
    >
      <svg
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-0.5"
      >
        {/* Open book pages forming the literary base */}
        <path
          d="M3.5 17.5C6 16.2 8.8 16.2 12 17.5V7.5C8.8 6.2 6 6.2 3.5 7.5V17.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.5 17.5C18 16.2 15.2 16.2 12 17.5V7.5C15.2 6.2 18 6.2 20.5 7.5V17.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center book spine rising seamlessly into location pin */}
        <path
          d="M12 2.5C9.8 2.5 8 4.3 8 6.5C8 9.5 12 13.8 12 13.8C12 13.8 16 9.5 16 6.5C16 4.3 14.2 2.5 12 2.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Tiny warmth accent in amber (#D97706) */}
        <circle cx="12" cy="6.5" r="1.2" fill="#D97706" />

        {/* Subtle circular exchange (swap) gesture arcs */}
        <path
          d="M6 12C5.2 13.2 5 14.6 5.5 16"
          stroke="#D97706"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="1.5 2"
        />
        <path
          d="M18 12C18.8 10.8 19 9.4 18.5 8"
          stroke="#D97706"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="1.5 2"
        />
      </svg>
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
          <div className="flex items-center">
            <span className="font-serif font-bold tracking-tight text-[#141413] dark:text-[#F8F7F4] text-xl leading-none">
              Kitto
            </span>
          </div>
          {showTagline && (
            <p className="text-[10px] text-stone-500 dark:text-zinc-400 tracking-wide mt-0.5 leading-tight">
              Toshkentda kitob almashish platformasi
            </p>
          )}
        </div>
      )}
    </div>
  );
};
