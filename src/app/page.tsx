
"use client";

import { useSyncExternalStore } from "react";
import { BeginMissionButton } from "@/components/layout/BeginMissionButton";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusIndicator";

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

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
        <StatusBadge tone="ember">Preview</StatusBadge>
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
        <ProgressBar label="Power" value={82} />
        <ProgressBar label="Oxygen" value={94} />
        <ProgressBar label="Water" value={67} />
        <ProgressBar label="Crew morale" value={41} tone="ember" />
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

function Hero() {
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
            <BeginMissionButton size="lg" showArrow />
            <Button href="#mission" variant="secondary" size="lg">
              EXPLORE THE MISSION
            </Button>
          </div>

          <p className="fade-up delay-4 mt-5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-mist">
            Mission overview available below · Simulator in development
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

function CallToAction() {
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
        <BeginMissionButton size="lg" showArrow />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/*  Header, footer and the "not yet online" dialog now come from layout.tsx.  */
/* -------------------------------------------------------------------------- */

export default function Home() {
  return (
    <main id="main" className="bg-void text-slate-200">
      <Hero />
      <ObjectivesSection />
      <EnvironmentSection />
      <CallToAction />
    </main>
  );
}
