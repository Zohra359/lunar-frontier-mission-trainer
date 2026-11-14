import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Mission Briefing",
  description:
    "Understand the mission and the lunar environment before you take command.",
};

export default function BriefingPage() {
  return (
    <ModulePlaceholder
      href="/briefing"
      eyebrow="Step 01 · Mission Briefing"
      title="Mission Briefing"
      description="Understand what your crew is being sent to do, and the environment they will face, before you take command."
      features={[
        {
          title: "Mission objectives",
          description:
            "A clear statement of what your outpost must achieve and how success will be measured.",
          tags: ["Goals", "Success criteria"],
        },
        {
          title: "Lunar environment",
          description:
            "The real conditions that shape every decision: gravity, temperature, radiation and dust.",
          tags: ["Gravity", "Radiation", "Dust"],
        },
        {
          title: "Crew and outpost",
          description:
            "Who is on your team, what the outpost can do and the resources you start with.",
          tags: ["Crew", "Resources"],
        },
      ]}
    />
  );
}