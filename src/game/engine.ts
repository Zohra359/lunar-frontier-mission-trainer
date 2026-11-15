
/**
 * Lunar Frontier: deterministic mission simulation engine.
 *
 * This file contains pure game logic. It has no React, browser APIs,
 * network access, timers, Math.random(), or Date.now().
 *
 * All simulation values are simplified educational game assumptions.
 * This is not a real lunar engineering or life-support model.
 */

import {
  BRIEFING_POINTS,
  CREW_SIZE,
  DECISION_CATEGORIES,
  DECISION_ORDER,
  DEFAULT_DECISIONS,
  DEFAULT_SEED,
  EVENTS,
  EVENT_ORDER,
  MISSION_LENGTH_DAYS,
  RESOURCE_META,
  RESOURCE_ORDER,
  SIM,
} from "./config";

import { rollUnit } from "./rng";

import type {
  Alert,
  DailyDecisions,
  DayReport,
  DecisionCategory,
  DecisionCategoryId,
  DecisionOption,
  DebriefSection,
  EventId,
  EventRecord,
  FailureCause,
  HealthBreakdown,
  HealthSource,
  LessonText,
  LifeSupportId,
  LogEntry,
  MissionDebrief,
  MissionEventDefinition,
  MissionOutcome,
  MissionRating,
  MissionState,
  OptionAvailability,
  Outlook,
  ReportNote,
  ResourceId,
  Resources,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  General helpers                                                           */
/* -------------------------------------------------------------------------- */

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function makeId(day: number, suffix: string): string {
  return `day-${day}-${suffix}`;
}

function cloneResources(resources: Resources): Resources {
  return { ...resources };
}

function clampResources(resources: Resources): Resources {
  return {
    oxygen: clamp(resources.oxygen, 0, RESOURCE_META.oxygen.max),
    water: clamp(resources.water, 0, RESOURCE_META.water.max),
    food: clamp(resources.food, 0, RESOURCE_META.food.max),
    power: clamp(resources.power, 0, RESOURCE_META.power.max),
    habitat: clamp(resources.habitat, 0, RESOURCE_META.habitat.max),
    crewHealth: clamp(
      resources.crewHealth,
      0,
      RESOURCE_META.crewHealth.max,
    ),
    shielding: clamp(
      resources.shielding,
      0,
      RESOURCE_META.shielding.max,
    ),
  };
}

function addLog(
  log: LogEntry[],
  day: number,
  tone: LogEntry["tone"],
  text: string,
): LogEntry[] {
  return [
    ...log,
    {
      id: makeId(day, `log-${log.length}`),
      day,
      tone,
      text,
    },
  ].slice(-100);
}

function addNote(
  notes: ReportNote[],
  day: number,
  kind: ReportNote["kind"],
  tone: ReportNote["tone"],
  title: string,
  what: string,
  lesson?: LessonText,
  includeLesson = false,
): void {
  notes.push({
    id: makeId(day, `note-${notes.length}`),
    kind,
    tone,
    title,
    what,
    ...(includeLesson && lesson
      ? { why: lesson.why, principle: lesson.principle }
      : {}),
  });
}

function lessonIsNew(
  state: MissionState,
  topic: string,
): boolean {
  return !state.lessonsSeen.includes(topic);
}

function rememberLesson(
  lessonsSeen: string[],
  topic: string,
): string[] {
  return lessonsSeen.includes(topic)
    ? lessonsSeen
    : [...lessonsSeen, topic];
}

/* -------------------------------------------------------------------------- */
/*  Mission timing and science helpers                                        */
/* -------------------------------------------------------------------------- */

export function isLunarNight(day: number): boolean {
  return (
    day >= SIM.lunarNight.firstDay &&
    day <= SIM.lunarNight.lastDay
  );
}

export function crewEfficiency(crewHealth: number): number {
  const tier = SIM.efficiencyTiers.find(
    (item) => crewHealth >= item.minHealth,
  );

  return tier?.value ?? 0.5;
}

export function resourceStatus(
  resourceId: ResourceId,
  value: number,
): "critical" | "low" | "healthy" {
  const metadata = RESOURCE_META[resourceId];

  if (value <= metadata.critical) {
    return "critical";
  }

  if (value <= metadata.low) {
    return "low";
  }

  return "healthy";
}

export function healthSourceLabel(source: HealthSource): string {
  const labels: Record<HealthSource, string> = {
    recovery: "Daily recovery",
    workload: "Workload",
    radiation: "Radiation exposure",
    oxygen: "Oxygen shortage",
    water: "Water shortage",
    food: "Food shortage",
    power: "Power shortage",
    events: "Mission events",
  };

  return labels[source];
}

export function getEventDefinition(
  eventId: EventId,
): MissionEventDefinition {
  return EVENTS[eventId];
}

export function getDecisionCategory(
  categoryId: DecisionCategoryId,
): DecisionCategory {
  const category = DECISION_CATEGORIES.find(
    (item) => item.id === categoryId,
  );

  if (!category) {
    throw new Error(`Unknown decision category: ${categoryId}`);
  }

  return category;
}

export function getDecisionOption(
  categoryId: DecisionCategoryId,
  optionId: string,
): DecisionOption | undefined {
  return getDecisionCategory(categoryId).options.find(
    (option) => option.id === optionId,
  );
}

/* -------------------------------------------------------------------------- */
/*  Deterministic event selection                                             */
/* -------------------------------------------------------------------------- */

export function eventForDay(
  seed: number,
  day: number,
): EventId | null {
  if (day < 1 || day > MISSION_LENGTH_DAYS) {
    return null;
  }

  const eligibleEvents = EVENT_ORDER
    .map((id) => EVENTS[id])
    .filter((event) => {
      if (day < event.minDay) {
        return false;
      }

      if (event.sunlitOnly && isLunarNight(day)) {
        return false;
      }

      return true;
    });

  if (eligibleEvents.length === 0) {
    return null;
  }

  const chance = rollUnit(seed, day, "event-chance");

  if (chance >= SIM.eventChance) {
    return null;
  }

  const totalWeight = eligibleEvents.reduce(
    (total, event) => total + event.weight,
    0,
  );

  let selection = rollUnit(seed, day, "event-selection") * totalWeight;

  for (const event of eligibleEvents) {
    selection -= event.weight;

    if (selection < 0) {
      return event.id;
    }
  }

  return eligibleEvents[eligibleEvents.length - 1]?.id ?? null;
}

/* -------------------------------------------------------------------------- */
/*  Decision handling                                                         */
/* -------------------------------------------------------------------------- */

export function normalizeDecisions(
  decisions?: Partial<DailyDecisions> | null,
): DailyDecisions {
  const normalized = { ...DEFAULT_DECISIONS };

  for (const categoryId of DECISION_ORDER) {
    const category = getDecisionCategory(categoryId);
    const requested = decisions?.[categoryId];

    const valid = category.options.some(
      (option) => option.id === requested,
    );

    if (valid && requested) {
      Object.assign(normalized, {
        [categoryId]: requested,
      });
    } else {
      Object.assign(normalized, {
        [categoryId]: category.defaultOption,
      });
    }
  }

  return normalized;
}

export function withDecision<K extends DecisionCategoryId>(
  decisions: DailyDecisions,
  categoryId: K,
  optionId: DailyDecisions[K],
): DailyDecisions {
  return normalizeDecisions({
    ...decisions,
    [categoryId]: optionId,
  });
}

export function getOptionAvailability(
  state: MissionState,
  categoryId: DecisionCategoryId,
  optionId: string,
): OptionAvailability {
  const option = getDecisionOption(categoryId, optionId);

  if (!option) {
    return {
      available: false,
      reason: "This option does not exist.",
    };
  }

  if (state.phase !== "playing") {
    return {
      available: false,
      reason: "The mission is not currently accepting decisions.",
    };
  }

  for (const requirement of option.requirements ?? []) {
    switch (requirement.kind) {
      case "minCrewHealth":
        if (state.resources.crewHealth < requirement.value) {
          return {
            available: false,
            reason: requirement.reason,
          };
        }
        break;

      case "minWater":
        if (state.resources.water < requirement.value) {
          return {
            available: false,
            reason: requirement.reason,
          };
        }
        break;

      case "minEmergencyCaches":
        if (state.emergencyCaches < requirement.value) {
          return {
            available: false,
            reason: requirement.reason,
          };
        }
        break;
    }
  }

  if (
    option.effects.isEva &&
    state.todaysEvent &&
    EVENTS[state.todaysEvent].blocksEva
  ) {
    return {
      available: false,
      reason: "A radiation or space-weather alert has suspended spacewalks today.",
    };
  }

  if (option.effects.isEva && state.resources.power <= 0) {
    return {
      available: false,
      reason: "There is not enough power to support a safe spacewalk.",
    };
  }

  return { available: true };
}

/* -------------------------------------------------------------------------- */
/*  Initial mission state                                                     */
/* -------------------------------------------------------------------------- */

function createEmptyStats(): MissionState["stats"] {
  return {
    history: [],
    events: [],
    decisionCounts: {},
    shortageDays: {
      oxygen: 0,
      water: 0,
      food: 0,
      power: 0,
    },
    harvests: 0,
    evaDays: 0,
    shelterDays: 0,
    samplesFound: 0,
  };
}

export function createInitialState(
  seed = DEFAULT_SEED,
): MissionState {
  const safeSeed = Number.isFinite(seed)
    ? Math.trunc(seed) >>> 0
    : DEFAULT_SEED;

  return {
    phase: "briefing",
    seed: safeSeed,
    day: 1,
    resources: { ...SIM.start },
    emergencyCaches: SIM.startingCaches,
    solarEfficiency: 1,
    greenhouseGrowth: 0,
    research: 0,
    totalDoseMsv: 0,
    todaysEvent: eventForDay(safeSeed, 1),
    log: [
      {
        id: "mission-created",
        day: 1,
        tone: "info",
        text: "Mission systems initialized. Review the briefing before beginning.",
      },
    ],
    lastReport: null,
    lessonsSeen: [],
    stats: createEmptyStats(),
    outcome: null,
  };
}

export function startMission(state: MissionState): MissionState {
  if (state.phase !== "briefing") {
    return state;
  }

  return {
    ...state,
    phase: "playing",
    log: addLog(
      state.log,
      1,
      "good",
      "Mission started. Your crew is ready for the first day.",
    ),
  };
}

/* -------------------------------------------------------------------------- */
/*  Decision effects                                                          */
/* -------------------------------------------------------------------------- */

function combineDecisionEffects(
  decisions: DailyDecisions,
): {
  powerLoadMultiplier: number;
  oxygenUseMultiplier: number;
  waterUseMultiplier: number;
  foodUseMultiplier: number;
  greenhouseMultiplier: number;
  researchMultiplier: number;
  doseMultiplier: number;
  extraPowerLoad: number;
  extraOxygenUse: number;
  extraWaterUse: number;
  oxygen: number;
  water: number;
  food: number;
  power: number;
  habitat: number;
  habitatRepair: number;
  habitatWear: number;
  cleanPanels: number;
  shieldingBuild: number;
  crewHealth: number;
  research: number;
  extraDose: number;
  emergencyCaches: number;
  isEva: boolean;
  expeditionSample: boolean;
  greenhouse: DecisionOption["effects"]["greenhouse"];
} {
  const combined = {
    powerLoadMultiplier: 1,
    oxygenUseMultiplier: 1,
    waterUseMultiplier: 1,
    foodUseMultiplier: 1,
    greenhouseMultiplier: 1,
    researchMultiplier: 1,
    doseMultiplier: 1,
    extraPowerLoad: 0,
    extraOxygenUse: 0,
    extraWaterUse: 0,
    oxygen: 0,
    water: 0,
    food: 0,
    power: 0,
    habitat: 0,
    habitatRepair: 0,
    habitatWear: 0,
    cleanPanels: 0,
    shieldingBuild: 0,
    crewHealth: 0,
    research: 0,
    extraDose: 0,
    emergencyCaches: 0,
    isEva: false,
    expeditionSample: false,
    greenhouse: undefined as DecisionOption["effects"]["greenhouse"],
  };

  for (const categoryId of DECISION_ORDER) {
    const optionId = decisions[categoryId];
    const option = getDecisionOption(categoryId, optionId);

    if (!option) {
      continue;
    }

    const effects = option.effects;

    combined.powerLoadMultiplier *= effects.powerLoadMultiplier ?? 1;
    combined.oxygenUseMultiplier *= effects.oxygenUseMultiplier ?? 1;
    combined.waterUseMultiplier *= effects.waterUseMultiplier ?? 1;
    combined.foodUseMultiplier *= effects.foodUseMultiplier ?? 1;
    combined.greenhouseMultiplier *= effects.greenhouseMultiplier ?? 1;
    combined.researchMultiplier *= effects.researchMultiplier ?? 1;
    combined.doseMultiplier *= effects.doseMultiplier ?? 1;

    combined.extraPowerLoad += effects.extraPowerLoad ?? 0;
    combined.extraOxygenUse += effects.extraOxygenUse ?? 0;
    combined.extraWaterUse += effects.extraWaterUse ?? 0;

    combined.oxygen += effects.oxygen ?? 0;
    combined.water += effects.water ?? 0;
    combined.food += effects.food ?? 0;
    combined.power += effects.power ?? 0;

    combined.habitat += effects.habitat ?? 0;
    combined.habitatRepair += effects.habitatRepair ?? 0;
    combined.habitatWear += effects.habitatWear ?? 0;
    combined.cleanPanels += effects.cleanPanels ?? 0;
    combined.shieldingBuild += effects.shieldingBuild ?? 0;
    combined.crewHealth += effects.crewHealth ?? 0;
    combined.research += effects.research ?? 0;
    combined.extraDose += effects.extraDose ?? 0;
    combined.emergencyCaches += effects.emergencyCaches ?? 0;

    combined.isEva ||= effects.isEva ?? false;
    combined.expeditionSample ||= effects.expeditionSample ?? false;

    if (effects.greenhouse) {
      combined.greenhouse = effects.greenhouse;
    }
  }

  return combined;
}

/* -------------------------------------------------------------------------- */
/*  Event mitigation and radiation                                            */
/* -------------------------------------------------------------------------- */

function eventIsMitigated(
  event: MissionEventDefinition,
  decisions: DailyDecisions,
): boolean {
  if (event.kind === "radiation") {
    return decisions.focus === "shelter";
  }

  if (
    event.kind === "equipment" ||
    event.kind === "structural" ||
    event.kind === "biological"
  ) {
    return decisions.fieldwork === "repair";
  }

  return false;
}

function calculateRadiationProtection(
  resources: Resources,
): number {
  const habitatFactor =
    SIM.habitatShieldWeight +
    (1 - SIM.habitatShieldWeight) * (resources.habitat / 100);

  const protection =
    (resources.shielding / 100) *
    SIM.maxShieldReduction *
    habitatFactor;

  return clamp(protection, 0, SIM.maxShieldReduction);
}

/* -------------------------------------------------------------------------- */
/*  Mission failure and victory                                               */
/* -------------------------------------------------------------------------- */

function determineFailure(
  resources: Resources,
): FailureCause | null {
  if (
    resources.crewHealth <= 0 ||
    resources.oxygen <= 0 ||
    resources.water <= 0 ||
    resources.food <= 0 ||
    resources.power <= 0
  ) {
    return "crew-lost";
  }

  if (resources.habitat <= 0) {
    return "habitat-lost";
  }

  return null;
}

function createFailureOutcome(
  day: number,
  cause: FailureCause,
): MissionOutcome {
  if (cause === "habitat-lost") {
    return {
      result: "failure",
      day,
      cause,
      headline: "Habitat integrity lost",
      summary:
        "The habitat could no longer protect the crew from the lunar environment. The mission had to be abandoned.",
    };
  }

  return {
    result: "failure",
    day,
    cause,
    headline: "Crew safety compromised",
    summary:
      "Life-support resources or crew health reached a critical failure point. The mission could not safely continue.",
  };
}

/* -------------------------------------------------------------------------- */
/*  Daily mission resolution                                                  */
/* -------------------------------------------------------------------------- */

export function advanceDay(
  originalState: MissionState,
  requestedDecisions: Partial<DailyDecisions> = {},
): MissionState {
  if (originalState.phase !== "playing") {
    return originalState;
  }

  if (originalState.day > MISSION_LENGTH_DAYS) {
    return originalState;
  }

  const day = originalState.day;
  const decisions = normalizeDecisions(requestedDecisions);

  const resourcesBefore = cloneResources(originalState.resources);
  let resources = cloneResources(originalState.resources);

  let emergencyCaches = originalState.emergencyCaches;
  let solarEfficiency = originalState.solarEfficiency;
  let greenhouseGrowth = originalState.greenhouseGrowth;
  let research = originalState.research;
  let totalDoseMsv = originalState.totalDoseMsv;

  let stats = {
    ...originalState.stats,
    history: [...originalState.stats.history],
    events: [...originalState.stats.events],
    decisionCounts: { ...originalState.stats.decisionCounts },
    shortageDays: { ...originalState.stats.shortageDays },
  };

  let lessonsSeen = [...originalState.lessonsSeen];
  let log = [...originalState.log];
  const notes: ReportNote[] = [];
  const healthBreakdown: HealthBreakdown = {};

  const addHealth = (source: HealthSource, amount: number) => {
    healthBreakdown[source] =
      (healthBreakdown[source] ?? 0) + amount;
  };

  /* Validate options against the state at the start of the day. */
  for (const categoryId of DECISION_ORDER) {
    const optionId = decisions[categoryId];
    const availability = getOptionAvailability(
      originalState,
      categoryId,
      optionId,
    );

    if (!availability.available) {
      const fallback = getDecisionCategory(categoryId).defaultOption;

      Object.assign(decisions, {
        [categoryId]: fallback,
      });
    }
  }

  const finalEffects = combineDecisionEffects(decisions);

  /* Record decision counts. */
  for (const categoryId of DECISION_ORDER) {
    const key = `${categoryId}:${decisions[categoryId]}`;
    stats.decisionCounts[key] =
      (stats.decisionCounts[key] ?? 0) + 1;
  }

  /* Explain the selected decisions. */
  for (const categoryId of DECISION_ORDER) {
    const option = getDecisionOption(
      categoryId,
      decisions[categoryId],
    );

    if (!option) {
      continue;
    }

    const topic = `decision-${categoryId}-${option.id}`;
    const firstTime = lessonIsNew(
      originalState,
      topic,
    );

    addNote(
      notes,
      day,
      "decision",
      "info",
      option.label,
      option.tagline,
      option.lesson,
      firstTime,
    );

    if (firstTime) {
      lessonsSeen = rememberLesson(lessonsSeen, topic);
    }
  }

  /* Emergency cache release. */
  if (finalEffects.emergencyCaches < 0) {
    emergencyCaches = Math.max(
      0,
      emergencyCaches + finalEffects.emergencyCaches,
    );
  }

  /* One-off supply changes. */
  resources.oxygen += finalEffects.oxygen;
  resources.water += finalEffects.water;
  resources.food += finalEffects.food;
  resources.power += finalEffects.power;

  /* Life-support consumption. */
  const oxygenUse =
    SIM.oxygenUse * finalEffects.oxygenUseMultiplier +
    finalEffects.extraOxygenUse;

  const waterUse =
    SIM.waterUse * finalEffects.waterUseMultiplier +
    finalEffects.extraWaterUse;

  const foodUse =
    SIM.foodUse * finalEffects.foodUseMultiplier;

  resources.oxygen -= oxygenUse;
  resources.water -= waterUse;
  resources.food -= foodUse;

  /* Greenhouse operations. */
  const greenhouse = finalEffects.greenhouse;

  if (greenhouse) {
    const canOperate =
      resources.power >= SIM.greenhouseMinPower &&
      resources.water >= SIM.greenhouseMinWater;

    if (canOperate) {
      const growth =
        greenhouse.growthPerDay *
        finalEffects.greenhouseMultiplier;

      greenhouseGrowth = clamp(
        greenhouseGrowth + growth,
        0,
        100,
      );

      resources.water -= greenhouse.waterPerDay;
      resources.power -= greenhouse.powerPerDay;

      resources.oxygen += greenhouse.oxygenPerDay;

      if (greenhouseGrowth >= SIM.harvestAt) {
        resources.food += SIM.harvestYield;
        greenhouseGrowth = 0;
        stats.harvests += 1;

        addNote(
          notes,
          day,
          "system",
          "good",
          "Greenhouse harvest",
          `The greenhouse produced ${SIM.harvestYield} days of food.`,
        );

        log = addLog(
          log,
          day,
          "good",
          "Greenhouse harvest completed. Food reserves increased.",
        );
      }
    } else {
      greenhouseGrowth = Math.max(
        0,
        greenhouseGrowth - SIM.wiltPerDay,
      );

      addNote(
        notes,
        day,
        "system",
        "warning",
        "Greenhouse paused",
        "There was not enough power or water to run the greenhouse. Crop growth slowed.",
      );
    }
  } else {
    greenhouseGrowth = Math.max(
      0,
      greenhouseGrowth - SIM.wiltPerDay,
    );
  }

  /* Power generation and use. */
  const night = isLunarNight(day);
  const generation = night
    ? SIM.nightGeneration
    : SIM.solarGeneration * solarEfficiency;

  const powerLoad =
    SIM.baseLoad * finalEffects.powerLoadMultiplier +
    finalEffects.extraPowerLoad;

  resources.power += generation - powerLoad;

  /* Fieldwork and habitat maintenance. */
  const efficiency = crewEfficiency(resources.crewHealth);

  resources.habitat +=
    finalEffects.habitat +
    finalEffects.habitatRepair * efficiency -
    SIM.habitatWear -
    finalEffects.habitatWear;

  /* Panel cleaning. */
  solarEfficiency = clamp(
    solarEfficiency + finalEffects.cleanPanels,
    0.5,
    1,
  );

  /* Shielding construction. */
  if (finalEffects.shieldingBuild > 0) {
    const diminishingFactor = Math.max(
      SIM.diminishingFloor,
      1 - resources.shielding / SIM.diminishingDivisor,
    );

    resources.shielding +=
      finalEffects.shieldingBuild *
      efficiency *
      diminishingFactor;
  }

  /* Natural shielding wear. */
  resources.shielding -= SIM.shieldingDecay;

  /* Resolve today's event. */
  const eventId = originalState.todaysEvent;
  let eventMitigated = false;
  let eventDose = 0;
  let eventCrewHealth = 0;

  if (eventId) {
    const event = EVENTS[eventId];
    eventMitigated = eventIsMitigated(event, decisions);

    const eventFactor =
      eventMitigated &&
      (
        event.kind === "equipment" ||
        event.kind === "structural" ||
        event.kind === "biological"
      )
        ? SIM.repairResponseFactor
        : 1;

    const applyEventChange = (
      resource: ResourceId,
      amount: number | undefined,
    ) => {
      if (amount === undefined) {
        return;
      }

      const adjusted =
        resource === "crewHealth"
          ? amount
          : amount * eventFactor;

      if (resource === "crewHealth") {
        eventCrewHealth += adjusted;
      } else {
        resources[resource] += adjusted;
      }
    };

    applyEventChange("oxygen", event.effects.oxygen);
    applyEventChange("water", event.effects.water);
    applyEventChange("food", event.effects.food);
    applyEventChange("power", event.effects.power);
    applyEventChange("habitat", event.effects.habitat);
    applyEventChange("shielding", event.effects.shielding);

    if (event.effects.solarEfficiency !== undefined) {
      solarEfficiency +=
        event.effects.solarEfficiency * eventFactor;
    }

    if (event.effects.greenhouseGrowth !== undefined) {
      greenhouseGrowth +=
        event.effects.greenhouseGrowth * eventFactor;
    }

    if (event.effects.research !== undefined) {
      research += event.effects.research;
    }

    eventDose = event.effects.dose ?? 0;

    stats.events.push({
      day,
      eventId,
      mitigated: eventMitigated,
    });

    const topic = `event-${eventId}`;
    const firstTime = lessonIsNew(
      originalState,
      topic,
    );

    addNote(
      notes,
      day,
      "event",
      event.tone === "positive" ? "good" : "warning",
      event.title,
      event.outcome,
      event.lesson,
      firstTime,
    );

    if (firstTime) {
      lessonsSeen = rememberLesson(lessonsSeen, topic);
    }

    log = addLog(
      log,
      day,
      event.tone === "positive" ? "good" : "warning",
      event.outcome,
    );
  }

  solarEfficiency = clamp(solarEfficiency, 0.5, 1);
  greenhouseGrowth = clamp(greenhouseGrowth, 0, 100);

  /* Expedition sample discovery. */
  if (
    finalEffects.expeditionSample &&
    decisions.fieldwork === "expedition"
  ) {
    stats.evaDays += 1;

    const foundSample =
      rollUnit(originalState.seed, day, "expedition-sample") <
      SIM.sampleChance;

    if (foundSample) {
      stats.samplesFound += 1;
      resources.water += SIM.sampleWater;
      research += SIM.sampleResearch;

      addNote(
        notes,
        day,
        "system",
        "good",
        "Sample recovered",
        "The expedition found a promising sample. The team gained water and research points in this simplified game scenario.",
      );

      log = addLog(
        log,
        day,
        "good",
        "The expedition recovered a sample.",
      );
    }
  }

  if (finalEffects.isEva) {
    stats.evaDays +=
      decisions.fieldwork === "expedition" ? 0 : 1;
  }

  if (decisions.focus === "shelter") {
    stats.shelterDays += 1;
  }

  /* Research output. */
  research +=
    finalEffects.research *
    finalEffects.researchMultiplier *
    efficiency;

  /* Radiation dose. */
  const protection = calculateRadiationProtection(resources);

  const shelterMultiplier =
    decisions.focus === "shelter" ? 0.4 : 1;

  const chronicDose =
    SIM.chronicDose *
    finalEffects.doseMultiplier *
    shelterMultiplier;

  const unshieldedDose = chronicDose + eventDose;
  const receivedDose =
    unshieldedDose * (1 - protection) +
    finalEffects.extraDose;

  const doseMsv = Math.max(0, receivedDose);
  totalDoseMsv += doseMsv;

  /* Crew health changes. */
  const lifeSupportOkay =
    resources.oxygen > 0 &&
    resources.water > 0 &&
    resources.food > 0 &&
    resources.power > 0;

  if (lifeSupportOkay) {
    addHealth("recovery", SIM.crewRecovery);
  }

  addHealth("workload", finalEffects.crewHealth);
  addHealth("events", eventCrewHealth);
  addHealth("radiation", -doseMsv * SIM.healthPerMsv);

  /* Shortage penalties. */
  const lifeSupportResources: LifeSupportId[] = [
    "oxygen",
    "water",
    "food",
    "power",
  ];

  for (const resourceId of lifeSupportResources) {
    if (resources[resourceId] <= 0) {
      const penalty = SIM.shortagePenalty[resourceId];

      // Health penalties are recorded here and applied once below.
      addHealth(resourceId, -penalty);

      stats.shortageDays[resourceId] += 1;

      addNote(
        notes,
        day,
        "system",
        "danger",
        `${RESOURCE_META[resourceId].label} shortage`,
        `The ${RESOURCE_META[resourceId].label.toLowerCase()} supply ran out. The crew's health was reduced.`,
      );
    }
  }

  /* Low oxygen warning. */
  if (
    resources.oxygen > 0 &&
    resources.oxygen < SIM.lowOxygenBelow
  ) {
    // This penalty is also applied once through healthBreakdown.
    addHealth("oxygen", -SIM.lowOxygenPenalty);

    addNote(
      notes,
      day,
      "system",
      "warning",
      "Low oxygen reserve",
      "Oxygen is running low. The crew is under additional strain.",
    );
  }

  /* Apply every health change exactly once. */
  const healthChange = Object.values(healthBreakdown).reduce(
    (total, amount) => total + (amount ?? 0),
    0,
  );

  resources.crewHealth += healthChange;

  resources = clampResources(resources);

  /* Record the resolved day. */
  const report: DayReport = {
    day,
    decisions,
    eventId,
    before: resourcesBefore,
    after: cloneResources(resources),
    doseMsv: round(doseMsv, 3),
    healthBreakdown: Object.fromEntries(
      Object.entries(healthBreakdown).map(([key, value]) => [
        key,
        round(value ?? 0, 3),
      ]),
    ) as HealthBreakdown,
    notes,
  };

  stats.history.push({
    day,
    resources: cloneResources(resources),
    doseMsv: round(doseMsv, 3),
  });

  const failureCause = determineFailure(resources);

  let phase: MissionState["phase"] = "playing";
  let outcome: MissionOutcome | null = null;

  if (failureCause) {
    phase = "failure";
    outcome = createFailureOutcome(day, failureCause);

    log = addLog(
      log,
      day,
      "danger",
      outcome.headline,
    );
  } else if (day >= MISSION_LENGTH_DAYS) {
    phase = "victory";

    const rating = computeRating(
      computeScore({
        ...originalState,
        resources,
        stats,
        totalDoseMsv,
        research,
      }),
    );

    outcome = {
      result: "victory",
      day,
      rating,
      headline: "Mission completed",
      summary:
        "The crew completed the 30-day mission and kept the outpost operational.",
    };

    log = addLog(
      log,
      day,
      "good",
      "All 30 mission days completed. Mission success!",
    );
  }

  /* Prepare the next day's forecast. */
  const nextDay = day + 1;
  const nextEvent =
    phase === "playing"
      ? eventForDay(originalState.seed, nextDay)
      : null;

  if (nextEvent) {
    const forecast = EVENTS[nextEvent];

    log = addLog(
      log,
      nextDay,
      "warning",
      `Day ${nextDay} forecast: ${forecast.forecast}`,
    );
  }

  return {
    ...originalState,
    phase,
    day: phase === "playing" ? nextDay : day,
    resources,
    emergencyCaches,
    solarEfficiency,
    greenhouseGrowth,
    research: round(research, 2),
    totalDoseMsv: round(totalDoseMsv, 3),
    todaysEvent: nextEvent,
    log,
    lastReport: report,
    lessonsSeen,
    stats,
    outcome,
  };
}

/* -------------------------------------------------------------------------- */
/*  Alerts                                                                    */
/* -------------------------------------------------------------------------- */

export function getAlerts(state: MissionState): Alert[] {
  const alerts: Alert[] = [];

  for (const resourceId of RESOURCE_ORDER) {
    const value = state.resources[resourceId];
    const status = resourceStatus(resourceId, value);
    const metadata = RESOURCE_META[resourceId];

    if (status === "healthy") {
      continue;
    }

    alerts.push({
      id: `resource-${resourceId}`,
      severity: status === "critical" ? "critical" : "warning",
      title:
        status === "critical"
          ? `${metadata.label} critical`
          : `${metadata.label} running low`,
      message:
        `${metadata.label} is at ${round(value, metadata.decimals)} ${metadata.unit}.`,
      advice:
        status === "critical"
          ? "Address this resource immediately to protect the crew."
          : "Consider conserving supplies or using an appropriate maintenance option.",
    });
  }

  if (state.emergencyCaches <= 1) {
    alerts.push({
      id: "emergency-caches",
      severity: state.emergencyCaches === 0 ? "critical" : "warning",
      title: "Emergency reserves low",
      message: `${state.emergencyCaches} emergency cache(s) remain.`,
      advice: "Keep the remaining reserves for a serious shortage.",
    });
  }

  if (state.todaysEvent) {
    const event = EVENTS[state.todaysEvent];

    alerts.push({
      id: `event-${event.id}`,
      severity: "warning",
      title: event.title,
      message: event.forecast,
      advice: event.blocksEva
        ? "Spacewalks are suspended while this alert is active."
        : "Review the forecast and choose your daily plan carefully.",
    });
  }

  if (state.resources.crewHealth < 40) {
    alerts.push({
      id: "crew-efficiency",
      severity: "critical",
      title: "Crew efficiency reduced",
      message:
        "The crew is in poor health and cannot work at full efficiency.",
      advice: "Prioritize rest, shelter and essential life-support resources.",
    });
  }

  if (state.resources.habitat < SIM.leakStartsBelow) {
    alerts.push({
      id: "habitat-leak",
      severity: "warning",
      title: "Habitat integrity weakened",
      message:
        "The habitat is damaged. Further deterioration may cause air leaks.",
      advice: "Schedule repair work to restore habitat integrity.",
    });
  }

  return alerts;
}

/* -------------------------------------------------------------------------- */
/*  Mission projections                                                       */
/* -------------------------------------------------------------------------- */

export function projectOutlook(state: MissionState): Outlook {
  const next: Outlook = {
    oxygen: null,
    water: null,
    food: null,
    power: null,
    crewLost: null,
  };

  /*
   * This estimate assumes the default decisions continue each day.
   * It does not attempt to predict future random events or player choices.
   */
  const effects = combineDecisionEffects(DEFAULT_DECISIONS);

  let oxygen = state.resources.oxygen;
  let water = state.resources.water;
  let food = state.resources.food;
  let power = state.resources.power;
  let habitat = state.resources.habitat;
  let shielding = state.resources.shielding;
  let crewHealth = state.resources.crewHealth;
  let greenhouseGrowth = state.greenhouseGrowth;

  const daysRemaining = Math.max(
    0,
    MISSION_LENGTH_DAYS - state.day + 1,
  );

  for (let offset = 0; offset < daysRemaining; offset += 1) {
    const day = state.day + offset;

    /* Life-support consumption. */
    oxygen -=
      SIM.oxygenUse * effects.oxygenUseMultiplier +
      effects.extraOxygenUse;

    water -=
      SIM.waterUse * effects.waterUseMultiplier +
      effects.extraWaterUse;

    food -= SIM.foodUse * effects.foodUseMultiplier;

    /* Default greenhouse operations. */
    const greenhouse = effects.greenhouse;

    if (greenhouse) {
      const canOperate =
        power >= SIM.greenhouseMinPower &&
        water >= SIM.greenhouseMinWater;

      if (canOperate) {
        greenhouseGrowth = clamp(
          greenhouseGrowth +
            greenhouse.growthPerDay * effects.greenhouseMultiplier,
          0,
          100,
        );

        water -= greenhouse.waterPerDay;
        power -= greenhouse.powerPerDay;
        oxygen += greenhouse.oxygenPerDay;

        if (greenhouseGrowth >= SIM.harvestAt) {
          food += SIM.harvestYield;
          greenhouseGrowth = 0;
        }
      } else {
        greenhouseGrowth = Math.max(
          0,
          greenhouseGrowth - SIM.wiltPerDay,
        );
      }
    } else {
      greenhouseGrowth = Math.max(
        0,
        greenhouseGrowth - SIM.wiltPerDay,
      );
    }

    /* Daily power generation and use. */
    const generation = isLunarNight(day)
      ? SIM.nightGeneration
      : SIM.solarGeneration * state.solarEfficiency;

    const powerLoad =
      SIM.baseLoad * effects.powerLoadMultiplier +
      effects.extraPowerLoad;

    power += generation - powerLoad;

    /* Default fieldwork is routine maintenance. */
    const efficiency = crewEfficiency(crewHealth);

    habitat +=
      effects.habitat +
      effects.habitatRepair * efficiency -
      SIM.habitatWear -
      effects.habitatWear;

    /* Natural shielding wear. */
    shielding -= SIM.shieldingDecay;

    /*
     * Clamp resources at their actual storage limits after each
     * projected day, matching the daily simulation.
     */
    oxygen = clamp(oxygen, 0, RESOURCE_META.oxygen.max);
    water = clamp(water, 0, RESOURCE_META.water.max);
    food = clamp(food, 0, RESOURCE_META.food.max);
    power = clamp(power, 0, RESOURCE_META.power.max);
    habitat = clamp(habitat, 0, RESOURCE_META.habitat.max);
    shielding = clamp(shielding, 0, RESOURCE_META.shielding.max);

    /* Record the first projected shortage day for each resource. */
    if (next.oxygen === null && oxygen <= 0) {
      next.oxygen = day;
    }

    if (next.water === null && water <= 0) {
      next.water = day;
    }

    if (next.food === null && food <= 0) {
      next.food = day;
    }

    if (next.power === null && power <= 0) {
      next.power = day;
    }

    /* Estimate radiation exposure using projected shielding. */
    const projectedResources: Resources = {
      oxygen,
      water,
      food,
      power,
      habitat,
      shielding,
      crewHealth,
    };

    const protection =
      calculateRadiationProtection(projectedResources);

    const dose =
      SIM.chronicDose *
      effects.doseMultiplier *
      (1 - protection);

    /* Estimate daily crew-health changes. */
    const lifeSupportOkay =
      oxygen > 0 &&
      water > 0 &&
      food > 0 &&
      power > 0;

    let healthChange = 0;

    if (lifeSupportOkay) {
      healthChange += SIM.crewRecovery;
    }

    healthChange += effects.crewHealth;
    healthChange -= dose * SIM.healthPerMsv;

    if (oxygen <= 0) {
      healthChange -= SIM.shortagePenalty.oxygen;
    } else if (oxygen < SIM.lowOxygenBelow) {
      healthChange -= SIM.lowOxygenPenalty;
    }

    if (water <= 0) {
      healthChange -= SIM.shortagePenalty.water;
    }

    if (food <= 0) {
      healthChange -= SIM.shortagePenalty.food;
    }

    if (power <= 0) {
      healthChange -= SIM.shortagePenalty.power;
    }

    crewHealth = clamp(
      crewHealth + healthChange,
      0,
      RESOURCE_META.crewHealth.max,
    );

    /*
     * Crew loss is projected only from crew-health or life-support
     * failure. Habitat failure is tracked separately.
     */
    if (
      crewHealth <= 0 ||
      oxygen <= 0 ||
      water <= 0 ||
      food <= 0 ||
      power <= 0
    ) {
      next.crewLost = day;
      break;
    }

    if (habitat <= 0) {
      break;
    }
  }

  return next;
}

/* -------------------------------------------------------------------------- */
/*  Scoring and mission rating                                                */
/* -------------------------------------------------------------------------- */

export function computeScore(state: MissionState): number {
  const daysCompleted = state.stats.history.length;
  const survivalScore =
    (daysCompleted / MISSION_LENGTH_DAYS) * 40;

  const healthScore =
    (state.resources.crewHealth / 100) * 20;

  const habitatScore =
    (state.resources.habitat / 100) * 15;

  const resourceAverage =
    (
      state.resources.oxygen / 100 +
      state.resources.water / RESOURCE_META.water.max +
      state.resources.food / RESOURCE_META.food.max +
      state.resources.power / 100
    ) / 4;

  const resourceScore = resourceAverage * 15;

  const researchScore = clamp(
    state.research / 60,
    0,
    1,
  ) * 5;

  const safetyScore =
    state.stats.shortageDays.oxygen === 0 &&
    state.stats.shortageDays.water === 0 &&
    state.stats.shortageDays.food === 0 &&
    state.stats.shortageDays.power === 0
      ? 5
      : 0;

  const total =
    survivalScore +
    healthScore +
    habitatScore +
    resourceScore +
    researchScore +
    safetyScore;

  return Math.round(clamp(total, 0, 100));
}

export function computeRating(score: number): MissionRating {
  if (score >= 85) {
    return "exemplary";
  }

  if (score >= 65) {
    return "successful";
  }

  return "narrow";
}

/* -------------------------------------------------------------------------- */
/*  Mission debrief                                                           */
/* -------------------------------------------------------------------------- */

export function createMissionDebrief(
  state: MissionState,
): MissionDebrief {
  const score = computeScore(state);
  const rating =
    state.phase === "victory"
      ? computeRating(score)
      : null;

  const daysCompleted = state.stats.history.length;

  const performance: DebriefSection = {
    title: "Mission performance",
    summary:
      state.phase === "victory"
        ? `The crew completed all ${MISSION_LENGTH_DAYS} mission days.`
        : `The mission ended on day ${state.outcome?.day ?? state.day}.`,
    points: [
      `${daysCompleted} of ${MISSION_LENGTH_DAYS} mission days completed.`,
      `Final performance score: ${score}/100.`,
      `Research points earned: ${round(state.research, 1)}.`,
    ],
  };

  const resourceManagement: DebriefSection = {
    title: "Resource management",
    summary:
      "The final resource levels show how effectively the outpost managed its supplies.",
    points: RESOURCE_ORDER.map((resourceId) => {
      const metadata = RESOURCE_META[resourceId];
      const value = state.resources[resourceId];

      return `${metadata.label}: ${round(value, metadata.decimals)} ${metadata.unit}`;
    }),
  };

  const crewSafety: DebriefSection = {
    title: "Crew safety",
    summary:
      "Crew health and radiation exposure are simplified game indicators.",
    points: [
      `Final crew health: ${round(state.resources.crewHealth, 1)}%.`,
      `Cumulative simulated dose: ${round(state.totalDoseMsv, 2)} mSv.`,
      `Spacewalk days: ${state.stats.evaDays}.`,
      `Shelter days: ${state.stats.shelterDays}.`,
      `NASA's 600 mSv career effective-dose limit is context only, not a daily safe level or a direct comparison with the game's simplified dose.`,
    ],
  };

  const majorDecisions: DebriefSection = {
    title: "Major decisions",
    summary:
      "These counts show the choices made throughout the mission.",
    points: Object.entries(state.stats.decisionCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => `${key}: ${count} day(s)`),
  };

  const lessons = [
    "Life-support resources are connected. Saving power can affect research, comfort and food production.",
    "Radiation protection depends on the material, its thickness and the type of particle. A single game percentage cannot represent every real shielding situation.",
    "Preventive maintenance can reduce the chance that small equipment problems become major failures.",
    "Emergency reserves are useful because real missions must plan for unexpected problems.",
    "The game's radiation baseline is a simplified approximation informed by one Chang'e-4 LND instrument measurement inside the lander, with shielding from the instrument and lander structure. It is not a universal lunar rate or a direct measurement of human exposure.",
  ];

  return {
    score,
    rating,
    performance,
    resourceManagement,
    crewSafety,
    majorDecisions,
    lessons,
  };
}

/* -------------------------------------------------------------------------- */
/*  Static briefing content                                                   */
/* -------------------------------------------------------------------------- */

export function getBriefingPoints(): readonly string[] {
  return BRIEFING_POINTS;
}

export function getCrewSize(): number {
  return CREW_SIZE;
}
