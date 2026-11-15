
/**
 * Lunar Frontier: plain-language text helpers for the interface.
 *
 * Pure functions and constants only: no React, no browser APIs, no
 * Date.now(), no Math.random(). Nothing here changes the simulation; it only
 * turns game data into short sentences for the player.
 *
 * The FACTS objects below keep established science and game simplifications
 * clearly separated, and are reused by the debrief so the wording stays
 * consistent everywhere.
 */

import { EVENTS, RESOURCE_META, SIM } from "./config";
import { isLunarNight, resourceStatus } from "./engine";
import type {
  DecisionEffects,
  EventId,
  EventKind,
  LifeSupportId,
  Outlook,
  ResourceId,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Shared science statements                                                 */
/* -------------------------------------------------------------------------- */

const NIGHT_LENGTH_DAYS =
  SIM.lunarNight.lastDay - SIM.lunarNight.firstDay + 1;

/** Radiation: established science first, then what the game simplifies. */
export const RADIATION_FACTS = {
  chronicVsSporadic:
    "Galactic cosmic rays are a persistent background radiation source that reaches the Moon. Solar particle events are sporadic bursts from the Sun that can raise radiation levels sharply for hours or days. In the game, alerts come with a same-day warning; real space-weather forecasting is much less certain.",

  shielding: `How well shielding works depends on the material, its thickness and the type of particle. Very thick layers help less and less, because energetic particles can create secondary particles. Shielding reduces radiation but never removes all of it; the game caps the reduction at ${Math.round(
    SIM.maxShieldReduction * 100,
  )}% and uses one simplified percentage for everything.`,

  baseline: `The game's baseline of ${SIM.chronicDose} mSv per day is a simplified setting informed by measurements from the Chang'e-4 Lunar Lander Neutron and Dosimetry (LND) instrument. That detector was inside the lander and was shielded by the instrument and lander structure. This was one instrument measurement at one location under particular solar conditions, not a universal lunar radiation rate or a direct measurement of human exposure.`,

  careerLimit: `NASA's ${SIM.careerDoseLimitMsv} mSv figure is a cumulative career effective-dose limit for astronauts. It is not a daily safe-exposure threshold, and the game's simplified totals should not be compared against it directly.`,
} as const;

/** The lunar day, the lunar night and lunar water ice. */
export const LUNAR_DAY_FACTS = {
  rotation:
    "The Moon rotates once in about 27.3 days (its sidereal rotation period). Because it also orbits Earth, the Sun takes about 29.5 days to return to the same place in the lunar sky (the solar day). Day and night follow this approximately 29.5-day cycle.",

  night: `The game compresses the lunar night into ${NIGHT_LENGTH_DAYS} days (days ${SIM.lunarNight.firstDay} to ${SIM.lunarNight.lastDay}). This is a gameplay simplification: at most places on the Moon, the real night lasts roughly two weeks.`,

  waterIce:
    "Water ice has been detected in permanently shadowed regions near the lunar poles. How much there is, where it can be reached and whether it can be extracted practically are still uncertain. Finding it is a lucky event in this game.",
} as const;

/* -------------------------------------------------------------------------- */
/*  Small formatting helpers                                                  */
/* -------------------------------------------------------------------------- */

const LIFE_SUPPORT: readonly LifeSupportId[] = [
  "oxygen",
  "water",
  "food",
  "power",
];

export function pluralize(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function signed(value: number, digits = 1): string {
  const factor = 10 ** digits;
  const rounded = Math.round(value * factor) / factor;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "\u2212" : "";
  return `${sign}${Math.abs(rounded)}`;
}

function percentChange(multiplier: number): string {
  const percent = Math.round((multiplier - 1) * 100);
  const sign = percent > 0 ? "+" : percent < 0 ? "\u2212" : "";
  return `${sign}${Math.abs(percent)}%`;
}

/** A resource level with its unit, for example "84%" or "372 L". */
export function formatResourceValue(
  id: ResourceId,
  value: number,
): string {
  const meta = RESOURCE_META[id];
  const text = value.toFixed(meta.decimals);
  return meta.unit === "%" ? `${text}%` : `${text} ${meta.unit}`;
}

/** A short status word for a resource level. */
export function describeResourceStatus(
  id: ResourceId,
  value: number,
): string {
  switch (resourceStatus(id, value)) {
    case "critical":
      return "Critical";
    case "low":
      return "Getting low";
    default:
      return "Stable";
  }
}

/* -------------------------------------------------------------------------- */
/*  Decision options                                                          */
/* -------------------------------------------------------------------------- */

/** Turns an option's numeric effects into short, readable lines. */
export function describeEffects(
  effects: DecisionEffects,
): string[] {
  const lines: string[] = [];

  const multiplier = (
    value: number | undefined,
    label: string,
  ) => {
    if (value !== undefined && value !== 1) {
      lines.push(`${label} ${percentChange(value)}`);
    }
  };

  const amount = (
    value: number | undefined,
    label: string,
    unit: string,
  ) => {
    if (value !== undefined && value !== 0) {
      lines.push(`${label} ${signed(value)}${unit}`);
    }
  };

  multiplier(effects.powerLoadMultiplier, "Power use");
  amount(effects.extraPowerLoad, "Power use", "% battery per day");
  multiplier(effects.oxygenUseMultiplier, "Oxygen use");
  multiplier(effects.waterUseMultiplier, "Water use");
  multiplier(effects.foodUseMultiplier, "Food use");

  amount(effects.extraOxygenUse, "Oxygen use", "% of reserve");
  amount(effects.extraWaterUse, "Water use", " L");

  amount(effects.oxygen, "Oxygen", "%");
  amount(effects.water, "Water", " L");
  amount(effects.food, "Food", " days");
  amount(effects.power, "Power", "%");

  amount(effects.habitat, "Habitat integrity", "%");
  amount(effects.habitatRepair, "Repairs", "% habitat integrity");
  amount(effects.habitatWear, "Habitat wear", "%");

  if (effects.cleanPanels !== undefined && effects.cleanPanels !== 0) {
    lines.push(
      `Solar panel cleaning ${signed(effects.cleanPanels * 100, 0)}% output`,
    );
  }

  amount(effects.shieldingBuild, "Radiation protection", "%");
  amount(effects.crewHealth, "Crew health", "%");
  amount(effects.research, "Research", " points");

  multiplier(effects.researchMultiplier, "Research");
  multiplier(effects.doseMultiplier, "Radiation dose");
  amount(effects.extraDose, "Extra radiation dose", " mSv");
  multiplier(effects.greenhouseMultiplier, "Greenhouse output");

  if (effects.greenhouse) {
    const g = effects.greenhouse;
    lines.push(
      `Greenhouse: +${g.growthPerDay}% growth, ${g.waterPerDay} L water and ${g.powerPerDay}% battery per day`,
    );
  }

  if (
    effects.emergencyCaches !== undefined &&
    effects.emergencyCaches < 0
  ) {
    lines.push(
      `Uses ${pluralize(Math.abs(effects.emergencyCaches), "emergency cache")}`,
    );
  }

  if (effects.isEva) {
    lines.push(
      "Spacewalk: the spacesuit provides limited protection against space radiation",
    );
  }

  if (effects.expeditionSample) {
    lines.push(
      "May find a water-ice sample (a lucky find in the game)",
    );
  }

  return lines;
}

/* -------------------------------------------------------------------------- */
/*  Events                                                                    */
/* -------------------------------------------------------------------------- */

const EVENT_KIND_LABEL: Record<EventKind, string> = {
  radiation: "Radiation",
  equipment: "Equipment",
  structural: "Structure",
  biological: "Greenhouse",
  environment: "Environment",
  discovery: "Good news",
};

export interface EventDescription {
  id: EventId;
  title: string;
  kindLabel: string;
  forecast: string;
  isHazard: boolean;
}

export function describeEvent(id: EventId): EventDescription {
  const event = EVENTS[id];

  return {
    id,
    title: event.title,
    kindLabel: EVENT_KIND_LABEL[event.kind],
    forecast: event.forecast,
    isHazard: event.tone === "hazard",
  };
}

/* -------------------------------------------------------------------------- */
/*  Daylight, radiation and outlook                                           */
/* -------------------------------------------------------------------------- */

export interface DaylightStatus {
  label: string;
  detail: string;
}

/** Whether the outpost is in sunlight, with the gameplay compression noted. */
export function describeDaylight(day: number): DaylightStatus {
  const { firstDay, lastDay } = SIM.lunarNight;

  if (isLunarNight(day)) {
    const left = lastDay - day + 1;

    return {
      label: "Lunar night (game)",
      detail: `Solar panels make almost no power. ${pluralize(left, "day")} of darkness left. The game shortens the lunar night to ${NIGHT_LENGTH_DAYS} days; real nights last roughly two weeks at most lunar locations.`,
    };
  }

  if (day < firstDay) {
    const until = firstDay - day;

    return {
      label: "Daylight",
      detail: `The outpost is receiving sunlight and its solar panels are working. The lunar night begins in ${pluralize(until, "day")}.`,
    };
  }

  return {
    label: "Daylight",
    detail:
      "The outpost is receiving sunlight and its solar panels are generating power.",
  };
}

/** One sentence about today's simulated radiation dose. */
export function describeDose(
  doseMsv: number,
  shieldingPercent: number,
): string {
  const dose = Math.round(doseMsv * 10) / 10;

  return `About ${dose} simulated mSv today with ${Math.round(shieldingPercent)}% radiation protection. These are simplified game values, not a medical measurement.`;
}

/** Plain-language lines describing what the current plan leads to. */
export function describeOutlook(
  outlook: Outlook,
  currentDay: number,
): string[] {
  const lines: string[] = [];

  for (const id of LIFE_SUPPORT) {
    const emptyDay = outlook[id];

    if (emptyDay !== null) {
      const daysAway = emptyDay - currentDay + 1;

      lines.push(
        `${RESOURCE_META[id].label} would run out on day ${emptyDay} (${
          daysAway === 1
            ? "today"
            : `in ${pluralize(daysAway, "day")}`
        }).`,
      );
    }
  }

  if (outlook.crewLost !== null) {
    lines.push(
      `The crew would be lost on day ${outlook.crewLost} if the projected crew-health or life-support failure occurs.`,
    );
  }

  if (lines.length === 0) {
    lines.push(
      "No life-support shortages are projected with this plan. Future events are not included in the projection.",
    );
  }

  return lines;
}
