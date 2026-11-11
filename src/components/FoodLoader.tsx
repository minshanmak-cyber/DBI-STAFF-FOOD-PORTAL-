"use client";

import React from "react";

/**
 * Compact Food Spinner for buttons, inputs, and small badges.
 * Features a dual-tone luxury arc rotating with smooth easing.
 */
export function FoodSpinner({
  className = "w-4 h-4 text-white",
}: {
  className?: string;
}) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="9.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5h-2.5a7 7 0 0 0-7-7V2.5z"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" className="opacity-80" />
    </svg>
  );
}

/**
 * Full Branded Culinary Loading State
 *
 * Implements an artisan culinary loading experience for the DBI Food Portal:
 * - Concentric pulsing lavender aura with soft purple accent
 * - Floating Cloche dome with rising staggered steam curls
 * - Smooth rotating orbit ring
 * - Polished typography with animated bouncing dots
 */
interface FoodLoadingStateProps {
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export default function FoodLoadingState({
  title = "Preparing your meal portal...",
  subtitle = "Retrieving verified menu and service records",
  className = "",
  compact = false,
}: FoodLoadingStateProps) {
  if (compact) {
    return (
      <div className={`flex items-center justify-center gap-2.5 py-4 ${className}`}>
        <div className="relative w-6 h-6 flex items-center justify-center">
          <FoodSpinner className="w-5 h-5 text-[#35118F]" />
        </div>
        <span className="text-xs font-medium text-[#4A4557]">{title}</span>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-[#E5E2EE] rounded-2xl p-10 sm:p-14 text-center shadow-xs flex flex-col items-center justify-center relative overflow-hidden ${className}`}
    >
      {/* Decorative ambient background blur */}
      <div className="absolute inset-0 bg-radial from-[#F4F0FD]/80 to-transparent pointer-events-none" />

      {/* Culinary Icon with animated steam and cloche */}
      <div className="relative mb-5 flex items-center justify-center">
        {/* Pulsing Concentric Aura */}
        <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F4F0FD] border border-[#E5DBFB] animate-halo-pulse -z-0" />

        {/* Orbit Ring */}
        <svg
          className="absolute w-24 h-24 sm:w-28 sm:h-28 text-[#35118F]/20 animate-spin -z-0"
          style={{ animationDuration: "6s" }}
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <circle
            cx="50"
            cy="6"
            r="3"
            fill="#35118F"
            className="text-[#35118F]"
          />
        </svg>

        {/* Cloche Dome & Steam Container */}
        <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-xs border border-[#E5E2EE] flex items-center justify-center">
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 text-[#35118F]"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Animated Rising Steam Curls */}
            <path
              d="M 26 14 C 24 10, 27 7, 25 3"
              className="animate-steam-1 text-[#35118F]"
              strokeWidth="1.8"
            />
            <path
              d="M 32 13 C 30 9, 34 6, 32 2"
              className="animate-steam-2 text-[#12B98A]"
              strokeWidth="1.8"
            />
            <path
              d="M 38 14 C 36 10, 39 7, 37 3"
              className="animate-steam-3 text-[#F5B51B]"
              strokeWidth="1.8"
            />

            {/* Floating Cloche Dome */}
            <g className="animate-cloche-bob">
              {/* Cloche Knob / Handle */}
              <ellipse cx="32" cy="20" rx="3.5" ry="2" fill="#35118F" />

              {/* Cloche Dome */}
              <path d="M 14 44 C 14 26, 50 26, 50 44 Z" fill="#F4F0FD" fillOpacity="0.5" />
            </g>

            {/* Serving Platter Base (Static ground) */}
            <line x1="10" y1="46" x2="54" y2="46" strokeWidth="2.5" />
            <path d="M 14 46 C 18 51, 46 51, 50 46" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Loading Title with animated typing dots */}
      <h3 className="relative z-10 text-sm sm:text-base font-bold text-[#1A162B] tracking-tight flex items-center justify-center gap-0.5">
        <span>{title}</span>
        <span className="inline-flex gap-0.5 ml-0.5 text-[#35118F]">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
        </span>
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p className="relative z-10 text-xs text-[#6A6577] mt-1 max-w-sm mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Subtle bottom progress bar */}
      <div className="relative z-10 w-36 sm:w-44 h-1 bg-[#F0EDF7] rounded-full mt-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#35118F] via-[#6E3AD4] to-[#12B98A] rounded-full animate-pulse"
          style={{ width: "65%" }}
        />
      </div>
    </div>
  );
}
