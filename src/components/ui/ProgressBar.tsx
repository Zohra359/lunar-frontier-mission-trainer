type ProgressTone = "signal" | "ember" | "danger";

const FILL: Record<ProgressTone, string> = {
  signal: "bg-signal",
  ember: "bg-ember",
  danger: "bg-red-400",
};

interface ProgressBarProps {
  label: string;
  /** 0 to 100. Values outside the range are clamped. */
  value: number;
  tone?: ProgressTone;
}

export function ProgressBar({
  label,
  value,
  tone = "signal",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[0.66rem] uppercase tracking-[0.2em]">
        <span className="text-mist">{label}</span>
        <span className="font-mono tabular-nums text-white">{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="h-1 w-full bg-white/10"
      >
        <div
          className={`h-full ${FILL[tone]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}