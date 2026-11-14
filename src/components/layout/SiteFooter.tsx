import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import { NAV_ITEMS, REFERENCE_LINKS } from "@/config/navigation";
import { Container } from "./PageContainer";

const LINK_CLASS = "text-slate-300 transition-colors hover:text-signal";
const COLUMN_TITLE =
  "font-mono text-[0.62rem] uppercase tracking-[0.26em] text-mist";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-deep">
      <Container className="grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 text-signal">
            <LogoMark className="h-6 w-6" />
            <span className="text-[0.8rem] font-semibold tracking-[0.32em] text-white">
              LUNAR FRONTIER
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            An educational mission-management game about living and working on
            the Moon, created for the NASA Space Apps Challenge 2026.
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h3 className={COLUMN_TITLE}>Mission</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={LINK_CLASS}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h3 className={COLUMN_TITLE}>Reference</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {REFERENCE_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-6 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p>© 2026 Lunar Frontier. All rights reserved.</p>
          <p className="max-w-xl leading-relaxed md:text-right">
            Independent educational project. Not affiliated with, sponsored by
            or endorsed by NASA.
          </p>
        </Container>
      </div>
    </footer>
  );
}