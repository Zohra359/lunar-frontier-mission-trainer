import { Button } from "@/components/ui/Button";
import { InfoCard, InfoCardGrid } from "@/components/ui/InfoCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { NAV_ITEMS } from "@/config/navigation";
import { Container, PageContainer } from "./PageContainer";
import { PageHeader } from "./PageHeader";

interface PlannedFeature {
  title: string;
  description: string;
  tags?: readonly string[];
}

interface ModulePlaceholderProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  features: readonly PlannedFeature[];
}

export function ModulePlaceholder({
  href,
  eyebrow,
  title,
  description,
  features,
}: ModulePlaceholderProps) {
  const index = NAV_ITEMS.findIndex((item) => item.href === href);
  const next = index >= 0 ? NAV_ITEMS[index + 1] : undefined;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        status={
          <StatusIndicator tone="ember" pulse label="Module in development" />
        }
      />

      <Container className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Planned capabilities"
          title="What this module will include"
        />

        <InfoCardGrid columns={3} className="mt-12">
          {features.map((feature, i) => (
            <InfoCard
              key={feature.title}
              index={String(i + 1).padStart(2, "0")}
              title={feature.title}
              description={feature.description}
              tags={feature.tags}
            />
          ))}
        </InfoCardGrid>

        <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mist">
          Planned features · Not yet available
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Button href="/" variant="secondary" size="lg">
            Return home
          </Button>
          {next ? (
            <Button href={next.href} size="lg" showArrow>
              {`Next: ${next.label}`}
            </Button>
          ) : null}
        </div>
      </Container>
    </PageContainer>
  );
}