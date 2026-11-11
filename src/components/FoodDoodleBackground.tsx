import React from "react";

/**
 * Bespoke Food Doodle Background Watermark Overlay
 *
 * Implements subtle, whimsical line-art culinary illustrations positioned
 * around the page perimeter matching the DBI Senior UI design specification:
 * - Top-Left: Leaf sprig / herbs
 * - Left-Center: Steaming coffee/tea cup on saucer
 * - Bottom-Left: Swiss cheese block & olive branch
 * - Top-Right: Serving cloche with steam, fresh salad bowl, vine tomatoes
 * - Right-Center: Flaky croissant
 * - Bottom-Right: Pizza slice & fork/knife cutlery
 *
 * Designed with zero interaction interference (pointer-events-none),
 * crisp responsive vector scaling, and gentle DBI brand violet tone.
 */
export default function FoodDoodleBackground() {
  const strokeClass = "text-[#35118F] opacity-30 stroke-current";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      <div className="relative w-full h-full max-w-[1560px] mx-auto">
        {/* ========================================================================= */}
        {/* TOP-LEFT: Leaf Sprig / Branch                                             */}
        {/* ========================================================================= */}
        <div className="absolute top-14 left-2 sm:top-18 sm:left-4 md:left-6 lg:left-8 xl:left-10">
          <svg
            className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${strokeClass}`}
            viewBox="0 0 100 100"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Main curved stem */}
            <path d="M 16 18 C 30 30, 48 48, 68 74" />
            {/* Top Leaf */}
            <path d="M 24 24 C 20 10, 36 8, 44 18 C 48 26, 34 30, 24 24 Z" />
            <path d="M 24 24 Q 34 18 44 18" strokeWidth="1.2" />
            {/* Upper Right Leaf */}
            <path d="M 36 34 C 48 24, 62 32, 56 44 C 48 54, 36 44, 36 34 Z" />
            <path d="M 36 34 Q 46 38 56 44" strokeWidth="1.2" />
            {/* Lower Left Leaf */}
            <path d="M 44 48 C 34 54, 30 68, 42 70 C 52 70, 52 56, 44 48 Z" />
            <path d="M 44 48 Q 40 58 42 70" strokeWidth="1.2" />
            {/* Terminal Leaf */}
            <path d="M 56 58 C 66 52, 82 60, 76 72 C 68 82, 54 70, 56 58 Z" />
            <path d="M 56 58 Q 66 66 76 72" strokeWidth="1.2" />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* LEFT-CENTER: Steaming Coffee/Tea Cup                                      */}
        {/* ========================================================================= */}
        <div className="absolute top-[44%] left-2 sm:left-4 md:left-6 lg:left-8 xl:left-10 -translate-y-1/2">
          <svg
            className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${strokeClass}`}
            viewBox="0 0 100 100"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Steam curls */}
            <path d="M 34 24 C 30 18, 36 12, 32 6" />
            <path d="M 44 22 C 40 16, 46 10, 42 4" />
            <path d="M 54 24 C 50 18, 56 12, 52 6" />

            {/* Cup Rim (Oval) */}
            <ellipse cx="44" cy="34" rx="24" ry="5.5" />

            {/* Cup Body */}
            <path d="M 20 34 C 20 60, 68 60, 68 34" />

            {/* Cup Handle */}
            <path d="M 66 38 C 78 38, 78 50, 64 52" />

            {/* Saucer / Plate */}
            <path d="M 12 58 C 24 68, 64 68, 76 58" />
            <path d="M 20 64 C 30 70, 58 70, 68 64" />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM-LEFT: Swiss Cheese Wedge & Olive Sprig                             */}
        {/* ========================================================================= */}
        <div className="absolute bottom-8 left-2 sm:bottom-12 sm:left-4 md:left-6 lg:left-8 xl:left-10">
          <div className="flex flex-col gap-1 sm:gap-2">
            {/* Swiss cheese wedge */}
            <svg
              className={`w-18 h-14 sm:w-22 sm:h-16 md:w-26 md:h-18 ${strokeClass}`}
              viewBox="0 0 110 80"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* 3D Wedge shape */}
              {/* Top inclined triangle */}
              <path d="M 16 52 L 72 18 L 96 38 L 42 70 Z" />
              {/* Left vertical facet */}
              <path d="M 16 52 L 16 26 L 72 8 L 72 18" />
              {/* Front corner edge */}
              <path d="M 16 26 L 42 42 L 42 70" />
              {/* Right side facet */}
              <path d="M 42 42 L 96 14 L 96 38" />

              {/* Swiss cheese holes */}
              <ellipse cx="28" cy="36" rx="4" ry="4.5" />
              <ellipse cx="32" cy="54" rx="5" ry="3.5" />
              <ellipse cx="64" cy="36" rx="5.5" ry="4.5" />
              <ellipse cx="78" cy="46" rx="4" ry="3.5" />
              <ellipse cx="56" cy="54" rx="4.5" ry="3" />
              <ellipse cx="80" cy="28" rx="3.5" ry="2.5" />
            </svg>

            {/* Olive branch below cheese */}
            <svg
              className={`w-16 h-10 sm:w-18 sm:h-12 md:w-22 md:h-14 -ml-1 ${strokeClass}`}
              viewBox="0 0 100 60"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Branch stem */}
              <path d="M 12 44 C 32 36, 56 36, 84 22" />
              {/* Olives */}
              <ellipse cx="32" cy="44" rx="5" ry="4" transform="rotate(-15 32 44)" />
              <ellipse cx="60" cy="36" rx="5" ry="4" transform="rotate(-10 60 36)" />
              {/* Leaves */}
              <path d="M 24 36 C 18 28, 26 20, 34 24 C 38 28, 32 36, 24 36 Z" />
              <path d="M 44 30 C 42 20, 52 14, 58 20 C 62 26, 52 32, 44 30 Z" />
              <path d="M 68 22 C 68 12, 78 10, 82 16 C 84 22, 76 26, 68 22 Z" />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TOP-RIGHT: Serving Cloche, Salad Bowl, Vine Tomatoes                      */}
        {/* ========================================================================= */}
        <div className="absolute top-12 right-2 sm:top-14 sm:right-4 md:right-6 lg:right-8 xl:right-10 flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Serving Cloche with Steam */}
          <svg
            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 ${strokeClass}`}
            viewBox="0 0 80 70"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Steam curls above dome */}
            <path d="M 36 12 C 34 8, 38 6, 36 2" />
            <path d="M 44 12 C 42 8, 46 6, 44 2" />

            {/* Cloche knob / handle */}
            <ellipse cx="40" cy="18" rx="4" ry="2.5" />

            {/* Cloche dome */}
            <path d="M 16 48 C 16 26, 64 26, 64 48" />

            {/* Tray base */}
            <line x1="10" y1="50" x2="70" y2="50" />
            <path d="M 14 50 C 18 56, 62 56, 66 50" />
          </svg>

          {/* Salad Bowl with leafy greens */}
          <svg
            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 ${strokeClass} hidden sm:block`}
            viewBox="0 0 80 70"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Salad leaves overflowing */}
            <path d="M 22 34 C 20 22, 32 20, 36 28 C 40 18, 52 18, 54 28 C 60 22, 68 26, 64 36" />
            <path d="M 28 30 C 32 24, 40 25, 42 32" strokeWidth="1.2" />
            <path d="M 46 28 C 50 23, 58 24, 60 32" strokeWidth="1.2" />

            {/* Bowl Rim & Body */}
            <path d="M 14 36 Q 40 38 66 36" />
            <path d="M 14 36 C 16 56, 64 56, 66 36" />
            <path d="M 28 55 L 52 55" />
          </svg>

          {/* Vine Tomatoes */}
          <svg
            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 ${strokeClass}`}
            viewBox="0 0 80 70"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Main Vine Stem */}
            <path d="M 28 10 C 38 8, 52 16, 62 26" />
            <path d="M 44 14 C 42 20, 38 24, 36 26" />
            <path d="M 54 20 C 56 24, 58 28, 56 32" />

            {/* Left Tomato */}
            <path d="M 36 26 L 31 22 M 36 26 L 39 21 M 36 26 L 42 27 M 36 26 L 35 31 M 36 26 L 30 28" />
            <circle cx="34" cy="38" r="13" />
            <path d="M 30 32 C 34 32, 38 34, 40 38" strokeWidth="1.2" />

            {/* Right Tomato */}
            <path d="M 56 32 L 53 27 M 56 32 L 60 28 M 56 32 L 62 33 M 56 32 L 57 37 M 56 32 L 51 35" />
            <circle cx="58" cy="44" r="11" />
            <path d="M 54 39 C 58 39, 62 41, 63 44" strokeWidth="1.2" />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT-CENTER: Flaky French Croissant                                      */}
        {/* ========================================================================= */}
        <div className="absolute top-[44%] right-2 sm:right-4 md:right-6 lg:right-8 xl:right-10 -translate-y-1/2">
          <svg
            className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${strokeClass}`}
            viewBox="0 0 90 90"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Crescent outer outline */}
            <path d="M 18 64 C 14 54, 20 40, 32 30 C 46 18, 66 18, 76 30 C 82 38, 80 50, 70 60 C 64 66, 52 70, 42 68 C 30 66, 22 70, 18 64 Z" />

            {/* Flaky inner layered segments */}
            <path d="M 32 30 C 40 36, 46 54, 42 68" />
            <path d="M 44 24 C 52 32, 56 50, 52 66" />
            <path d="M 58 22 C 64 30, 68 46, 64 62" />
            <path d="M 70 26 C 74 34, 76 46, 70 56" />

            {/* Crust tips */}
            <path d="M 18 64 C 16 68, 20 72, 24 70" />
            <path d="M 70 60 C 74 64, 76 60, 72 56" />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM-RIGHT: Pizza Slice & Fork/Knife Cutlery                            */}
        {/* ========================================================================= */}
        <div className="absolute bottom-8 right-2 sm:bottom-12 sm:right-4 md:right-6 lg:right-8 xl:right-10 flex items-center gap-3 sm:gap-4 md:gap-6">
          {/* Pizza Slice */}
          <svg
            className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${strokeClass}`}
            viewBox="0 0 90 90"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Crust */}
            <path d="M 26 22 C 44 14, 66 22, 78 36" />
            <path d="M 23 25 C 43 17, 65 25, 77 39" />

            {/* Pizza slice triangle sides */}
            <path d="M 23 25 L 20 72 C 22 74, 25 74, 28 70 L 77 39" />

            {/* Pepperoni toppings */}
            <circle cx="36" cy="40" r="5" />
            <circle cx="52" cy="36" r="4.5" />
            <circle cx="38" cy="56" r="4.5" />
            <circle cx="58" cy="48" r="4" />

            {/* Cheese melt drips */}
            <path d="M 28 36 Q 30 42 34 38" strokeWidth="1.2" />
            <path d="M 44 48 Q 46 54 50 50" strokeWidth="1.2" />
          </svg>

          {/* Cutlery (Fork and Knife) */}
          <svg
            className={`w-10 h-16 sm:w-12 sm:h-20 md:w-14 md:h-24 ${strokeClass}`}
            viewBox="0 0 60 100"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Fork (Left) */}
            <path d="M 12 12 L 12 28" />
            <path d="M 16 12 L 16 28" />
            <path d="M 20 12 L 20 28" />
            <path d="M 24 12 L 24 28" />
            <path d="M 12 28 C 12 36, 24 36, 24 28" />
            <path d="M 18 36 L 18 84 C 18 88, 16 90, 18 92 C 20 90, 18 88, 18 84" />

            {/* Knife (Right) */}
            <path d="M 38 12 L 38 42 C 38 46, 42 46, 42 42 L 46 22 C 46 14, 42 12, 38 12 Z" />
            <path d="M 40 46 L 40 90 C 40 93, 38 94, 40 94" />
          </svg>
        </div>
      </div>
    </div>
  );
}
