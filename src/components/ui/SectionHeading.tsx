import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <p className="mb-4 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-signal">
        <span className="h-px w-8 bg-signal/60" />
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {title}
      </h2>
      {children ? (
        <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
          {children}
        </p>
      ) : null}
    </div>
  );
}