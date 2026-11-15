
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mission Briefing",
  description:
    "Learn about the lunar environment, mission objectives and challenges before taking command.",
};

const objectives = [
  {
    number: "01",
    title: "Maintain crew survival",
    description:
      "Protect crew health by managing oxygen, water, food and environmental conditions throughout the mission.",
  },
  {
    number: "02",
    title: "Manage the outpost",
    description:
      "Balance power generation, resource consumption and available supplies to keep essential systems operating.",
  },
  {
    number: "03",
    title: "Respond to emergencies",
    description:
      "Evaluate mission alerts, identify risks and make decisions that protect both the crew and the outpost.",
  },
];

const hazards = [
  {
    title: "Extreme temperatures",
    description:
      "The Moon has no substantial atmosphere to moderate surface temperatures. Equipment and habitats must manage demanding thermal conditions.",
  },
  {
    title: "Radiation exposure",
    description:
      "Without Earth's protective atmosphere and magnetic field, the lunar surface exposes crews to greater radiation hazards.",
  },
  {
    title: "Lunar dust",
    description:
      "Fine, abrasive lunar dust can interfere with equipment, seals and spacesuits. It must be carefully managed.",
  },
  {
    title: "Limited resources",
    description:
      "Water, oxygen, food and electrical power are finite resources. Poor planning can threaten mission survival.",
  },
];

export default function BriefingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Lunar Frontier / Mission Operations
        </p>

        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
          Mission Briefing
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Humanity's future beyond Earth depends on our ability to establish
          sustainable lunar outposts. You have been assigned command of a
          lunar mission. Your decisions will determine whether the crew and
          their habitat can survive the challenges ahead.
        </p>

        <section className="mt-14 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Mission Directive
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            Keep the outpost operational for 30 mission days.
          </h2>
          <p className="mt-4 leading-7 text-slate-300">
            Manage critical resources, protect crew health and respond to
            changing conditions. Mission success depends on maintaining
            essential systems and keeping the crew safe until the mission
            reaches its planned conclusion.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold">Mission Objectives</h2>
          <p className="mt-3 text-slate-400">
            Your priorities as mission commander:
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {objectives.map((item) => (
              <article
                key={item.number}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <p className="text-sm font-bold text-cyan-400">
                  OBJECTIVE {item.number}
                </p>
                <h3 className="mt-4 text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-400">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold">Understanding the Lunar Environment</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            The lunar environment presents challenges very different from
            those on Earth. Understanding these hazards is essential to
            making responsible mission decisions.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {hazards.map((hazard) => (
              <article
                key={hazard.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <h3 className="text-lg font-semibold text-cyan-300">
                  {hazard.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-400">
                  {hazard.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">Your Responsibility</h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Every decision involves trade-offs. Conserving power may limit
            operations. Using emergency supplies may protect the crew today
            but leave fewer reserves for tomorrow. Consider both immediate
            needs and long-term consequences before committing to a decision.
          </p>

          <Link
            href="/mission-control"
            className="mt-8 inline-flex rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Proceed to Mission Control →
          </Link>
        </section>

        <p className="mt-10 text-sm text-slate-500">
          Educational simulation. Mission conditions and resource values
          are simplified assumptions, not a real lunar engineering model.
        </p>
      </div>
    </main>
  );
}
