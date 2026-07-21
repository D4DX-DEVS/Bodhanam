interface BotanicalDecorationProps {
  className?: string;
  flip?: boolean;
  colorVar?: string;
}

/**
 * Decorative leaf branch. Purely ornamental: aria-hidden, no pointer events,
 * caller controls position/size/opacity via className.
 */
export default function BotanicalDecoration({
  className = "",
  flip = false,
  colorVar = "--leaf",
}: BotanicalDecorationProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 220 260"
      className={`pointer-events-none select-none ${className}`}
      style={{ color: `var(${colorVar})`, ...(flip ? { transform: "scaleX(-1)" } : {}) }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
        <path d="M10 250 C 40 200, 30 140, 70 100 C 100 70, 120 40, 110 10" />
        <path d="M70 100 C 50 90, 30 95, 15 80" />
        <path d="M90 70 C 108 62, 122 65, 135 55" />
        <path d="M60 150 C 40 148, 25 158, 12 150" />
      </g>
      <g fill="currentColor" opacity="0.55">
        <ellipse cx="18" cy="82" rx="14" ry="7" transform="rotate(-35 18 82)" />
        <ellipse cx="12" cy="152" rx="15" ry="7" transform="rotate(10 12 152)" />
        <ellipse cx="132" cy="56" rx="13" ry="6.5" transform="rotate(-20 132 56)" />
        <ellipse cx="108" cy="12" rx="12" ry="6" transform="rotate(-55 108 12)" />
        <ellipse cx="85" cy="105" rx="13" ry="6.5" transform="rotate(30 85 105)" />
        <ellipse cx="50" cy="175" rx="14" ry="7" transform="rotate(60 50 175)" />
      </g>
    </svg>
  );
}
