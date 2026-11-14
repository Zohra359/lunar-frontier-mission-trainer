const SPINNER_SIZES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-9 w-9",
} as const;

export function Spinner({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SPINNER_SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-[1.5px] border-signal/20 border-t-signal ${SPINNER_SIZES[size]} ${className}`}
    />
  );
}

/** Placeholder block for content that is still loading. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sm bg-white/5 ${className}`}
    />
  );
}

/** Full-page loading state, used by the route-level loading.tsx. */
export function LoadingScreen({
  label = "Establishing link",
}: {
  label?: string;
}) {
  return (
    <main
      id="main"
      role="status"
      aria-live="polite"
      className="flex min-h-[80svh] flex-col items-center justify-center gap-5 bg-void pt-16"
    >
      <Spinner size="lg" />
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-mist">
        {label}…
      </p>
    </main>
  );
}