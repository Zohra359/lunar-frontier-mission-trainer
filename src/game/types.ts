
/**
 * Core types for the Lunar Frontier mission simulator.
 *
 * This file is types only: no React, no browser APIs, no side effects.
 * The simulator is an EDUCATIONAL GAME with simplified rules. It is not a
 * real engineering model.
 */

/* -------------------------------------------------------------------------- */
/*  Resources                                                                 */
/* -------------------------------------------------------------------------- */

export type ResourceId =
  | "oxygen"
  | "water"
  | "food"
  | "power"
  | "habitat"
  | "crewHealth"
  | "shielding";

/** Current level of every tracked resource (units are listed in config.ts). */
export type Resources = Record<ResourceId, number>;

/** Resources that can run out and directly endanger the crew. */
export type LifeSupportId = "oxygen" | "water" | "food" | "power";

/* -------------------------------------------------------------------------- */
/*  Daily decisions                                                           */
/* -------------------------------------------------------------------------- */

export type OperationsChoice = "normal" | "conserve";
export type FocusChoice = "research" | "standard" | "rest" | "shelter";
export type FieldworkChoice =
  | "routine"
  | "repair"
  | "expedition"
  | "regolith"
  | "waterwall";
export type GreenhouseChoice = "off" | "standard" | "intensive";
export type ReservesChoice = "hold" | "release";

/** The player's plan for one day: exactly one option per category. */
export interface DailyDecisions {
  operations: OperationsChoice;
  focus: FocusChoice;
  fieldwork: FieldworkChoice;
  greenhouse: GreenhouseChoice;
  reserves: ReservesChoice;
}

export type DecisionCategoryId = keyof DailyDecisions;

/** Inputs and outputs of the greenhouse for one day of operation. */
export interface GreenhouseSettings {
  /** Crop growth gained per day, in percentage points (100 = harvest). */
  growthPerDay: number;
  /** Litres of water drawn per day. */
  waterPerDay: number;
  /** Battery percentage points drawn per day (grow lights, pumps). */
  powerPerDay: number;
  /** Oxygen percentage points released per day by the plants. */
  oxygenPerDay: number;
}

/**
 * What one decision option does. All fields are optional; the effects of the
 * five chosen options are combined (sums add, multipliers multiply).
 */
export interface DecisionEffects {
  /** Multiplies the whole daily power load (1 = unchanged). */
  powerLoadMultiplier?: number;
  /** Extra power load, in battery percentage points per day. */
  extraPowerLoad?: number;
  oxygenUseMultiplier?: number;
  waterUseMultiplier?: number;
  foodUseMultiplier?: number;
  /** Extra oxygen used today (for example, spacesuit supplies). */
  extraOxygenUse?: number;
  /** Extra litres of water committed today. */
  extraWaterUse?: number;
  /** One-off changes applied today (emergency cache contents, etc.). */
  oxygen?: number;
  water?: number;
  food?: number;
  power?: number;
  /** Flat habitat change from routine upkeep. */
  habitat?: number;
  /** Repair work; scaled by crew efficiency. */
  habitatRepair?: number;
  /** Extra habitat damage from today's work (for example, dust ingress). */
  habitatWear?: number;
  /** Solar-panel cleaning, in efficiency points (0.15 = +15%). */
  cleanPanels?: number;
  /** Radiation-protection work; scaled by crew efficiency and diminishing returns. */
  shieldingBuild?: number;
  crewHealth?: number;
  /** Base research points earned; scaled by crew efficiency. */
  research?: number;
  researchMultiplier?: number;
  /** Multiplies the radiation dose received today. */
  doseMultiplier?: number;
  /** Extra dose (mSv) received outside the habitat, for example during an EVA. */
  extraDose?: number;
  greenhouseMultiplier?: number;
  greenhouse?: GreenhouseSettings;
  /** Emergency caches spent (negative) or gained (positive). */
  emergencyCaches?: number;
  /** Outdoor work in a spacesuit; blocked in shelter and during radiation alerts. */
  isEva?: boolean;
  /** Expeditions may find a sample (for example, ice), decided by the mission seed. */
  expeditionSample?: boolean;
}

export type OptionRequirement =
  | { kind: "minCrewHealth"; value: number; reason: string }
  | { kind: "minWater"; value: number; reason: string }
  | { kind: "minEmergencyCaches"; value: number; reason: string };

/** Kid-friendly explanation shown the first time something happens. */
export interface LessonText {
  /** Why it happened, in plain language. */
  why: string;
  /** The engineering or science principle behind it. */
  principle: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  tagline: string;
  effects: DecisionEffects;
  requirements?: readonly OptionRequirement[];
  lesson: LessonText;
}

export interface DecisionCategory {
  id: DecisionCategoryId;
  title: string;
  question: string;
  defaultOption: string;
  options: readonly DecisionOption[];
}

/* -------------------------------------------------------------------------- */
/*  Mission events                                                            */
/* -------------------------------------------------------------------------- */

export type EventId =
  | "solar-particle-event"
  | "radiation-alarm"
  | "equipment-malfunction"
  | "power-converter-fault"
  | "water-leak"
  | "dust-accumulation"
  | "pressure-warning"
  | "micrometeoroid-strike"
  | "greenhouse-blight"
  | "scientific-discovery"
  | "recycler-tuning";

/**
 * radiation: shelter and shielding reduce the harm.
 * equipment, structural, biological: a repair crew on scene halves the losses.
 * discovery: good news.
 */
export type EventKind =
  | "radiation"
  | "equipment"
  | "structural"
  | "biological"
  | "environment"
  | "discovery";

export type EventTone = "hazard" | "positive";

/** Changes an event applies (negative = harmful, except dose and research). */
export interface EventEffects {
  oxygen?: number;
  water?: number;
  food?: number;
  power?: number;
  habitat?: number;
  crewHealth?: number;
  shielding?: number;
  research?: number;
  solarEfficiency?: number;
  greenhouseGrowth?: number;
  /** Radiation dose in mSv before shielding is applied. */
  dose?: number;
}

export interface MissionEventDefinition {
  id: EventId;
  title: string;
  kind: EventKind;
  tone: EventTone;
  /** Relative chance of being picked (higher = more common). */
  weight: number;
  /** Earliest mission day on which it can occur. */
  minDay: number;
  /** Can only happen while the outpost is in sunlight. */
  sunlitOnly?: boolean;
  /** Spacewalks are unsafe while this event is active. */
  blocksEva?: boolean;
  /** Shown at the start of the day, before the player decides. */
  forecast: string;
  /** Shown after the day is resolved. */
  outcome: string;
  effects: EventEffects;
  lesson: LessonText;
}

/* -------------------------------------------------------------------------- */
/*  Reports, log and alerts                                                   */
/* -------------------------------------------------------------------------- */

export type LogTone = "info" | "good" | "warning" | "danger";

export interface LogEntry {
  id: string;
  day: number;
  tone: LogTone;
  text: string;
}

export type NoteKind = "decision" | "event" | "system";

/** An explanation for the player: what happened, why, and the principle. */
export interface ReportNote {
  id: string;
  kind: NoteKind;
  tone: LogTone;
  title: string;
  what: string;
  /** Present the first time a topic appears, so repeats stay short. */
  why?: string;
  principle?: string;
}

export type HealthSource =
  | "recovery"
  | "workload"
  | "radiation"
  | "oxygen"
  | "water"
  | "food"
  | "power"
  | "events";

/** Net change to crew health today, split by cause. */
export type HealthBreakdown = Partial<Record<HealthSource, number>>;

export interface DayReport {
  /** The mission day that was just resolved. */
  day: number;
  decisions: DailyDecisions;
  eventId: EventId | null;
  before: Resources;
  after: Resources;
  /** Radiation dose received today (mSv, simplified). */
  doseMsv: number;
  healthBreakdown: HealthBreakdown;
  notes: ReportNote[];
}

export type AlertSeverity = "warning" | "critical";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  advice?: string;
}

/** The mission day on which each resource is projected to run out (null = it won't). */
export interface Outlook {
  oxygen: number | null;
  water: number | null;
  food: number | null;
  power: number | null;
  /** Day on which crew health would reach zero. Habitat failure is tracked separately. */
  crewLost: number | null;
}

/* -------------------------------------------------------------------------- */
/*  Mission state                                                             */
/* -------------------------------------------------------------------------- */

export type GamePhase = "briefing" | "playing" | "victory" | "failure";

export type FailureCause = "crew-lost" | "habitat-lost";
export type MissionRating = "exemplary" | "successful" | "narrow";

export interface MissionOutcome {
  result: "victory" | "failure";
  /** Mission day on which the mission ended. */
  day: number;
  cause?: FailureCause;
  rating?: MissionRating;
  headline: string;
  summary: string;
}

export interface EventRecord {
  day: number;
  eventId: EventId;
  /** True if the player's plan reduced the harm (shelter or repair crew). */
  mitigated: boolean;
}

export interface DaySnapshot {
  day: number;
  resources: Resources;
  doseMsv: number;
}

export interface MissionStats {
  history: DaySnapshot[];
  events: EventRecord[];
  /** How many days each option was chosen, keyed "category:option". */
  decisionCounts: Record<string, number>;
  /** Days on which each life-support resource ran out. */
  shortageDays: Record<LifeSupportId, number>;
  harvests: number;
  evaDays: number;
  shelterDays: number;
  samplesFound: number;
}

export interface MissionState {
  phase: GamePhase;
  /** Mission seed: the same seed always produces the same events. */
  seed: number;
  /** Current mission day, 1 to MISSION_LENGTH_DAYS. */
  day: number;
  resources: Resources;
  emergencyCaches: number;
  /** Solar-panel efficiency, 0.5 (dusty) to 1 (clean). */
  solarEfficiency: number;
  /** Crop growth, 0 to 100 (a harvest happens at 100). */
  greenhouseGrowth: number;
  research: number;
  /** Total radiation dose so far (mSv, simplified). */
  totalDoseMsv: number;
  /** The event that will take effect when today is resolved. */
  todaysEvent: EventId | null;
  log: LogEntry[];
  lastReport: DayReport | null;
  /** Topics already explained in full, so later repeats stay short. */
  lessonsSeen: string[];
  stats: MissionStats;
  outcome: MissionOutcome | null;
}

/* -------------------------------------------------------------------------- */
/*  Debrief                                                                   */
/* -------------------------------------------------------------------------- */

export interface DebriefSection {
  title: string;
  summary: string;
  points: string[];
}

export interface MissionDebrief {
  score: number;
  rating: MissionRating | null;
  performance: DebriefSection;
  resourceManagement: DebriefSection;
  crewSafety: DebriefSection;
  majorDecisions: DebriefSection;
  lessons: string[];
}

/* -------------------------------------------------------------------------- */
/*  Option availability                                                       */
/* -------------------------------------------------------------------------- */

export interface OptionAvailability {
  available: boolean;
  /** Why the option is unavailable (shown to the player). */
  reason?: string;
}
