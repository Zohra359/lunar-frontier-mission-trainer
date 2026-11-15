
export const SITE_NAME = "LUNAR FRONTIER";

/**
 * Route of the playable simulator. While null, every "BEGIN YOUR MISSION"
 * button opens the honest "simulator not yet online" notice instead of
 * linking to an unfinished page.
 */
export const MISSION_START_HREF = "/mission-control";

export type ModuleStatus = "online" | "planned";

export interface NavItem {
  href: string;
  label: string;
  summary: string;
  status: ModuleStatus;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/",
    label: "Home",
    summary: "Return to the Lunar Frontier launch page.",
    status: "online",
  },
  {
    href: "/briefing",
    label: "Mission Briefing",
    summary: "Understand the mission and the environment before launch.",
    status: "planned",
  },
  {
    href: "/academy",
    label: "Astronaut Academy",
    summary: "Build the knowledge your crew will need on the surface.",
    status: "planned",
  },
  {
    href: "/mission-control",
    label: "Mission Control",
    summary: "Command the outpost: resources, crew and decisions.",
    status: "planned",
  },
  {
    href: "/debrief",
    label: "Mission Debrief",
    summary: "Review your decisions, outcomes and lessons learned.",
    status: "planned",
  },
];

export const STATUS_META: Record<
  ModuleStatus,
  { label: string; tone: "signal" | "muted" }
> = {
  online: { label: "Online", tone: "signal" },
  planned: { label: "Planned", tone: "muted" },
};

export const REFERENCE_LINKS = [
  {
    href: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html",
    label: "NASA Moon Fact Sheet",
  },
] as const;

/** Home matches only "/"; other items also match their nested routes. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
