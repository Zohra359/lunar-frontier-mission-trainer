
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="9.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M21.5 8.6a8.2 8.2 0 1 0 0 14.8 6.6 6.6 0 0 1 0-14.8Z"
        fill="currentColor"
        opacity="0.9"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="14.5"
        ry="5.2"
        transform="rotate(-24 16 16)"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.6"
      />
    </svg>
  );
}
