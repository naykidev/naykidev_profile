type AxolotlProps = {
  className?: string;
  /** Peek pose — head tilted; default is front-facing */
  peek?: boolean;
};

/** Flat axolotl mascot using the site palette (tangerine body, flag-red gills). */
export function AxolotlIllustration({ className = "", peek = false }: AxolotlProps) {
  return (
    <svg
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* External gills */}
      <g opacity="0.9">
        <ellipse cx="10" cy="14" rx="3.5" ry="6" fill="var(--flag-red)" />
        <ellipse cx="7" cy="16" rx="2.5" ry="5" fill="var(--flag-red)" opacity="0.75" />
        <ellipse cx="13" cy="12" rx="2.5" ry="4.5" fill="var(--flag-red)" opacity="0.8" />
        <ellipse cx="38" cy="14" rx="3.5" ry="6" fill="var(--flag-red)" />
        <ellipse cx="41" cy="16" rx="2.5" ry="5" fill="var(--flag-red)" opacity="0.75" />
        <ellipse cx="35" cy="12" rx="2.5" ry="4.5" fill="var(--flag-red)" opacity="0.8" />
      </g>
      {/* Body */}
      <ellipse cx="24" cy="24" rx="14" ry="10" fill="var(--vivid-tangerine)" />
      {/* Head */}
      <ellipse
        cx="24"
        cy="14"
        rx="11"
        ry="9"
        fill="var(--vivid-tangerine)"
        transform={peek ? "rotate(-8 24 14)" : undefined}
      />
      {/* Outline */}
      <ellipse
        cx="24"
        cy="14"
        rx="11"
        ry="9"
        stroke="var(--deep-space-blue)"
        strokeWidth="1.2"
        fill="none"
        transform={peek ? "rotate(-8 24 14)" : undefined}
      />
      <ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="10"
        stroke="var(--deep-space-blue)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Eyes */}
      <circle cx="20" cy="13" r="2" fill="var(--deep-space-blue)" />
      <circle cx="28" cy="13" r="2" fill="var(--deep-space-blue)" />
      <circle cx="20.6" cy="12.4" r="0.7" fill="var(--vanilla-custard)" />
      <circle cx="28.6" cy="12.4" r="0.7" fill="var(--vanilla-custard)" />
      {/* Smile */}
      <path
        d="M 20 17 Q 24 20 28 17"
        stroke="var(--deep-space-blue)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tiny legs */}
      <ellipse cx="16" cy="32" rx="3" ry="2" fill="var(--vivid-tangerine)" stroke="var(--deep-space-blue)" strokeWidth="0.8" />
      <ellipse cx="32" cy="32" rx="3" ry="2" fill="var(--vivid-tangerine)" stroke="var(--deep-space-blue)" strokeWidth="0.8" />
      <ellipse cx="22" cy="33" rx="2.5" ry="1.8" fill="var(--vivid-tangerine)" stroke="var(--deep-space-blue)" strokeWidth="0.8" />
      <ellipse cx="26" cy="33" rx="2.5" ry="1.8" fill="var(--vivid-tangerine)" stroke="var(--deep-space-blue)" strokeWidth="0.8" />
    </svg>
  );
}

/** Repeating axolotl watermark tile for card backgrounds. */
export function AxolotlWatermark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="24" cy="24" rx="14" ry="10" fill="currentColor" />
      <ellipse cx="24" cy="14" rx="11" ry="9" fill="currentColor" />
      <ellipse cx="10" cy="14" rx="3" ry="5" fill="currentColor" opacity="0.6" />
      <ellipse cx="38" cy="14" rx="3" ry="5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
