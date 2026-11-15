
"use client";

import { useMissionGame } from "@/hooks/useMissionGame";
import { DECISION_CATEGORIES } from "@/game/config";
import { getOptionAvailability } from "@/game/engine";
import { ResourcePanel } from "@/components/games/ResourcePanel";

export function MissionControlDashboard() {
  const {
    missionState,
    decisions,
    alerts,
    outlook,
    setDecision,
    beginMission,
    advanceMissionDay,
    resetMission,
  } = useMissionGame();

  const isBriefing = missionState.phase === "briefing";
  const isPlaying = missionState.phase === "playing";

  const isFinished =
    missionState.phase === "victory" ||
    missionState.phase === "failure";

  const outlookItems = [
    { label: "Oxygen", day: outlook.oxygen },
    { label: "Water", day: outlook.water },
    { label: "Food", day: outlook.food },
    { label: "Power", day: outlook.power },
    { label: "Crew health", day: outlook.crewLost },
  ];

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8"
    >
      {/* HEADER */}
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
          Step 03 · Mission Control
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Mission Control
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Command your lunar outpost. Monitor essential systems,
              protect your crew and make decisions as the mission unfolds.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Mission day
            </p>

            <p className="mt-1 text-2xl font-bold tabular-nums text-white">
              {missionState.day}
              <span className="text-sm font-normal text-slate-500">
                {" "}/ 30
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* MISSION STATUS */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mission status
            </p>

            <h2 className="mt-1 text-lg font-bold capitalize text-white">
              {missionState.phase}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {isBriefing &&
                "Your outpost is ready. Begin the mission when your crew is prepared."}

              {isPlaying &&
                "Your crew is operating on the lunar surface. Monitor resources and resolve each mission day."}

              {missionState.phase === "victory" &&
                "All mission days have been completed."}

              {missionState.phase === "failure" &&
                "The mission has ended. Review the outcome and learn from your decisions."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isBriefing && (
              <button
                type="button"
                onClick={beginMission}
                className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Begin mission
              </button>
            )}

            {isPlaying && (
              <button
                type="button"
                onClick={advanceMissionDay}
                className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Resolve day {missionState.day}
              </button>
            )}

            {isFinished && (
              <button
                type="button"
                onClick={() => resetMission()}
                className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Start a new mission
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MISSION OUTCOME */}
      {missionState.outcome && (
        <section
          className="mb-6 rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"
          aria-live="polite"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Mission outcome
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            {missionState.outcome.headline}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {missionState.outcome.summary}
          </p>
        </section>
      )}

      {/* MAIN DASHBOARD */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="min-w-0 space-y-6 lg:col-span-2">

          {/* DAILY DECISIONS */}
          <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Mission planning
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Daily crew decisions
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Choose how your crew will operate today. Each decision
                affects your resources, research and crew welfare.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {DECISION_CATEGORIES.map((category) => {
                const selectedOption = category.options.find(
                  (option) =>
                    option.id === decisions[category.id],
                );

                const unavailableOptions = category.options
                  .map((option) => ({
                    option,
                    availability: getOptionAvailability(
                      missionState,
                      category.id,
                      option.id,
                    ),
                  }))
                  .filter(
                    (item) => !item.availability.available,
                  );

                return (
                  <article
                    key={category.id}
                    className="rounded-xl border border-white/10 bg-slate-900/80 p-4"
                  >
                    <h3 className="font-semibold text-white">
                      {category.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {category.question}
                    </p>

                    <select
                      value={decisions[category.id]}
                      disabled={!isPlaying}
                      onChange={(event) =>
                        setDecision(
                          category.id,
                          event.target.value,
                        )
                      }
                      className="mt-4 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {category.options.map((option) => {
                        const availability = getOptionAvailability(
                          missionState,
                          category.id,
                          option.id,
                        );

                        return (
                          <option
                            key={option.id}
                            value={option.id}
                            disabled={!availability.available}
                          >
                            {option.label}
                            {!availability.available
                              ? " — Unavailable"
                              : ""}
                          </option>
                        );
                      })}
                    </select>

                    {selectedOption && (
                      <p className="mt-3 text-xs leading-5 text-slate-400">
                        {selectedOption.tagline}
                      </p>
                    )}

                    {unavailableOptions.length > 0 &&
                      isPlaying && (
                        <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                          {unavailableOptions.map(
                            ({ option, availability }) => (
                              <p
                                key={option.id}
                                className="text-xs leading-5 text-amber-300/80"
                              >
                                <span className="font-semibold">
                                  {option.label}:
                                </span>{" "}
                                {availability.reason}
                              </p>
                            ),
                          )}
                        </div>
                      )}

                    {!isPlaying && (
                      <p className="mt-3 text-xs text-slate-500">
                        {isBriefing
                          ? "Begin the mission to make daily decisions."
                          : "Decisions are locked because the mission has ended."}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            {isPlaying && (
              <p className="mt-5 rounded-lg border border-cyan-400/10 bg-cyan-400/5 p-3 text-xs leading-5 text-cyan-200/80">
                Your choices will be applied when you resolve the
                current mission day. You can change them before
                proceeding.
              </p>
            )}
          </section>

          {/* RESOURCE PANEL */}
          <ResourcePanel resources={missionState.resources} />

        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-6">

          {/* ALERTS */}
          <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
            <h2 className="text-lg font-bold text-white">
              Mission alerts
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Warnings generated from your current mission state.
            </p>

            {alerts.length === 0 ? (
              <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm text-slate-400">
                No active alerts. All monitored systems are stable.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {alerts.map((alert) => (
                  <article
                    key={alert.id}
                    className={`rounded-lg border p-3 ${
                      alert.severity === "critical"
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-amber-400/30 bg-amber-400/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          alert.severity === "critical"
                            ? "bg-red-400"
                            : "bg-amber-400"
                        }`}
                      />

                      <h3 className="text-sm font-semibold text-white">
                        {alert.title}
                      </h3>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-300">
                      {alert.message}
                    </p>

                    {alert.advice && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Advice: {alert.advice}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* RESOURCE OUTLOOK */}
          <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
            <h2 className="text-lg font-bold text-white">
              Resource outlook
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Estimated day each resource could run out if default
              decisions continue. These are simplified projections,
              not predictions of future events.
            </p>

            <div className="mt-4 space-y-3">
              {outlookItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 last:border-0"
                >
                  <span className="text-sm text-slate-300">
                    {item.label}
                  </span>

                  <span className="text-sm font-semibold tabular-nums text-white">
                    {item.day === null
                      ? "No projected shortage"
                      : `Day ${item.day}`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* EDUCATIONAL DISCLAIMER */}
      <p className="mt-8 text-center text-xs leading-5 text-slate-600">
        Lunar Frontier is an educational simulation. Its resource
        values and projections use simplified game assumptions
        and are not real lunar engineering predictions.
      </p>
    </main>
  );
}
