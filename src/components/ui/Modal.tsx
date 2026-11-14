"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  /** Action buttons, rendered in a row below the content. */
  footer?: ReactNode;
}

/**
 * Accessible dialog: Escape and backdrop close it, focus is trapped while open
 * and restored afterwards, and page scrolling is locked.
 * Render it near the app root (not inside a filtered or transformed element).
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5"
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-void/80 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="glass-panel hud-corners fade-up relative my-auto w-full max-w-lg rounded-sm p-6 outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-mist transition-colors hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {eyebrow ? (
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-ember">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={titleId}
          className="mt-3 pr-8 text-2xl font-semibold tracking-wide text-white"
        >
          {title}
        </h2>

        {children ? (
          <div className="mt-3 text-sm leading-relaxed text-slate-300">
            {children}
          </div>
        ) : null}

        {footer ? (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}