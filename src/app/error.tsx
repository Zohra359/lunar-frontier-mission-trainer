
"use client";

import { useEffect } from "react";
import { Container, PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="System fault"
        title="Something went wrong"
        description="An unexpected error interrupted this page. You can try again or return to the launch page."
        status={<StatusIndicator tone="danger" label="Fault detected" />}
      />
      <Container className="py-16">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <Button href="/" variant="secondary" size="lg">
            Return home
          </Button>
        </div>
      </Container>
    </PageContainer>
  );
}
