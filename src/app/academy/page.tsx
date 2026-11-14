import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Astronaut Academy",
  description: "Build the knowledge your crew will need on the lunar surface.",
};

export default function AcademyPage() {
  return (
    <ModulePlaceholder
      href="/academy"
      eyebrow="Step 02 · Astronaut Academy"
      title="Astronaut Academy"
      description="Build the knowledge and judgement your crew will rely on once they are on the surface."
      features={[
        {
          title: "Core knowledge",
          description:
            "Short, focused lessons on the science and engineering behind living on the Moon.",
          tags: ["Science", "Engineering"],
        },
        {
          title: "Skills training",
          description:
            "Practise the decisions and procedures your crew will depend on before they matter.",
          tags: ["Procedures", "Decisions"],
        },
        {
          title: "Readiness check",
          description:
            "Test what you have learned and see which areas need more preparation.",
          tags: ["Assessment"],
        },
      ]}
    />
  );
}