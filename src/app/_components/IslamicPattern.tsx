/**
 * Subtle repeating 8-point star tile. Purely ornamental background texture:
 * aria-hidden, no pointer events, fills its positioned parent.
 */
export default function IslamicPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none select-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <pattern
          id="bodhanam-star-pattern"
          width="56"
          height="56"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M28 2 L34 14 L48 8 L42 22 L54 28 L42 34 L48 48 L34 42 L28 54 L22 42 L8 48 L14 34 L2 28 L14 22 L8 8 L22 14 Z"
            fill="none"
            stroke="var(--accent-warm)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bodhanam-star-pattern)" />
    </svg>
  );
}
