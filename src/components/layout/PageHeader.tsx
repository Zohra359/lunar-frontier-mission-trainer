import type { ReactNode } from "react";
import { Container } from "./PageContainer";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Typically a <StatusIndicator />. */
  status?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  status,
  actions,
}: PageHeaderProps) {
  return (
    <header className="border-b border-line/60 pb-12 pt-16 sm:pt-20">
      <Container>
        <p className="fade-up mb-5 flex items-center gap-3 font-mono text-[0.66rem] uppercase tracking-[0.3em] text-signal">
          <span className="h-px w-8 shrink-0 bg-signal/60" />
          {eyebrow}
        </p>
        <h1 className="fade-up delay-1 text-[clamp(2rem,6vw,3.75rem)] font-semibold uppercase leading-[1.02] tracking-[0.12em] text-white">
          {title}
        </h1>
        {description ? (
          <p className="fade-up delay-2 mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {description}
          </p>
        ) : null}
        {status || actions ? (
          <div className="fade-up delay-3 mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            {status}
            {actions}
          </div>
        ) : null}
      </Container>
    </header>
  );
}