
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_SEED,
  DEFAULT_DECISIONS,
} from "../game/config";

import {
  advanceDay,
  createInitialState,
  createMissionDebrief,
  getAlerts,
  projectOutlook,
  startMission,
  withDecision,
} from "../game/engine";

import type {
  DailyDecisions,
  DecisionCategoryId,
  MissionDebrief,
  MissionState,
  Outlook,
  Alert,
} from "../game/types";

interface MissionGameContextValue {
  missionState: MissionState;
  decisions: DailyDecisions;
  alerts: Alert[];
  outlook: Outlook;
  debrief: MissionDebrief | null;

  setDecision: (
    categoryId: DecisionCategoryId,
    optionId: string,
  ) => void;

  beginMission: () => void;
  advanceMissionDay: () => MissionState | null;
  resetMission: (seed?: number) => void;
}

const MissionGameContext =
  createContext<MissionGameContextValue | undefined>(undefined);

interface MissionGameProviderProps {
  children: ReactNode;
  seed?: number;
}

export function MissionGameProvider({
  children,
  seed = DEFAULT_SEED,
}: MissionGameProviderProps) {
  const [missionState, setMissionState] = useState<MissionState>(
    () => createInitialState(seed),
  );

  const [decisions, setDecisions] =
    useState<DailyDecisions>(DEFAULT_DECISIONS);

  // Prevent two rapid clicks from resolving the same mission day twice.
  const isAdvancingRef = useRef(false);

  const setDecision = useCallback(
    (categoryId: DecisionCategoryId, optionId: string) => {
      setDecisions((current) =>
        withDecision(
          current,
          categoryId,
          optionId as DailyDecisions[typeof categoryId],
        ),
      );
    },
    [],
  );

  const beginMission = useCallback(() => {
    setMissionState((current) => startMission(current));
  }, []);

  const advanceMissionDay = useCallback((): MissionState | null => {
    if (
      missionState.phase !== "playing" ||
      isAdvancingRef.current
    ) {
      return null;
    }

    isAdvancingRef.current = true;

    try {
      const nextState = advanceDay(missionState, decisions);

      setMissionState(nextState);

      // Each mission day starts with the default decision plan.
      setDecisions(DEFAULT_DECISIONS);

      return nextState;
    } finally {
      isAdvancingRef.current = false;
    }
  }, [missionState, decisions]);

  const resetMission = useCallback(
    (nextSeed: number = DEFAULT_SEED) => {
      isAdvancingRef.current = false;
      setMissionState(createInitialState(nextSeed));
      setDecisions(DEFAULT_DECISIONS);
    },
    [],
  );

  const alerts = useMemo(
    () => getAlerts(missionState),
    [missionState],
  );

  const outlook = useMemo(
    () => projectOutlook(missionState),
    [missionState],
  );

  const debrief = useMemo(() => {
    if (
      missionState.phase !== "victory" &&
      missionState.phase !== "failure"
    ) {
      return null;
    }

    return createMissionDebrief(missionState);
  }, [missionState]);

  const contextValue = useMemo<MissionGameContextValue>(
    () => ({
      missionState,
      decisions,
      alerts,
      outlook,
      debrief,
      setDecision,
      beginMission,
      advanceMissionDay,
      resetMission,
    }),
    [
      missionState,
      decisions,
      alerts,
      outlook,
      debrief,
      setDecision,
      beginMission,
      advanceMissionDay,
      resetMission,
    ],
  );

  return (
    <MissionGameContext.Provider value={contextValue}>
      {children}
    </MissionGameContext.Provider>
  );
}

export function useMissionGame(): MissionGameContextValue {
  const context = useContext(MissionGameContext);

  if (!context) {
    throw new Error(
      "useMissionGame must be used inside MissionGameProvider.",
    );
  }

  return context;
}
