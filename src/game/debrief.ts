
/**
 * Mission debrief generator for Lunar Frontier.
 *
 * Turns the completed mission statistics into a clear, educational
 * performance report. This is an educational game, not a real mission
 * assessment system.
 */

import {
  RESOURCE_META,
  RESOURCE_ORDER,
} from "./config";

import type {
  MissionDebrief,
  MissionState,
  DebriefSection,
} from "./types";

import {
  computeScore,
  computeRating,
} from "./engine";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function section(
  title: string,
  summary: string,
  points: string[],
): DebriefSection {
  return {
    title,
    summary,
    points,
  };
}

function formatNumber(value: number, decimals = 1): string {
  return Number.isFinite(value) ? value.toFixed(decimals) : "0";
}

function getResourceStatus(
  current: number,
  maximum: number,
): string {
  const percentage = maximum > 0 ? (current / maximum) * 100 : 0;

  if (percentage >= 70) return "well maintained";
  if (percentage >= 40) return "moderately maintained";
  if (percentage > 0) return "running low";
  return "depleted";
}

/* -------------------------------------------------------------------------- */
/*  Performance                                                               */
/* -------------------------------------------------------------------------- */

function buildPerformanceSection(
  state: MissionState,
  score: number,
): DebriefSection {
  const completedDays = Math.min(
    state.stats.history.length,
    state.day,
  );

  const summary =
    state.phase === "victory"
      ? `The crew completed the mission with a final performance score of ${score}/100.`
      : `The mission ended on Day ${state.day}, with a final performance score of ${score}/100.`;

  const points = [
    `Mission days recorded: ${completedDays}.`,
    `Research points collected: ${formatNumber(state.research)}.`,
    `Final crew health: ${formatNumber(state.resources.crewHealth)}%.`,
    `Total radiation dose recorded: ${formatNumber(state.totalDoseMsv)} mSv.`,
  ];

  if (state.outcome) {
    points.push(state.outcome.summary);
  }

  return section("Mission Performance", summary, points);
}

/* -------------------------------------------------------------------------- */
/*  Resource management                                                       */
/* -------------------------------------------------------------------------- */

function buildResourceSection(
  state: MissionState,
): DebriefSection {
  const points = RESOURCE_ORDER.map((resourceId) => {
    const current = state.resources[resourceId];
    const maximum = RESOURCE_META[resourceId].max;
    const status = getResourceStatus(current, maximum);

    return `${RESOURCE_META[resourceId].label}: ${formatNumber(current)} (${status}).`;
  });

  points.push(
    `Greenhouse harvests completed: ${state.stats.harvests}.`,
  );

  return section(
    "Resource Management",
    "A successful outpost must balance limited supplies, energy use, maintenance, and long-term sustainability.",
    points,
  );
}

/* -------------------------------------------------------------------------- */
/*  Crew safety                                                               */
/* -------------------------------------------------------------------------- */

function buildCrewSafetySection(
  state: MissionState,
): DebriefSection {
  const points: string[] = [];

  points.push(
    `Final crew health: ${formatNumber(state.resources.crewHealth)}%.`,
  );

  points.push(
    `Total recorded radiation dose: ${formatNumber(state.totalDoseMsv)} mSv.`,
  );

  points.push(
    `Days spent in shelter mode: ${state.stats.shelterDays}.`,
  );

  points.push(
    `Spacewalk days: ${state.stats.evaDays}.`,
  );

  if (state.resources.crewHealth <= 0) {
    points.push(
      "Crew health reached zero. The mission could not continue safely.",
    );
  } else if (state.resources.crewHealth < 40) {
    points.push(
      "Crew health became critically low. Earlier conservation and recovery decisions could have helped.",
    );
  } else {
    points.push(
      "The crew maintained positive health through the recorded mission.",
    );
  }

  points.push(
    "Habitat shielding and shelter procedures can reduce radiation exposure, but spacesuits provide limited protection against space radiation.",
  );

  return section(
    "Crew Safety",
    "Crew safety depends on life support, habitat protection, radiation management, and careful decisions about outdoor work.",
    points,
  );
}

/* -------------------------------------------------------------------------- */
/*  Major decisions                                                           */
/* -------------------------------------------------------------------------- */

function buildDecisionSection(
  state: MissionState,
): DebriefSection {
  const entries = Object.entries(state.stats.decisionCounts);

  const points = entries.length > 0
    ? entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([choice, count]) => {
          const readableChoice = choice.replace(/:/g, " → ");
          return `${readableChoice}: selected ${count} time(s).`;
        })
    : ["No decision history was recorded."];

  return section(
    "Major Decisions",
    "The choices made throughout the mission influenced resource use, crew safety, research, and the condition of the outpost.",
    points,
  );
}

/* -------------------------------------------------------------------------- */
/*  Lessons                                                                   */
/* -------------------------------------------------------------------------- */

function buildLessons(state: MissionState): string[] {
  const lessons = new Set<string>();

  lessons.add(
    "Life-support resources are interconnected. A shortage in one system can place additional pressure on the entire outpost.",
  );

  lessons.add(
    "Solar power generation changes with the lunar day-night cycle. Energy storage and careful power management are essential.",
  );

  lessons.add(
    "Radiation protection requires layered strategies, including shielding, shelter, and limiting exposure during hazardous conditions.",
  );

  lessons.add(
    "Maintenance and resource conservation involve trade-offs. A decision that helps one system may increase pressure on another.",
  );

  if (state.stats.harvests > 0) {
    lessons.add(
      "A greenhouse can supplement food production and contribute oxygen, but it also consumes water and power.",
    );
  }

  if (state.stats.evaDays > 0) {
    lessons.add(
      "Outdoor work can support repairs and exploration, but spacewalks introduce additional operational and radiation risks.",
    );
  }

  if (state.stats.samplesFound > 0) {
    lessons.add(
      "Exploration can produce valuable scientific discoveries, but it must be balanced against crew safety and available resources.",
    );
  }

  return [...lessons];
}

/* -------------------------------------------------------------------------- */
/*  Public debrief function                                                   */
/* -------------------------------------------------------------------------- */

export function createMissionDebrief(
  state: MissionState,
): MissionDebrief {
  const score = computeScore(state);
  const rating = computeRating(score);

  return {
    score,
    rating,
    performance: buildPerformanceSection(state, score),
    resourceManagement: buildResourceSection(state),
    crewSafety: buildCrewSafetySection(state),
    majorDecisions: buildDecisionSection(state),
    lessons: buildLessons(state),
  };
}
