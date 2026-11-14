
import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Mission Debrief",
  description: "Review your decisions, outcomes and lessons learned.",
};

export default function DebriefPage() {
  return (
    <ModulePlaceholder
      href="/debrief"
      eyebrow="Step 04 · Mission Debrief"
      title="Mission Debrief"
      description="Look back at how your mission unfolded, understand why, and carry the lessons into your next command."
      features={[
        {
          title: "Outcome summary",
          description:
            "A clear account of how your mission ended and what your outpost achieved.",
          tags: ["Results"],
        },
        {
          title: "Decision review",
          description:
            "Revisit the choices that mattered most and what they led to.",
          tags: ["Decisions"],
        },
        {
          title: "Lessons learned",
          description:
            "Connect your results to real lunar exploration concepts so you can do better next time.",
          tags: ["Learning"],
        },
      ]}
    />
  );
}
