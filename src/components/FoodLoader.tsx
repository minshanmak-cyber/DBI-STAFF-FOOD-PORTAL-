"use client";

import React from "react";

/**
 * Animated Cloche Icon with rising steam curls
 * Exactly matching the user's requested loading visual.
 */
export function FoodClocheIcon({
  className = "w-14 h-14",
}: {
  className?: string;
}) {
  return (
    <svg
      className={`${className} text-[#35118F]`}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Animated Rising Steam Curls (DBI Purple, Mint, Amber) */}
      <path
        d="M 26 14 C 24 10, 27 7, 25 3"
        className="animate-steam-1 text-[#35118F]"
        strokeWidth="2.2"
      />
      <path
        d="M 32 13 C 30 9, 34 6, 32 2"
        className="animate-steam-2 text-[#12B98A]"
        strokeWidth="2.2"
      />
      <path
        d="M 38 14 C 36 10, 39 7, 37 3"
        className="animate-steam-3 text-[#F5B51B]"
        strokeWidth="2.2"
      />

      {/* Floating Cloche Dome */}
      <g className="animate-cloche-bob">
        {/* Cloche Knob / Handle */}
        <ellipse cx="32" cy="20" rx="3.5" ry="2" fill="#35118F" />

        {/* Cloche Dome */}
        <path
          d="M 14 44 C 14 26, 50 26, 50 44 Z"
          fill="#F4F0FD"
          fillOpacity="0.4"
        />
      </g>

      {/* Serving Platter Base */}
      <line x1="10" y1="46" x2="54" y2="46" strokeWidth="2.5" />
      <path d="M 14 46 C 18 51, 46 51, 50 46" strokeWidth="2" />
    </svg>
  );
}

/**
 * Compact Food Spinner for buttons, inputs, and small badges.
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
 * Minimalist Loading State:
 * Displays ONLY the animated cloche icon centered with steam curls,
 * eliminating all bulky containers, cards, and text per user request.
 */
interface FoodLoadingStateProps {
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
  showText?: boolean;
}

export default function FoodLoadingState({
  title,
  subtitle,
  className = "",
  compact = false,
  showText = false,
}: FoodLoadingStateProps) {
  if (compact) {
    return (
      <div className={`flex items-center justify-center py-6 ${className}`}>
        <FoodClocheIcon className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 sm:py-24 text-center select-none ${className}`}
    >
      <FoodClocheIcon className="w-14 h-14 sm:w-16 sm:h-16" />
      {showText && title && (
        <span className="text-xs font-medium text-[#6A6577] mt-3">{title}</span>
      )}
    </div>
  );
}
