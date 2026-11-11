import React from "react";

/**
 * Standard Cloche Icon used across Staff, Admin, and Canteen portals for Dinner.
 */
export default function ClocheIcon({
  className = "w-4 h-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 7a2 2 0 1 1 4 0" />
      <path d="M4 17a8 8 0 0 1 16 0" />
      <line x1="2" y1="18" x2="22" y2="18" />
    </svg>
  );
}
