export function BrandLogo({ className = "w-8 h-8 mr-3 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Bottom Layer */}
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        transform="translate(0, 8)"
        fill="rgba(255, 255, 255, 0.01)"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth={1}
      />
      {/* Middle Layer */}
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        transform="translate(0, 4)"
        fill="rgba(255, 255, 255, 0.03)"
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth={1}
      />
      {/* Top Layer */}
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        fill="rgba(204, 255, 0, 0.35)"
        stroke="#CCFF00"
        strokeWidth={1.5}
        style={{ filter: "drop-shadow(0 0 8px rgba(204, 255, 0, 0.6))" }}
      />
    </svg>
  );
}
