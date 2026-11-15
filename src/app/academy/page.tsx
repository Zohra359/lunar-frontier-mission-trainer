
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Astronaut Academy",
  description:
    "Learn the science behind lunar survival, resources and mission operations.",
};

const lessons = [
  {
    number: "01",
    title: "Life Support Systems",
    topic: "OXYGEN · WATER · CREW HEALTH",
    description:
      "Astronauts depend on life-support systems to maintain breathable air, manage water and support safe living conditions. A failure in one system can affect the entire crew.",
    takeaway:
      "Monitor essential supplies and respond early to shortages.",
  },
  {
    number: "02",
    title: "Power and Energy",
    topic: "ELECTRICITY · STORAGE · OPERATIONS",
    description:
      "Lunar outposts need electrical power for life support, communications, scientific instruments and habitat operations. Energy availability and storage influence which systems can operate.",
    takeaway:
      "Prioritise essential systems when power is limited.",
  },
  {
    number: "03",
    title: "Radiation Protection",
    topic: "SPACE WEATHER · EXPOSURE · SHIELDING",
    description:
      "The Moon lacks the global magnetic field and thick atmosphere that help protect Earth's surface. Solar particle events and galactic cosmic rays create radiation hazards for astronauts.",
    takeaway:
      "Radiation protection and appropriate shelter are important parts of mission planning.",
  },
  {
    number: "04",
    title: "Lunar Dust and Terrain",
    topic: "REGOLITH · EQUIPMENT · EVA",
    description:
      "Lunar regolith is fine, abrasive material that can cling to surfaces and interfere with equipment, seals and spacesuits. Surface activities require careful planning.",
    takeaway:
      "Limit unnecessary surface operations and protect sensitive equipment.",
  },
  {
    number: "05",
    title: "Thermal Control",
    topic: "TEMPERATURE · INSULATION · HEATING",
    description:
      "The lunar surface experiences extreme temperature conditions because the Moon has almost no atmosphere to distribute heat. Habitats and equipment require thermal management.",
    takeaway:
      "Energy planning must account for heating and temperature control.",
  },
  {
    number: "06",
    title: "Mission Resource Management",
    topic: "SUPPLIES · TRADE-OFFS · PLANNING",
    description:
      "Every resource has limits. Using more supplies today may leave fewer reserves for future emergencies. Mission commanders must balance immediate needs with long-term survival.",
    takeaway:
      "Think ahead: every decision has consequences for later mission days.",
  },
];

export default function AcademyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Lunar Frontier / Crew Training
        </p>

        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
          Astronaut Academy
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Before taking command of a lunar outpost, understand the science
          behind the challenges your crew will face. These lessons introduce
          the principles that guide resource management and mission decisions.
        </p>

        <section className="mt-12 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Training Objective
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            Think like a mission commander.
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Understand how the lunar environment affects human survival,
            recognise resource constraints and make decisions that balance
            crew safety with mission objectives.
          </p>
        </section>

        <section className="mt-16">
          <div>
            <h2 className="text-2xl font-bold">Core Training Modules</h2>
            <p className="mt-3 text-slate-400">
              Six essential areas of knowledge for lunar operations.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {lessons.map((lesson) => (
              <article
                key={lesson.number}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <p className="text-sm font-bold text-cyan-400">
                  MODULE {lesson.number}
                </p>

                <h3 className="mt-3 text-xl font-semibold">
                  {lesson.title}
                </h3>

                <p className="mt-2 text-xs font-semibold tracking-wider text-slate-500">
                  {lesson.topic}
                </p>

                <p className="mt-5 leading-7 text-slate-300">
                  {lesson.description}
                </p>

                <div className="mt-6 rounded-lg border border-slate-700 bg-slate-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Commander&apos;s takeaway
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {lesson.takeaway}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">Science in the Simulation</h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            The simulator uses simplified educational assumptions to turn
            lunar survival challenges into resource-management decisions.
            Actual lunar engineering involves much more complex physical,
            biological and environmental models.
          </p>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            For example, lunar radiation measurements depend on the
            instrument, its location, shielding and environmental conditions.
            A measurement inside a lander should not be interpreted as a
            universal radiation rate or a direct measurement of astronaut
            exposure.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Training material is educational and does not replace real
            astronaut procedures or engineering specifications.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold">Ready for Mission Control?</h2>
          <p className="mt-3 text-slate-400">
            Apply your knowledge. Your crew is counting on your decisions.
          </p>

          <Link
            href="/mission-control"
            className="mt-6 inline-flex rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Enter Mission Control →
          </Link>
        </section>
      </div>
    </main>
  );
}
