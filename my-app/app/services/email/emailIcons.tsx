export function SparkleIcon({ size = 16, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, display: "flex" }}>
      <path
        fill={color}
        d="M12 2c.6 3.7 1.9 5.9 5 7-3.1 1.1-4.4 3.3-5 7-.6-3.7-1.9-5.9-5-7 3.1-1.1 4.4-3.3 5-7z"
      />
    </svg>
  );
}

export function StarBadgeIcon({ size = 15, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, display: "flex" }}>
      <path
        fill={color}
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}

export function CheckIcon({ size = 15, color = "#ffffff", strokeWidth = 2.6 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, display: "flex" }}>
      <path
        d="M4 12.5l5 5L20 6"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
