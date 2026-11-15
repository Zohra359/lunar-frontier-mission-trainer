
import type { Metadata } from "next";
import { MissionControlDashboard } from "@/components/games/MissionControlDashboard";

export const metadata: Metadata = {
  title: "Mission Control",
  description:
    "Command the lunar outpost: monitor resources, protect your crew and manage mission operations.",
};

export default function MissionControlPage() {
  return <MissionControlDashboard />;
}
