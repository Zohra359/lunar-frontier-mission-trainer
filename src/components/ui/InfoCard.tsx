import type { ReactNode } from "react";

interface InfoCardProps {
  title: string;
  description: string;
  /** Small mono index in the corner, e.g. "01". */
  index?: string;
  /** SVG path elements, drawn in a 24x24 viewBox. */
  icon?: ReactNode;
  tags?: readonly string[];
  className?: string;
}

export function InfoCard({
  title,
  description,
  index,
  icon,
  tags,
  className = "",
}: InfoCardProps) {
  return (
    <article
      className={`group relative bg-deep p-7 transition-colors duration-300 hover:bg-navy sm:p-8 ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-500 group-hover:scale-x-100"
      />
      <div className="flex items-start justify-between">
        {icon ? (
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-signal"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {icon}
          </svg>
        ) : (
          <span />
        )}
        {index ? (
          <span className="font-mono text-xs tracking-[0.2em] text-mist">
            {index}
          </span>
        ) : null}
      </div>
      <h3 className="mt-8 text-lg font-semibold tracking-wide text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
      {tags && tags.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-sm border border-line px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-mist"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

const COLUMNS = {
  2: "sm:grid-cols-2",
  3: "md:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/** Hairline-bordered grid. Use a card count that fills the final row. */
export function InfoCardGrid({
  columns = 3,
  children,
  className = "",
}: {
  columns?: keyof typeof COLUMNS;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-px overflow-hidden rounded-sm border border-line bg-line ${COLUMNS[columns]} ${className}`}
    >
      {children}
    </div>
  );
}