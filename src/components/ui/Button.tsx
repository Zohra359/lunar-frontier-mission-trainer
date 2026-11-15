
import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  showArrow?: boolean;
  fullWidth?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const BASE =
  "group inline-flex items-center justify-center gap-3 rounded-sm font-semibold uppercase transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-signal text-void shadow-[0_0_40px_-10px_rgba(111,211,255,0.8)] hover:bg-white",
  secondary:
    "border border-white/25 text-white hover:border-signal hover:text-signal",
  outline:
    "border border-signal/40 text-signal hover:bg-signal hover:text-void",
  ghost: "text-mist hover:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[0.68rem] tracking-[0.22em]",
  md: "px-5 py-3 text-[0.72rem] tracking-[0.22em]",
  lg: "px-7 py-4 text-[0.78rem] tracking-[0.24em]",
};

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  showArrow = false,
  fullWidth = false,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}: ButtonProps) {
  const classes = [
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {children}
      {showArrow ? <ArrowIcon /> : null}
    </>
  );

  if (href) {
    if (/^https?:\/\//i.test(href))  {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          {content}
        </a>
      );
    }

    if (href.startsWith("#")) {
      return (
        <a
          href={href}
          className={classes}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
