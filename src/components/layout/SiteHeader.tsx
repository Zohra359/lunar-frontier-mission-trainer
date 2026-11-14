"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/LogoMark";
import { StatusBadge } from "@/components/ui/StatusIndicator";
import { NAV_ITEMS, STATUS_META, isActivePath } from "@/config/navigation";
import { BeginMissionButton } from "./BeginMissionButton";
import { Container } from "./PageContainer";

export function SiteHeader() {
  const pathname = usePathname();

  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuOpen = openPath === pathname;
  const closeMenu = () => setOpenPath(null);
  const toggleMenu = () => setOpenPath(menuOpen ? null : pathname);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPath(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-void/60 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-3 text-signal"
        >
          <LogoMark />
          <span className="flex flex-col leading-none">
            <span className="text-[0.82rem] font-semibold tracking-[0.32em] text-white">
              LUNAR FRONTIER
            </span>
            <span className="mt-1 hidden font-mono text-[0.55rem] uppercase tracking-[0.28em] text-mist sm:block xl:hidden 2xl:block">
              Junior Astronaut Mission Trainer
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 xl:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-colors ${
                  active ? "text-white" : "text-mist hover:text-white"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-0.5 h-px bg-signal transition-opacity duration-300 ${
                    active
                      ? "opacity-100 shadow-[0_0_8px_rgba(111,211,255,0.8)]"
                      : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <BeginMissionButton label="Begin" variant="outline" size="sm" />
          </div>
          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/15 text-white transition-colors hover:border-signal hover:text-signal xl:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {menuOpen ? (
        <>
          <div
            aria-hidden="true"
            onClick={closeMenu}
            className="absolute inset-x-0 top-full h-screen bg-void/70 xl:hidden"
          />
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="absolute inset-x-0 top-full max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-line bg-deep xl:hidden"
          >
            <Container>
              <ul className="divide-y divide-white/5">
                {NAV_ITEMS.map((item, i) => {
                  const active = isActivePath(pathname, item.href);
                  const meta = STATUS_META[item.status];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        aria-current={active ? "page" : undefined}
                        className="group flex items-start gap-5 py-4"
                      >
                        <span className="pt-1 font-mono text-[0.62rem] tracking-[0.2em] text-mist">
                          {String(i).padStart(2, "0")}
                        </span>
                        <span className="flex-1">
                          <span
                            className={`block text-sm font-semibold uppercase tracking-[0.2em] transition-colors ${
                              active
                                ? "text-signal"
                                : "text-white group-hover:text-signal"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                            {item.summary}
                          </span>
                        </span>
                        {item.status !== "online" ? (
                          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="pb-6 pt-4 sm:hidden">
                <BeginMissionButton fullWidth showArrow onBegin={closeMenu} />
              </div>
            </Container>
          </nav>
        </>
      ) : null}
    </header>
  );
}