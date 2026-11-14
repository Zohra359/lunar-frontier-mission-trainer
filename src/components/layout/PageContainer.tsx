import type { ReactNode } from "react";

/** Standard content width and horizontal padding. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Wrapper for every inner page. Renders the <main> landmark (the skip link
 * targets #main), clears the fixed header, and adds a subtle star backdrop.
 */
export function PageContainer({
  children,
  className = "",
  atmosphere = true,
}: {
  children: ReactNode;
  className?: string;
  atmosphere?: boolean;
}) {
  return (
    <main
      id="main"
      className={`relative isolate min-h-[80svh] overflow-hidden bg-void pt-16 ${className}`}
    >
      {atmosphere ? (
        <>
          <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10" />
          <div
            aria-hidden="true"
            className="stars-mask absolute inset-0 -z-10 opacity-60"
          >
            <div className="stars stars-a" />
            <div className="stars stars-b" />
          </div>
        </>
      ) : null}
      {children}
    </main>
  );
}