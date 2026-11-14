import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Command the lunar outpost: resources, crew and decisions.",
};

export default function MissionControlPage() {
  return (
    <ModulePlaceholder
      href="/mission-control"
      eyebrow="Step 03 · Mission Control"
      title="Mission Control"
      description="Command the outpost: balance resources, look after your crew and respond to whatever the Moon throws at you."
      features={[
        {
          title: "Resource management",
          description:
            "Balance power, oxygen, water and food across the lunar day and night.",
          tags: ["Power", "Oxygen", "Water", "Food"],
        },
        {
          title: "Crew welfare",
          description:
            "Monitor health, fatigue and morale as conditions change around your astronauts.",
          tags: ["Health", "Morale"],
        },
        {
          title: "Decision events",
          description:
            "Respond to equipment failures, dust and communication disruptions as they arise.",
          tags: ["Failures", "Dust", "Comms"],
        },
      ]}
    />
  );
}