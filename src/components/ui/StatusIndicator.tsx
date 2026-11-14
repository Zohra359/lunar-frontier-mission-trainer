import type { ReactNode } from "react";

export type StatusTone = "signal" | "ember" | "muted" | "danger";

const DOT: Record<StatusTone, string> = {
  signal: "bg-signal",
  ember: "bg-ember",
  muted: "bg-mist",
  danger: "bg-red-400",
};

const PING: Record<StatusTone, string> = {
  signal: "bg-signal/60",
  ember: "bg-ember/60",
  muted: "bg-mist/60",
  danger: "bg-red-400/60",
};

const TEXT: Record<StatusTone, string> = {
  signal: "text-signal",
  ember: "text-ember",
  muted: "text-mist",
  danger: "text-red-300",
};

const BADGE: Record<StatusTone, string> = {
  signal: "border-signal/40 text-signal",
  ember: "border-ember/40 text-ember",
  muted: "border-line text-mist",
  danger: "border-red-400/40 text-red-300",
};

/** Dot + label, optionally pulsing. For live or system state. */
export function StatusIndicator({
  label,
  tone = "signal",
  pulse = false,
  className = "",
}: {
  label: string;
  tone?: StatusTone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-mono text-[0.68rem] uppercase tracking-[0.24em] ${TEXT[tone]} ${className}`}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {pulse ? (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${PING[tone]}`}
          />
        ) : null}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${DOT[tone]}`}
        />
      </span>
      {label}
    </span>
  );
}

/** Small bordered label, e.g. "Preview" or "Planned". */
export function StatusBadge({
  children,
  tone = "signal",
}: {
  children: ReactNode;
  tone?: StatusTone;
}) {
  return (
    <span
      className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] ${BADGE[tone]}`}
    >
      {children}
    </span>
  );
}