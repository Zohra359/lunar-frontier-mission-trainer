
import type { Metadata } from "next";
import { DebriefReport } from "@/components/games/DebriefReport";

export const metadata: Metadata = {
  title: "Mission Debrief",
  description:
    "Review your mission performance, decisions, outcomes and lessons learned.",
};

export default function DebriefPage() {
  return <DebriefReport />;
}
