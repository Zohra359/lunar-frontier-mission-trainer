
/**
 * Lunar Frontier: simulation settings and educational content.
 *
 * EVERY NUMBER IN THIS FILE IS A GAME SETTING. Values are inspired by real
 * lunar science but simplified so the game is playable in a few minutes. This
 * is an educational simulation, not a real engineering model.
 *
 * Change numbers here to rebalance the game; the engine reads everything from
 * this file.
 */

import type {
  DailyDecisions,
  DecisionCategory,
  EventId,
  MissionEventDefinition,
  ResourceId,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Mission                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Each mission day is one 24-hour Earth day. A real lunar day (sunrise to
 * sunrise at one place) lasts about 29.5 Earth days, so the game calls its
 * days "mission days". The Moon's rotation relative to the stars (its
 * sidereal period) is shorter, about 27.3 days. The lunar day is longer
 * because the Earth-Moon system also moves around the Sun.
 */
export const MISSION_LENGTH_DAYS = 30;
export const CREW_SIZE = 4;

/** Seed used for the very first, server-rendered state. Never random. */
export const DEFAULT_SEED = 20260;

/**
 * SIMPLIFIED GAME ASSUMPTIONS: HOW THE NUMBERS WERE CHOSEN
 *
 * Every value in SIM below is a simplified game assumption chosen for
 * playability. None of them is a measured value or an engineering figure.
 *
 * - Oxygen: 2% of the reserve per day uses about 60% over 30 days. The rest
 *   is margin for leaks, spacewalks and events.
 * - Water: 420 L at 9 L/day net uses 270 L. A greenhouse at standard speed
 *   draws about 150 L more over a full mission, so growing food is a real
 *   water decision.
 * - Food: 18 days of supply cannot last 30 days. Two standard greenhouse
 *   harvests add 12 days, and rationing or emergency caches fill the gap.
 * - Power: sunlight gives +14 against a base load of 10 (net +4 a day). At
 *   night the backup source gives +3 (net -7 a day), so 8 nights use about
 *   56 points. Research, spacewalks and the greenhouse push the balance
 *   toward zero, so the player must choose.
 * - Radiation: the 1.4 mSv a day baseline is a simplified approximation
 *   informed by one published Chang'e-4 LND instrument measurement (see
 *   RESOURCE_META.shielding). The detector was inside the lander and shielded
 *   by the instrument and lander structure. This is not a direct measurement
 *   of human exposure or a universal lunar-surface rate.
 *   At 0.9 health per mSv, a crew with about 35% protection loses almost as
 *   much health as it recovers (1.2 a day), so shielding work and shelter
 *   during storms matter in the game.
 * - Habitat: slow wear (0.4 a day) plus event damage; repair gives +6.
 */
export const SIM = {
  /** Starting resource levels (simplified game assumptions). */
  start: {
    oxygen: 100,
    water: 420,
    food: 18,
    power: 85,
    habitat: 100,
    crewHealth: 100,
    shielding: 35,
  } satisfies Record<ResourceId, number>,
  startingCaches: 3,

  /**
   * Simplified lunar night: no sunlight on these mission days (inclusive).
   * A real lunar night lasts about two weeks; the game shortens it to 8 days.
   */
  lunarNight: { firstDay: 15, lastDay: 22 },

  /** Daily needs of the whole crew. */
  oxygenUse: 2, // % of the reserve per day
  waterUse: 9, // litres per day, net after recycling
  foodUse: 1, // days of supply per day

  /** Power: percentage points of battery per day. */
  baseLoad: 10,
  solarGeneration: 14,
  nightGeneration: 3,

  /** Habitat and shielding wear. */
  habitatWear: 0.4,
  shieldingDecay: 0.15,
  /** Below this habitat level, air slowly leaks out. */
  leakStartsBelow: 70,
  leakPerPoint: 0.03,

  /** Radiation (simplified). */
  /** Simplified game baseline informed by Chang'e-4 LND, in mSv per day. */
  chronicDose: 1.4,
  /** Simplified game rule: the best possible reduction in simulated dose. */
  maxShieldReduction: 0.8,
  /** How much one mSv of dose costs the crew-health score. */
  healthPerMsv: 0.9,
  /** Shielding builds lose effect as protection gets higher. */
  diminishingDivisor: 110,
  diminishingFloor: 0.25,
  /** Damaged habitat protects less: shielding counts for 50% to 100%. */
  habitatShieldWeight: 0.5,

  /** Crew. */
  crewRecovery: 1.2, // health per day when life support is fine
  shortagePenalty: {
    oxygen: 30,
    water: 10,
    food: 6,
    power: 15,
  },
  powerOutageHabitatDamage: 3,
  lowOxygenBelow: 15,
  lowOxygenPenalty: 3,

  /** Crew efficiency: unhealthy crews work less effectively. */
  efficiencyTiers: [
    { minHealth: 70, value: 1 },
    { minHealth: 40, value: 0.75 },
    { minHealth: 0, value: 0.5 },
  ] as const,

  /** Greenhouse. */
  harvestYield: 6, // days of food per harvest
  harvestAt: 100,
  wiltPerDay: 4,
  greenhouseMinPower: 8,
  greenhouseMinWater: 8,

  /** Events. */
  eventChance: 0.6,
  /** Share of losses that remain when a repair crew responds. */
  repairResponseFactor: 0.5,

  /** Expedition samples. */
  sampleChance: 0.25,
  sampleWater: 30,
  sampleResearch: 3,

  /**
   * Real-world reference only: NASA's cumulative career limit on effective
   * dose for an astronaut. It is a lifetime limit, not a daily safe level,
   * and the game's simplified dose numbers are not real effective doses.
   */
  careerDoseLimitMsv: 600,
} as const;

/* -------------------------------------------------------------------------- */
/*  Resource information                                                      */
/* -------------------------------------------------------------------------- */

export interface ResourceMeta {
  id: ResourceId;
  label: string;
  unit: string;
  /** Storage limit; levels never go above it. */
  max: number;
  decimals: number;
  /** At or below this level the dashboard shows a warning. */
  low: number;
  /** At or below this level the dashboard shows a critical alert. */
  critical: number;
  /** One short, young-learner-friendly reason this resource matters. */
  whyItMatters: string;
  /** Established science, in plain language. */
  realScience: string;
  /** What this game simplifies. */
  gameAssumption: string;
}

export const RESOURCE_ORDER: readonly ResourceId[] = [
  "oxygen",
  "water",
  "food",
  "power",
  "habitat",
  "shielding",
  "crewHealth",
];

export const RESOURCE_META: Record<ResourceId, ResourceMeta> = {
  oxygen: {
    id: "oxygen",
    label: "Oxygen",
    unit: "%",
    max: 100,
    decimals: 0,
    low: 30,
    critical: 12,
    whyItMatters:
      "Your crew breathes it. Without enough oxygen people become very sick within minutes.",
    realScience:
      "A resting person uses roughly 0.8 kg of oxygen a day. Early Moon bases would carry oxygen or make it from water. Scientists are also testing ways to pull oxygen out of lunar soil.",
    gameAssumption:
      "Oxygen is shown as a percentage of one stored reserve. The 2% a day use is a game number.",
  },
  water: {
    id: "water",
    label: "Water",
    unit: "L",
    max: 500,
    decimals: 0,
    low: 100,
    critical: 40,
    whyItMatters:
      "People drink it, cook with it and wash with it. It also cools machines and feeds the plants.",
    realScience:
      "The International Space Station recycles most of its water. Water ice has been detected on the Moon, mainly in permanently shadowed craters near the poles. How much there is, exactly where it is, how easy it is to reach and whether it can practically be extracted are all still uncertain.",
    gameAssumption:
      "The 9 litres a day is a simplified net loss after recycling, and the starting amount is a game number. Real recycling systems are far more complicated.",
  },
  food: {
    id: "food",
    label: "Food",
    unit: "days",
    max: 40,
    decimals: 1,
    low: 8,
    critical: 3,
    whyItMatters:
      "Food gives the crew energy to work and stay healthy. Resupply from Earth takes days and costs a lot.",
    realScience:
      "Space food is mostly packaged and stored. Astronauts have grown small crops on the ISS, but plants only add a little to the menu so far.",
    gameAssumption:
      "Food is counted in days of supply for the whole crew, and a greenhouse harvest simply adds days.",
  },
  power: {
    id: "power",
    label: "Power",
    unit: "%",
    max: 100,
    decimals: 0,
    low: 30,
    critical: 12,
    whyItMatters:
      "Electricity runs air systems, heaters, lights, radios and the greenhouse. With no power, life support stops.",
    realScience:
      "A lunar day (sunrise to sunrise at one place) lasts about 29.5 Earth days, so most places get about two weeks of sunlight followed by about two weeks of darkness. The Moon's rotation relative to the stars is shorter, about 27.3 days. Some high spots near the poles are sunlit for much longer than other places.",
    gameAssumption:
      "To keep the 30-day mission playable, the game squeezes the lunar night into 8 days (days 15 to 22). The battery is a single 0 to 100% meter, and all power numbers are simplified game assumptions.",
  },
  habitat: {
    id: "habitat",
    label: "Habitat integrity",
    unit: "%",
    max: 100,
    decimals: 0,
    low: 50,
    critical: 25,
    whyItMatters:
      "The habitat holds in air and heat and keeps out the vacuum, dust and tiny space rocks.",
    realScience:
      "The Moon has almost no atmosphere. Surface temperatures swing from about -170 °C at night to about +120 °C in daylight, and tiny space rocks (micrometeoroids) hit at very high speed.",
    gameAssumption:
      "A real habitat has thousands of parts. The game squeezes them into one health number, and damage and repair amounts are simplified game assumptions.",
  },
  shielding: {
    id: "shielding",
    label: "Radiation protection",
    unit: "%",
    max: 100,
    decimals: 0,
    low: 25,
    critical: 10,
    whyItMatters:
      "Space radiation can harm the body. More protection means less radiation reaches your crew.",
    realScience:
      "The Moon has no global magnetic field and almost no atmosphere, so galactic cosmic rays and solar particles reach the surface. Material placed around a habitat, such as soil or water, can reduce exposure, but how much depends on the material, its thickness and the type of particle. Thin layers can stop many solar particles, while very energetic cosmic rays are harder to stop and can create secondary particles when they hit a thick layer. Spacesuits give little radiation protection.",
    gameAssumption:
      "Protection is a single made-up percentage that lowers the simulated dose by a simple rule. Real shielding does not reduce every kind of radiation in the same proportion. The baseline of 1.4 mSv a day is a simplified approximation informed by Chang'e-4's Lunar Lander Neutrons and Dosimetry (LND) instrument. The detector was inside the lander and shielded by the instrument and lander structure. This was one instrument measurement at one location under particular solar conditions, not a universal lunar-surface rate or a direct measurement of human exposure. The reading is not a fixed value for all places or times and conditions such as the solar cycle matter. Turning dose into crew health is a simplified game rule.",
  },
  crewHealth: {
    id: "crewHealth",
    label: "Crew health",
    unit: "%",
    max: 100,
    decimals: 0,
    low: 50,
    critical: 25,
    whyItMatters:
      "A healthy crew works better and repairs things faster. If crew health reaches zero, the mission is lost.",
    realScience:
      "Radiation, isolation, hard work, illness and low gravity (about one sixth of Earth's) all affect astronauts.",
    gameAssumption:
      "Crew health is a made-up score for the whole team, and its recovery and loss rates are simplified game assumptions. It is not a medical measurement.",
  },
};

/* -------------------------------------------------------------------------- */
/*  Science vs simulation (shown in the interface)                            */
/* -------------------------------------------------------------------------- */

export const EDUCATIONAL_DISCLAIMER =
  "Educational simulation. Real lunar science inspires the ideas, but all numbers are simplified game settings. This is not a real engineering model and must not be used to plan real missions.";

export const ESTABLISHED_SCIENCE: readonly string[] = [
  "A lunar day (sunrise to sunrise at one place) lasts about 29.5 Earth days, so most places get roughly two weeks of sunlight and two weeks of darkness. The Moon's rotation relative to the stars takes about 27.3 days.",
  "The Moon has almost no atmosphere and no global magnetic field, so space radiation reaches its surface.",
  "Galactic cosmic rays are a continuous background hazard on the Moon. Solar particle events are different: they are sporadic bursts from the Sun.",
  "How well a material shields against radiation depends on the material, its thickness and the type of particle. Soil and water can reduce exposure, but no layer blocks every kind of radiation equally.",
  "Lunar dust is sharp and sticks to things. Apollo astronauts found it clung to their suits and equipment.",
  "Without an atmosphere to burn them up, even dust-sized space rocks hit the Moon at very high speed.",
  "Water ice has been detected on the Moon, mainly in permanently shadowed craters near the poles. Its distribution, accessibility and whether it can be extracted practically are still uncertain.",
  "Astronauts on the ISS recycle most of their water and have grown small crops, including lettuce.",
  "NASA's career limit for an astronaut's effective radiation dose is 600 millisieverts (mSv). It is a cumulative limit over a whole career, not a daily safe level, and teams also try to keep exposure as low as reasonably achievable.",
];

export const GAME_ASSUMPTIONS: readonly string[] = [
  "Every number in the game (starting supplies, daily use, repair amounts, event sizes and so on) is a simplified assumption chosen to make the game playable.",
  "One mission day equals one 24-hour Earth day, and the lunar night is shortened to 8 days.",
  "Resources, radiation protection and health are simple percentages or counts, not real engineering measurements.",
  "Radiation protection is one percentage that lowers the simulated dose by a simple rule. Real shielding depends on material, thickness and particle type.",
  "The baseline of 1.4 mSv a day is a simplified approximation informed by one Chang'e-4 LND instrument measurement inside the lander, with shielding from the instrument and lander structure. It is not a universal rate or a direct measurement of human exposure.",
  "Crew health is one team-wide score, and radiation dose is turned into health loss with a simple rule. Game doses are not real effective doses.",
  "Events are picked from a small list using a mission seed. Real hazards are far more varied.",
  "Greenhouse crops grow on a fixed schedule. Real plants are far less predictable.",
  "Recycling, power and air systems are single numbers instead of many connected machines.",
];

/* -------------------------------------------------------------------------- */
/*  Daily decisions                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Decision effect sizes (for example, +6 habitat from a repair crew) are
 * simplified game assumptions, not engineering values.
 */
export const DECISION_CATEGORIES: readonly DecisionCategory[] = [
  {
    id: "operations",
    title: "Outpost operations",
    question: "How much power should the outpost use today?",
    defaultOption: "normal",
    options: [
      {
        id: "normal",
        label: "Normal operations",
        tagline: "Everything runs as planned.",
        effects: {},
        lesson: {
          why: "Running everything at full strength keeps all systems and experiments working, but it uses the most electricity.",
          principle:
            "Power budget: engineers add up every load and make sure the supply can cover it.",
        },
      },
      {
        id: "conserve",
        label: "Power conservation",
        tagline: "Dim non-essential systems to save battery.",
        effects: {
          powerLoadMultiplier: 0.65,
          researchMultiplier: 0.5,
          greenhouseMultiplier: 0.7,
          crewHealth: -1,
        },
        lesson: {
          why: "Turning down lights, heaters and experiments saves energy. The crew is a little less comfortable and the plants grow more slowly.",
          principle:
            "Load shedding: when supply is short, engineers switch off the least important loads first.",
        },
      },
    ],
  },
  {
    id: "focus",
    title: "Crew focus",
    question: "What should the crew concentrate on today?",
    defaultOption: "standard",
    options: [
      {
        id: "research",
        label: "Scientific research",
        tagline: "Long hours of experiments. Big science, big demands.",
        effects: { research: 4, extraPowerLoad: 4, crewHealth: -1.5 },
        lesson: {
          why: "Instruments and computers use electricity, and long working days make people tired.",
          principle:
            "Trade-offs: every extra task costs energy or crew time, so planners weigh science value against resources and risk.",
        },
      },
      {
        id: "standard",
        label: "Standard routine",
        tagline: "A balanced day with a little science.",
        effects: { research: 1 },
        lesson: {
          why: "A balanced schedule keeps the crew steady without using extra power.",
          principle:
            "Workload planning: mission planners build in rest to avoid fatigue and mistakes.",
        },
      },
      {
        id: "rest",
        label: "Rest and rationing",
        tagline: "Slow down. Eat, drink and breathe less.",
        effects: {
          foodUseMultiplier: 0.85,
          waterUseMultiplier: 0.92,
          oxygenUseMultiplier: 0.9,
          crewHealth: 1.5,
        },
        lesson: {
          why: "When people move less, their bodies use less oxygen, food and water, and they recover.",
          principle:
            "Metabolic rate: how much oxygen a person uses depends on how active they are.",
        },
      },
      {
        id: "shelter",
        label: "Radiation shelter",
        tagline: "Work in the best-shielded room. No spacewalks.",
        effects: {
          doseMultiplier: 0.4,
          extraPowerLoad: 2,
          crewHealth: -0.5,
        },
        lesson: {
          why: "The crew stays in the best-protected part of the habitat, where more material surrounds them, so fewer particles reach them.",
          principle:
            "Shelter in place: putting more suitable material between people and radiation can lower their dose. How much it helps depends on the material, its thickness and the kind of radiation. Real crews use storm shelters during solar storms.",
        },
      },
    ],
  },
  {
    id: "fieldwork",
    title: "Field work",
    question: "What should the crew do with their work hours?",
    defaultOption: "routine",
    options: [
      {
        id: "routine",
        label: "Routine maintenance",
        tagline: "Check seals, filters and equipment.",
        effects: { habitat: 0.8 },
        lesson: {
          why: "Small regular checks find tiny problems before they grow.",
          principle:
            "Preventive maintenance: fixing small issues early is cheaper and safer than fixing big failures.",
        },
      },
      {
        id: "repair",
        label: "Repair crew",
        tagline: "Fix damage and brush dust off the solar panels.",
        effects: { habitatRepair: 6, cleanPanels: 0.15, extraPowerLoad: 2 },
        lesson: {
          why: "Repairs make the habitat stronger and clean panels make more electricity. A crew already on the job can also limit damage if something breaks today.",
          principle:
            "Damage control: fixing a problem early stops it from causing other problems.",
        },
      },
      {
        id: "expedition",
        label: "Expedition (spacewalk)",
        tagline: "Collect samples outside. Exposed to radiation.",
        effects: {
          isEva: true,
          expeditionSample: true,
          research: 5,
          extraOxygenUse: 2.5,
          extraPowerLoad: 3,
          crewHealth: -2,
          extraDose: 1.5,
          habitatWear: 1,
        },
        requirements: [
          {
            kind: "minCrewHealth",
            value: 45,
            reason: "The crew is too weak for a spacewalk.",
          },
        ],
        lesson: {
          why: "Outside, the crew uses suit oxygen, has almost no radiation protection and carries dust back inside.",
          principle:
            "Spacewalk risk: suits protect against vacuum and temperature, but give little protection from radiation. Dust sticks to everything.",
        },
      },
      {
        id: "regolith",
        label: "Pile regolith on the habitat",
        tagline: "Spacewalk to cover the habitat with Moon soil.",
        effects: {
          isEva: true,
          shieldingBuild: 10,
          extraOxygenUse: 2,
          extraPowerLoad: 3,
          crewHealth: -1.5,
          extraDose: 1.5,
        },
        requirements: [
          {
            kind: "minCrewHealth",
            value: 45,
            reason: "The crew is too weak for heavy outdoor work.",
          },
        ],
        lesson: {
          why: "Moon soil, called regolith, is heavy and everywhere. Piling it over the habitat puts more material between the crew and some of the particles.",
          principle:
            "How well shielding works depends on the material, its thickness and the type of particle. Regolith can stop many solar particles, but very energetic cosmic rays can break atoms apart and create secondary particles, so extra thickness helps less than you might expect and does not reduce every kind of radiation equally. In the game, each pile adds less protection as the level rises. Using local material also avoids heavy shipments from Earth.",
        },
      },
      {
        id: "waterwall",
        label: "Fill the water wall",
        tagline: "Set water aside as a shield around the shelter.",
        effects: { shieldingBuild: 8, extraWaterUse: 35, extraPowerLoad: 1 },
        requirements: [
          {
            kind: "minWater",
            value: 100,
            reason: "There is not enough water to spare.",
          },
        ],
        lesson: {
          why: "Water is full of hydrogen, which is good at slowing down many kinds of fast particles. The water in the wall cannot be drunk, so you pay for the protection with your supply.",
          principle:
            "Hydrogen-rich materials such as water and some plastics are generally efficient radiation shields for their weight, so engineers can reuse tanks as shielding. Even so, the result depends on the thickness and the type of radiation, and no single wall blocks everything.",
        },
      },
    ],
  },
  {
    id: "greenhouse",
    title: "Greenhouse",
    question: "How hard should the greenhouse work today?",
    defaultOption: "standard",
    options: [
      {
        id: "off",
        label: "Greenhouse off",
        tagline: "Save water and power. Crops stay dormant.",
        effects: {},
        lesson: {
          why: "Turning the lights and pumps off saves electricity and water right now, but no food is grown.",
          principle:
            "Resource trade-off: growing food costs energy and water today to get food later.",
        },
      },
      {
        id: "standard",
        label: "Standard growing",
        tagline: "Steady growth for a modest cost.",
        effects: {
          greenhouse: {
            growthPerDay: 8,
            waterPerDay: 5,
            powerPerDay: 3,
            oxygenPerDay: 0.4,
          },
        },
        lesson: {
          why: "LED lights give the plants energy, they drink water and they release a little oxygen. A harvest arrives after about two weeks.",
          principle:
            "Bioregenerative life support: plants can supply food and some oxygen, but they need light, water and time.",
        },
      },
      {
        id: "intensive",
        label: "Intensive growing",
        tagline: "Brighter lights and a faster harvest.",
        effects: {
          greenhouse: {
            growthPerDay: 12,
            waterPerDay: 8,
            powerPerDay: 5,
            oxygenPerDay: 0.6,
          },
        },
        lesson: {
          why: "Brighter lights make plants grow faster, but they use more electricity and water every day.",
          principle:
            "More light speeds up photosynthesis, but power is limited, so engineers balance growth against the energy budget.",
        },
      },
    ],
  },
  {
    id: "reserves",
    title: "Emergency reserves",
    question: "Should you open a sealed emergency cache?",
    defaultOption: "hold",
    options: [
      {
        id: "hold",
        label: "Hold reserves",
        tagline: "Keep the caches sealed.",
        effects: {},
        lesson: {
          why: "Emergency caches are your last line of defence. Once opened, they are gone.",
          principle:
            "Contingency planning: engineers keep spare supplies for the unexpected.",
        },
      },
      {
        id: "release",
        label: "Open an emergency cache",
        tagline: "Gain oxygen, water, food and power. Uses one cache.",
        effects: {
          emergencyCaches: -1,
          oxygen: 10,
          water: 40,
          food: 3,
          power: 15,
        },
        requirements: [
          {
            kind: "minEmergencyCaches",
            value: 1,
            reason: "There are no emergency caches left.",
          },
        ],
        lesson: {
          why: "Missions bring sealed backup supplies for emergencies. Each cache can only be used once.",
          principle:
            "Margin: space missions pack more than the expected need, because the unexpected will happen.",
        },
      },
    ],
  },
];

export const DECISION_ORDER: readonly (keyof DailyDecisions)[] = [
  "operations",
  "focus",
  "fieldwork",
  "greenhouse",
  "reserves",
];

export const DEFAULT_DECISIONS: DailyDecisions = {
  operations: "normal",
  focus: "standard",
  fieldwork: "routine",
  greenhouse: "standard",
  reserves: "hold",
};

/* -------------------------------------------------------------------------- */
/*  Mission events                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Event effect sizes (for example, -40 litres from a leak) and how often
 * events happen are simplified game assumptions.
 */
export const EVENTS: Record<EventId, MissionEventDefinition> = {
  "solar-particle-event": {
    id: "solar-particle-event",
    title: "Solar particle event",
    kind: "radiation",
    tone: "hazard",
    weight: 2,
    minDay: 3,
    blocksEva: true,
    forecast:
      "Space-weather alert: a solar flare has been detected. Fast, energetic particles could reach the Moon within hours. Spacewalks are suspended.",
    outcome:
      "A burst of solar particles swept over the outpost, and electronics were briefly disturbed.",
    effects: { dose: 25, power: -4 },
    lesson: {
      why: "The Sun sometimes throws out huge bursts of fast particles. The Moon has no magnetic field and almost no atmosphere to stop them.",
      principle:
        "Shielding works by putting material between people and particles. How well it works depends on the material, its thickness and the type of particle: the solar protons in these bursts are easier to stop than very energetic cosmic rays. Crews wait out storms in the best-protected room.",
    },
  },
  "radiation-alarm": {
    id: "radiation-alarm",
    title: "Elevated radiation alert",
    kind: "radiation",
    tone: "hazard",
    weight: 2,
    minDay: 2,
    blocksEva: true,
    forecast:
      "Dosimeters are reading higher than usual. Mission Control has issued an elevated radiation alert, so spacewalks are paused as a precaution.",
    outcome: "Radiation readings climbed for several hours and then settled.",
    effects: { dose: 6 },
    lesson: {
      why: "Galactic cosmic rays come from far outside our solar system and reach the Moon all the time, so there is always some background radiation. Solar particle events are different, because they are sporadic bursts from the Sun. Readings can rise for several reasons, so teams treat any rise as a reason to be careful.",
      principle:
        "Radiation monitoring: dosimeters track dose in millisieverts (mSv), and teams try to keep exposure as low as reasonably achievable. Career limits, such as NASA's 600 mSv limit on effective dose, apply to a whole career and are not daily safe levels.",
    },
  },
  "equipment-malfunction": {
    id: "equipment-malfunction",
    title: "Air system malfunction",
    kind: "equipment",
    tone: "hazard",
    weight: 2,
    minDay: 2,
    forecast:
      "Alarm: a fan in the air-processing system is vibrating and might fail.",
    outcome:
      "The air-processing unit lost performance for a while, wasting oxygen and power.",
    effects: { oxygen: -6, power: -3 },
    lesson: {
      why: "Machines wear out, and on the Moon there is no repair shop nearby.",
      principle:
        "Redundancy and maintenance: spare parts and quick repairs stop one broken part from becoming an emergency.",
    },
  },
  "power-converter-fault": {
    id: "power-converter-fault",
    title: "Power converter fault",
    kind: "equipment",
    tone: "hazard",
    weight: 1.5,
    minDay: 2,
    forecast: "Warning: a power converter is overheating.",
    outcome: "The converter tripped its breaker, and some stored energy was lost.",
    effects: { power: -12 },
    lesson: {
      why: "When electrical equipment gets too hot, safety breakers switch it off to prevent a fire.",
      principle:
        "Fault protection: power systems are built to fail safely, even if that wastes some energy.",
    },
  },
  "water-leak": {
    id: "water-leak",
    title: "Water line leak",
    kind: "structural",
    tone: "hazard",
    weight: 2,
    minDay: 2,
    forecast: "Sensors show a pressure drop in a water line.",
    outcome: "A leak drained part of the water tank before it was sealed.",
    effects: { water: -40, habitat: -3 },
    lesson: {
      why: "Pipes and joints can crack when temperatures swing between very hot and very cold.",
      principle:
        "Closed-loop life support: every litre counts, so sensors watch for leaks and valves can isolate a damaged line.",
    },
  },
  "dust-accumulation": {
    id: "dust-accumulation",
    title: "Dust on the solar panels",
    kind: "environment",
    tone: "hazard",
    weight: 2.5,
    minDay: 2,
    sunlitOnly: true,
    forecast: "Lunar dust is settling on the solar panels.",
    outcome:
      "Dust coated the panels, so they make less electricity until they are cleaned.",
    effects: { solarEfficiency: -0.15 },
    lesson: {
      why: "Lunar dust is sharp and carries a static charge, so it clings to surfaces. Apollo astronauts found it stuck to everything.",
      principle:
        "Solar panels need light to reach their cells, so anything covering them lowers their output. Engineers test brushes, coatings and electric dust-repelling surfaces.",
    },
  },
  "pressure-warning": {
    id: "pressure-warning",
    title: "Habitat pressure warning",
    kind: "structural",
    tone: "hazard",
    weight: 2,
    minDay: 3,
    forecast: "Sensors show the habitat pressure slowly dropping.",
    outcome:
      "A seal is leaking. Some air escaped and the structure is under stress.",
    effects: { habitat: -7, oxygen: -4 },
    lesson: {
      why: "The habitat has to hold air in against the vacuum outside, and seals can wear out.",
      principle:
        "Pressure vessels: small leaks matter because air that escapes into space cannot be easily replaced.",
    },
  },
  "micrometeoroid-strike": {
    id: "micrometeoroid-strike",
    title: "Micrometeoroid strike",
    kind: "structural",
    tone: "hazard",
    weight: 1,
    minDay: 5,
    forecast:
      "Impact sensors report a micrometeoroid strike near the habitat. The crew is checking for damage.",
    outcome:
      "A tiny rock hit the outpost at very high speed, damaging the hull and scattering some shielding.",
    effects: { habitat: -9, shielding: -6 },
    lesson: {
      why: "The Moon has no atmosphere to burn up space rocks, so even dust-sized ones hit the surface at very high speed.",
      principle:
        "Impact protection: spacecraft use layered shields (Whipple shields) that break a fast rock into harmless pieces before it reaches the hull.",
    },
  },
  "greenhouse-blight": {
    id: "greenhouse-blight",
    title: "Greenhouse mould",
    kind: "biological",
    tone: "hazard",
    weight: 1.5,
    minDay: 6,
    forecast: "Leaves in the greenhouse are showing mould spots.",
    outcome: "Mould damaged part of the crop and growth was set back.",
    effects: { greenhouseGrowth: -35 },
    lesson: {
      why: "Warm, damp places are perfect for mould. Astronauts on the ISS had to manage mould on plants during an experiment.",
      principle:
        "Closed growing systems need careful control of humidity, clean surfaces and backup plans.",
    },
  },
  "scientific-discovery": {
    id: "scientific-discovery",
    title: "Scientific discovery",
    kind: "discovery",
    tone: "positive",
    weight: 2,
    minDay: 2,
    forecast:
      "Instruments are picking up an interesting signal in a nearby rock layer.",
    outcome:
      "Great news! The team's analysis found something new, and morale is high.",
    effects: { research: 8, crewHealth: 3 },
    lesson: {
      why: "Missions to the Moon help scientists learn how the Moon formed. Good results also lift the crew's spirits.",
      principle:
        "Science needs careful measurements and teamwork, and data from the Moon helps plan future missions.",
    },
  },
  "recycler-tuning": {
    id: "recycler-tuning",
    title: "Recycler software update",
    kind: "discovery",
    tone: "positive",
    weight: 1.5,
    minDay: 2,
    forecast: "Mission Control has sent a software update for the water recycler.",
    outcome:
      "The update improved how much water is recovered and trimmed pump power.",
    effects: { water: 20, power: 3 },
    lesson: {
      why: "Engineers on Earth study how the machines are performing and send improvements.",
      principle:
        "Closed-loop recycling: the ISS recovers most of its water, and small efficiency gains add up over a long mission.",
    },
  },
};

/** Fixed order so event selection is stable and testable. */
export const EVENT_ORDER: readonly EventId[] = [
  "solar-particle-event",
  "radiation-alarm",
  "equipment-malfunction",
  "power-converter-fault",
  "water-leak",
  "dust-accumulation",
  "pressure-warning",
  "micrometeoroid-strike",
  "greenhouse-blight",
  "scientific-discovery",
  "recycler-tuning",
];

/* -------------------------------------------------------------------------- */
/*  Mission briefing                                                          */
/* -------------------------------------------------------------------------- */

export const BRIEFING_POINTS: readonly string[] = [
  "Keep all four astronauts alive and the habitat working for 30 mission days.",
  "Each day, choose a plan in five areas, then press Advance Day. Every choice costs something.",
  "Events can strike without much warning. Read the alert, then decide how to respond.",
  "Radiation, water, power, air and food are connected. Fixing one often strains another.",
];
