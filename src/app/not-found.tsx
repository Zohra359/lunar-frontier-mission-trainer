import type { Metadata } from "next";
import { Container, PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";

export const metadata: Metadata = { title: "Signal lost" };

export default function NotFound() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Error 404"
        title="Signal lost"
        description="We could not find the page you were looking for. It may have moved, or it may never have existed."
        status={<StatusIndicator tone="danger" label="Route not found" />}
      />
      <Container className="py-16">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href="/" size="lg" showArrow>
            Return to base
          </Button>
          <Button href="/briefing" variant="secondary" size="lg">
            Mission Briefing
          </Button>
        </div>
      </Container>
    </PageContainer>
  );
}