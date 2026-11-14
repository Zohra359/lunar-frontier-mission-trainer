"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Configuration                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Set this to the route of your game once it exists (e.g. "/mission").
 * While it is null, the "BEGIN YOUR MISSION" buttons open an honest
 * "simulator not yet online" notice instead of linking to a missing page.
 */
const MISSION_START_HREF = null as string | null;

const NAV_LINKS = [
  { href: "#mission", label: "Objectives" },
  { href: "#environment", label: "Environment" },
  { href: "#status", label: "Status" },
] as const;

const OBJECTIVES = [
  {
    id: "01",
    title: "Manage Resources",
    text: "Balance power, oxygen, water and food through long lunar days and the freezing two-week night.",
    tags: ["Power", "Oxygen", "Water", "Food"],
    icon: (
      <>
        <path d="M4 7h10M4 12h16M4 17h7" />
        <circle cx="18" cy="7" r="1.4" />
        <circle cx="14" cy="17" r="1.4" />
      </>
    ),
  },
  {
    id: "02",
    title: "Protect Your Crew",
    text: "Keep every astronaut healthy, rested and motivated while radiation, isolation and fatigue take their toll.",
    tags: ["Health", "Radiation", "Morale"],
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M16 14.2c2.6-.2 4.5 1.3 5 4.3" />
      </>
    ),
  },
  {
    id: "03",
    title: "Overcome Challenges",
    text: "Respond to equipment failures, abrasive lunar dust and disrupted communications with limited time and supplies.",
    tags: ["Dust", "Failures", "Lunar night"],
    icon: (
      <>
        <path d="M12 4 3 19h18L12 4Z" />
        <path d="M12 10v4M12 16.8v.2" />
      </>
    ),
  },
  {
    id: "04",
    title: "Build The Outpost",
    text: "Expand habitats and research capability to turn a short stay into a lasting human presence on the Moon.",
    tags: ["Habitats", "Science", "Expansion"],
    icon: (
      <>
        <path d="M3 19h18" />
        <path d="M5 19a7 7 0 0 1 14 0" />
        <path d="M12 12V6M10 6h4" />
      </>
    ),
  },
] as const;

const ENVIRONMENT_STATS = [
  {
    value: "1.62",
    unit: "m/s²",
    label: "Surface gravity",
    note: "About one-sixth of Earth's, so every step, tool and rover behaves differently.",
  },
  {
    value: "−173 to 127",
    unit: "°C",
    label: "Temperature extremes",
    note: "Typical equatorial range between the lunar night and midday sun.",
  },
  {
    value: "29.5",
    unit: "days",
    label: "One day-night cycle",
    note: "Roughly two Earth weeks of sunlight followed by two weeks of darkness.",
  },
  {
    value: "384,400",
    unit: "km",
    label: "Distance from Earth",
    note: "Radio signals need about 1.3 seconds to travel one way.",
  },
] as const;

const SIMULATOR_MODULES = [
  { name: "Landing page and mission briefing", status: "Online", live: true },
  { name: "Mission simulator", status: "Planned", live: false },
  { name: "Crew and resource systems", status: "Planned", live: false },
] as const;

/* -------------------------------------------------------------------------- */
/*  Small hooks                                                               */
/* -------------------------------------------------------------------------- */

function subscribeToClock(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}
const getClockSnapshot = () => new Date().toISOString().slice(11, 19);
const getClockServerSnapshot = () => "--:--:--";

/** Live UTC clock. Renders a placeholder on the server to avoid hydration mismatch. */
function useUtcClock() {
  return useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getClockServerSnapshot,
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared UI                                                                 */
/* -------------------------------------------------------------------------- */

function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="9.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M21.5 8.6a8.2 8.2 0 1 0 0 14.8 6.6 6.6 0 0 1 0-14.8Z"
        fill="currentColor"
        opacity="0.9"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="14.5"
        ry="5.2"
        transform="rotate(-24 16 16)"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.6"
      />
    </svg>
  );
}

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

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
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

function BeginButton({
  onBegin,
  label = "BEGIN YOUR MISSION",
  variant = "solid",
  showArrow = true,
}: {
  onBegin: () => void;
  label?: string;
  variant?: "solid" | "outline";
  showArrow?: boolean;
}) {
  const base =
    "group inline-flex items-center justify-center gap-3 rounded-sm font-semibold uppercase transition-colors duration-200";
  const styles =
    variant === "solid"
      ? "bg-signal px-7 py-4 text-[0.78rem] tracking-[0.24em] text-void shadow-[0_0_40px_-10px_rgba(111,211,255,0.8)] hover:bg-white"
      : "border border-signal/40 px-4 py-2 text-[0.68rem] tracking-[0.22em] text-signal hover:bg-signal hover:text-void";
  const classes = `${base} ${styles}`;
  const content = (
    <>
      {label}
      {showArrow ? <ArrowIcon /> : null}
    </>
  );

  if (MISSION_START_HREF) {
    return (
      <Link href={MISSION_START_HREF} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onBegin} className={classes}>
      {content}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */

function SiteHeader({ onBegin }: { onBegin: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-void/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3 text-signal">
          <LogoMark />
          <span className="flex flex-col leading-none">
            <span className="text-[0.82rem] font-semibold tracking-[0.32em] text-white">
              LUNAR FRONTIER
            </span>
            <span className="mt-1 hidden font-mono text-[0.55rem] uppercase tracking-[0.28em] text-mist sm:block">
              Junior Astronaut Mission Trainer
            </span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-mist transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <BeginButton
          onBegin={onBegin}
          label="Begin"
          variant="outline"
          showArrow={false}
        />
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero visuals                                                              */
/* -------------------------------------------------------------------------- */

function StarField() {
  return (
    <div aria-hidden="true" className="stars-mask absolute inset-0 z-0">
      <div className="stars stars-a" />
      <div className="stars stars-b" />
      <div className="stars stars-c" />
    </div>
  );
}

const RIDGE_FAR =
  "M0 262 C140 236 270 252 410 226 S650 210 800 232 S1060 212 1210 236 S1470 216 1600 240";
const RIDGE_MID =
  "M0 306 C210 280 400 306 620 286 S960 266 1180 292 S1480 280 1600 300";
const RIDGE_NEAR =
  "M0 352 C250 330 520 360 800 344 S1280 330 1600 352";

const CRATERS = [
  { cx: 360, cy: 382, rx: 150, ry: 12 },
  { cx: 700, cy: 392, rx: 55, ry: 5 },
  { cx: 980, cy: 377, rx: 95, ry: 8 },
  { cx: 1260, cy: 388, rx: 120, ry: 10 },
];

const BOULDERS = [
  { cx: 560, cy: 364, rx: 10, ry: 5 },
  { cx: 900, cy: 357, rx: 7, ry: 4 },
  { cx: 1120, cy: 369, rx: 12, ry: 6 },
  { cx: 760, cy: 373, rx: 6, ry: 3 },
  { cx: 300, cy: 361, rx: 8, ry: 4 },
];

function LunarScene() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[300px] sm:h-[44vh] sm:min-h-[340px]"
    >
      {/* Earth-rise with a subtle orbital ring and satellite */}
      <div className="absolute bottom-[40%] left-[70%] -translate-x-1/2">
        <div className="orbit-scene absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 md:h-[440px] md:w-[440px]">
          <div className="orbit-tilt absolute inset-0">
            <div className="orbit-ring absolute inset-0" />
            <div className="orbit-ring orbit-ring-inner absolute inset-[18%]" />
          </div>
        </div>
        <div className="earth h-20 w-20 md:h-28 md:w-28" />
      </div>

      {/* Lunar surface layers */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 400"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <defs>
          <linearGradient id="lf-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#262e3f" />
            <stop offset="1" stopColor="#0b101a" />
          </linearGradient>
          <linearGradient id="lf-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b4457" />
            <stop offset="0.55" stopColor="#151b27" />
            <stop offset="1" stopColor="#080b12" />
          </linearGradient>
          <linearGradient id="lf-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8d93a0" />
            <stop offset="0.35" stopColor="#3a404c" />
            <stop offset="1" stopColor="#0d1016" />
          </linearGradient>
          <filter id="lf-regolith" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={3}
              seed={7}
              result="noise"
            />
            <feDiffuseLighting
              in="noise"
              lightingColor="#ffffff"
              surfaceScale={1.8}
              result="lit"
            >
              <feDistantLight azimuth={225} elevation={38} />
            </feDiffuseLighting>
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
          </filter>
        </defs>

        {/* Far ridge */}
        <path d={`${RIDGE_FAR} V400 H0Z`} fill="url(#lf-far)" />
        <path
          d={RIDGE_FAR}
          stroke="rgba(170,205,255,0.28)"
          strokeWidth="1"
        />

        {/* Mid ridge */}
        <path d={`${RIDGE_MID} V400 H0Z`} fill="url(#lf-mid)" />
        <path
          d={`${RIDGE_MID} V400 H0Z`}
          fill="#ffffff"
          filter="url(#lf-regolith)"
          opacity="0.35"
          style={{ mixBlendMode: "overlay" }}
        />
        <path
          d={RIDGE_MID}
          stroke="rgba(190,220,255,0.35)"
          strokeWidth="1"
        />

        {/* Outpost silhouette */}
        <g transform="translate(838 276)">
          <ellipse cx="62" cy="1" rx="80" ry="5" fill="#080b12" />
          {/* solar arrays */}
          <line x1="-17" y1="-6" x2="-17" y2="1" stroke="rgba(190,225,255,0.4)" strokeWidth="0.8" />
          <rect x="-30" y="-20" width="26" height="14" fill="#101a30" stroke="rgba(130,200,255,0.5)" strokeWidth="0.8" />
          <line x1="109" y1="-6" x2="109" y2="1" stroke="rgba(190,225,255,0.4)" strokeWidth="0.8" />
          <rect x="96" y="-20" width="26" height="14" fill="#101a30" stroke="rgba(130,200,255,0.5)" strokeWidth="0.8" />
          {/* habitat module */}
          <rect x="0" y="-16" width="52" height="16" rx="3" fill="#0b1220" stroke="rgba(190,225,255,0.45)" strokeWidth="0.8" />
          <rect x="8" y="-11" width="6" height="4" fill="#7fe3ff" />
          <rect x="20" y="-11" width="6" height="4" fill="#7fe3ff" opacity="0.7" />
          <rect x="36" y="-11" width="6" height="4" fill="#ffb454" />
          {/* dome */}
          <path d="M52 0 V-14 A19 19 0 0 1 90 -14 V0Z" fill="#0d1628" stroke="rgba(190,225,255,0.45)" strokeWidth="0.8" />
          {/* antenna + beacon */}
          <line x1="26" y1="-16" x2="26" y2="-46" stroke="rgba(190,225,255,0.5)" strokeWidth="0.9" />
          <path d="M18 -49 Q26 -40 34 -49" stroke="rgba(190,225,255,0.55)" strokeWidth="0.9" />
          <circle className="beacon" cx="26" cy="-48" r="1.8" fill="#ffb454" />
        </g>

        {/* Near foreground */}
        <path d={`${RIDGE_NEAR} V400 H0Z`} fill="url(#lf-near)" />
        <path
          d={`${RIDGE_NEAR} V400 H0Z`}
          fill="#ffffff"
          filter="url(#lf-regolith)"
          opacity="0.5"
          style={{ mixBlendMode: "overlay" }}
        />
        <path
          d={RIDGE_NEAR}
          stroke="rgba(215,228,255,0.4)"
          strokeWidth="1.2"
        />

        {CRATERS.map((c) => (
          <g key={`${c.cx}-${c.cy}`}>
            <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="rgba(4,6,10,0.5)" />
            <path
              d={`M${c.cx - c.rx} ${c.cy} A${c.rx} ${c.ry} 0 0 1 ${c.cx + c.rx} ${c.cy}`}
              stroke="rgba(220,230,255,0.35)"
              strokeWidth="1.2"
            />
          </g>
        ))}
        {BOULDERS.map((b) => (
          <ellipse
            key={`${b.cx}-${b.cy}`}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            fill="#1c2029"
            stroke="rgba(200,215,240,0.25)"
            strokeWidth="0.8"
          />
        ))}
      </svg>

      <p className="absolute bottom-4 left-5 font-mono text-[0.58rem] uppercase tracking-[0.28em] text-white/40 sm:left-8">
        Lunar south pole · Illustrative rendering
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mission status panel                                                      */
/* -------------------------------------------------------------------------- */

function ResourceBar({
  label,
  value,
  tone = "signal",
}: {
  label: string;
  value: number;
  tone?: "signal" | "ember";
}) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[0.66rem] uppercase tracking-[0.2em]">
        <span className="text-mist">{label}</span>
        <span className="font-mono tabular-nums text-white">{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-1 w-full bg-white/10"
      >
        <div
          className={`h-full ${tone === "ember" ? "bg-ember" : "bg-signal"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MissionStatusPanel() {
  const utc = useUtcClock();
  const rows: Array<[string, string]> = [
    ["Clock (UTC)", utc],
    ["Site", "Lunar south pole"],
    ["Crew", "4 astronauts"],
    ["Earth signal", "≈ 1.3 s one way"],
  ];

  return (
    <aside
      id="status"
      aria-label="Mission status"
      className="glass-panel hud-corners fade-up delay-4 scroll-mt-24 rounded-sm p-5 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          Mission Status
        </h2>
        <span className="rounded-sm border border-ember/40 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ember">
          Preview
        </span>
      </div>

      <dl className="mt-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between border-b border-white/5 py-2.5"
          >
            <dt className="text-[0.68rem] uppercase tracking-[0.2em] text-mist">
              {label}
            </dt>
            <dd className="font-mono text-sm tabular-nums text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 space-y-4">
        <ResourceBar label="Power" value={82} />
        <ResourceBar label="Oxygen" value={94} />
        <ResourceBar label="Water" value={67} />
        <ResourceBar label="Crew morale" value={41} tone="ember" />
      </div>

      <p className="mt-5 border-t border-white/5 pt-3 font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.18em] text-mist">
        Illustrative values · Simulator not yet online
      </p>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function Hero({ onBegin }: { onBegin: () => void }) {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-void">
      <div aria-hidden="true" className="hero-glow absolute inset-0 z-0" />
      <StarField />
      <LunarScene />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-5 pb-80 pt-32 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pb-[40vh]">
        <div className="lg:col-span-7">
          <p className="fade-up mb-6 flex items-center gap-3 font-mono text-[0.66rem] uppercase tracking-[0.3em] text-signal">
            <span className="h-px w-8 shrink-0 bg-signal/60" />
            NASA Space Apps Challenge 2026 · Educational Simulation
          </p>

          <h1 className="fade-up delay-1 font-semibold uppercase leading-[0.95] tracking-[0.14em] text-white text-[clamp(2.4rem,9.5vw,6.25rem)]">
            <span className="block font-light text-regolith/90">Lunar</span>
            <span className="block">Frontier</span>
          </h1>

          <p className="fade-up delay-2 mt-6 text-lg tracking-[0.1em] text-signal sm:text-xl">
            Your Mission. Your Crew. Your Moon.
          </p>

          <p className="fade-up delay-3 mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {
              "Humanity's future on the Moon depends on the decisions we make today. Take command of a lunar outpost, manage essential resources, protect your crew and overcome the challenges of surviving beyond Earth."
            }
          </p>

          <div className="fade-up delay-4 mt-9 flex flex-col gap-4 sm:flex-row">
            <BeginButton onBegin={onBegin} />
            <a
              href="#mission"
              className="inline-flex items-center justify-center rounded-sm border border-white/25 px-7 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-white transition-colors duration-200 hover:border-signal hover:text-signal"
            >
              EXPLORE THE MISSION
            </a>
          </div>

          <p className="fade-up delay-4 mt-5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-mist">
            Mission briefing available now · Simulator in development
          </p>
        </div>

        <div className="lg:col-span-5 lg:pl-6">
          <MissionStatusPanel />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="fade-to-void pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-24"
      />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                  */
/* -------------------------------------------------------------------------- */

function ObjectivesSection() {
  return (
    <section id="mission" className="relative scroll-mt-16 bg-void py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Mission Objectives" title="Four fronts. One outpost.">
          Surviving beyond Earth means making trade-offs under pressure. Every
          decision you make ripples through your resources, your crew and the
          future of your base.
        </SectionHeading>

        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {OBJECTIVES.map((obj) => (
            <article
              key={obj.id}
              className="group relative bg-deep p-7 transition-colors duration-300 hover:bg-navy sm:p-8"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-500 group-hover:scale-x-100"
              />
              <div className="flex items-start justify-between">
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
                  {obj.icon}
                </svg>
                <span className="font-mono text-xs tracking-[0.2em] text-mist">
                  {obj.id}
                </span>
              </div>
              <h3 className="mt-8 text-lg font-semibold tracking-wide text-white">
                {obj.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {obj.text}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {obj.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-sm border border-line px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-mist"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EnvironmentSection() {
  return (
    <section
      id="environment"
      className="relative scroll-mt-16 border-t border-line bg-deep py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="The Environment"
            title="The Moon does not forgive mistakes."
          >
            Your outpost sits in one of the harshest environments humans have
            ever tried to inhabit. These real conditions shape every challenge
            you will face.
          </SectionHeading>
        </div>

        <div className="lg:col-span-7">
          <dl className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
            {ENVIRONMENT_STATS.map((stat) => (
              <div key={stat.label} className="bg-void p-6 sm:p-7">
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-mist">
                  {stat.label}
                </dt>
                <dd className="mt-3">
                  <span className="text-3xl font-light tabular-nums text-white sm:text-4xl">
                    {stat.value}
                  </span>
                  <span className="ml-2 font-mono text-sm text-signal">
                    {stat.unit}
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {stat.note}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mist">
            Reference: NASA NSSDC Moon Fact Sheet
          </p>
        </div>
      </div>
    </section>
  );
}

function CallToAction({ onBegin }: { onBegin: () => void }) {
  return (
    <section className="border-t border-line bg-void">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-[0.12em] text-white sm:text-3xl">
            COMMAND AWAITS
          </h2>
          <p className="mt-2 text-slate-400">
            Your crew is counting on the decisions you make.
          </p>
        </div>
        <BeginButton onBegin={onBegin} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-line bg-deep">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-12">
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
          <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-mist">
            Navigate
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-slate-300 transition-colors hover:text-signal"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#top"
                className="text-slate-300 transition-colors hover:text-signal"
              >
                Back to top
              </a>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-mist">
            Reference
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 transition-colors hover:text-signal"
              >
                NASA Moon Fact Sheet ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-mist sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Lunar Frontier. All rights reserved.</p>
          <p className="max-w-xl leading-relaxed md:text-right">
            Independent educational project. Not affiliated with, sponsored by
            or endorsed by NASA.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  "Not yet online" dialog                                                   */
/* -------------------------------------------------------------------------- */

function MissionNoticeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-notice-title"
        className="glass-panel hud-corners fade-up relative w-full max-w-lg rounded-sm p-6 sm:p-8"
      >
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-ember">
          Mission Control Notice
        </p>
        <h2
          id="mission-notice-title"
          className="mt-3 text-2xl font-semibold tracking-wide text-white"
        >
          The simulator is not yet online
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          This landing page is the first module of Lunar Frontier. Mission
          gameplay will unlock in a future build. Review the mission objectives
          to see what your command will involve.
        </p>

        <ul className="mt-6 divide-y divide-white/5 border-y border-white/5">
          {SIMULATOR_MODULES.map((m) => (
            <li
              key={m.name}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="text-slate-200">{m.name}</span>
              <span
                className={`font-mono text-[0.6rem] uppercase tracking-[0.2em] ${
                  m.live ? "text-signal" : "text-mist"
                }`}
              >
                {m.status}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href="#mission"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-sm bg-signal px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-void transition-colors hover:bg-white"
          >
            View objectives
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-sm border border-white/25 px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:border-signal hover:text-signal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const openNotice = useCallback(() => setNoticeOpen(true), []);
  const closeNotice = useCallback(() => setNoticeOpen(false), []);

  return (
    <div className="min-h-screen bg-void text-slate-200">
      <SiteHeader onBegin={openNotice} />
      <main>
        <Hero onBegin={openNotice} />
        <ObjectivesSection />
        <EnvironmentSection />
        <CallToAction onBegin={openNotice} />
      </main>
      <SiteFooter />
      <MissionNoticeDialog open={noticeOpen} onClose={closeNotice} />
    </div>
  );
}