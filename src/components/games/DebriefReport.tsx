
"use client";

import Link from "next/link";
import { useMissionGame } from "@/hooks/useMissionGame";

export function DebriefReport() {
  const { missionState, debrief } = useMissionGame();

  const completed =
    missionState.phase === "victory" ||
    missionState.phase === "failure";

  if (!completed || !debrief) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Lunar Frontier / Mission Report
          </p>
          <h1 className="mt-4 text-3xl font-bold">
            Debrief Unavailable
          </h1>
          <p className="mt-4 leading-7 text-slate-300">
            Your mission report will be generated once the mission reaches
            a victory or failure outcome. Continue your mission to review
            your performance.
          </p>
          <Link
            href="/mission-control"
            className="mt-7 inline-flex rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-400"
          >
            Return to Mission Control →
          </Link>
        </div>
      </main>
    );
  }

  const sections = [
    debrief.performance,
    debrief.resourceManagement,
    debrief.crewSafety,
    debrief.majorDecisions,
  ];

  const outcome = missionState.outcome;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Lunar Frontier / Mission Operations
        </p>

        <h1 className="mt-5 text-4xl font-bold sm:text-6xl">
          Mission Debrief
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          Every mission provides valuable information. Review your
          performance, understand your decisions and identify lessons
          for future lunar operations.
        </p>

        <section className="mt-12 rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
            Final Mission Outcome
          </p>

          <h2 className="mt-4 text-3xl font-bold">
            {outcome?.headline ??
              (missionState.phase === "victory"
                ? "Mission Completed"
                : "Mission Ended")}
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            {outcome?.summary ??
              "Your mission has reached its conclusion."}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-400">Final Score</p>
              <p className="mt-2 text-4xl font-bold text-cyan-400">
                {debrief.score}
                <span className="text-lg text-slate-500">/100</span>
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Performance Rating</p>
              <p className="mt-2 text-xl font-bold capitalize">
                {debrief.rating ?? "Unrated"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Mission Day</p>
              <p className="mt-2 text-2xl font-bold">
                {missionState.day}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold">Performance Review</h2>
          <p className="mt-3 text-slate-400">
            A breakdown of your mission's most important results.
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <h3 className="text-xl font-semibold text-cyan-300">
                  {section.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  {section.summary}
                </p>

                <ul className="mt-5 space-y-3">
                  {section.points.map((point, index) => (
                    <li
                      key={`${section.title}-${index}`}
                      className="flex gap-3 text-sm leading-6 text-slate-400"
                    >
                      <span className="text-cyan-400">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">Lessons Learned</h2>
          <p className="mt-3 text-slate-400">
            Scientific and operational principles demonstrated during
            your mission.
          </p>

          <ul className="mt-7 space-y-4">
            {debrief.lessons.map((lesson, index) => (
              <li
                key={index}
                className="flex gap-4 leading-7 text-slate-300"
              >
                <span className="font-bold text-cyan-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-8">
          <h2 className="text-2xl font-bold">
            Ready for Another Mission?
          </h2>
          <p className="mt-4 leading-7 text-slate-300">
            Apply what you learned, reconsider your strategy and
            take command of a new mission.
          </p>

          <Link
            href="/mission-control"
            className="mt-7 inline-flex rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Return to Mission Control →
          </Link>
        </section>

        <p className="mt-10 text-sm text-slate-500">
          This is an educational simulation. Performance scores and
          mission outcomes are based on simplified game assumptions,
          not real lunar mission assessment standards.
        </p>
      </div>
    </main>
  );
}
