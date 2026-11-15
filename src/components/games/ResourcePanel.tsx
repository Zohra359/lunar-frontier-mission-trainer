
"use client";

import type { Resources, ResourceId } from "../../game/types";

import {
  RESOURCE_META,
  RESOURCE_ORDER,
} from "../../game/config";

import { resourceStatus } from "../../game/engine";

import { ProgressBar } from "../ui/ProgressBar";
import { StatusIndicator } from "../ui/StatusIndicator";

interface ResourcePanelProps {
  resources: Resources;
}

function safeResourceValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function formatValue(
  value: number,
  resourceId: ResourceId,
): string {
  const metadata = RESOURCE_META[resourceId];

  if (!Number.isFinite(value)) {
    return "Unavailable";
  }

  const formatted = value.toFixed(metadata.decimals);

  return metadata.unit === "%"
    ? `${formatted}${metadata.unit}`
    : `${formatted} ${metadata.unit}`;
}

export function ResourcePanel({
  resources,
}: ResourcePanelProps) {
  return (
    <section
      aria-labelledby="resource-panel-heading"
      className="rounded-2xl border border-white/10 bg-slate-950/70 p-5"
    >
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Mission systems
        </p>

        <h2
          id="resource-panel-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Resource status
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Monitor the supplies and systems keeping your crew alive.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {RESOURCE_ORDER.map((resourceId) => {
          const metadata = RESOURCE_META[resourceId];
          const rawValue = resources[resourceId];
          const validValue = Number.isFinite(rawValue);
          const value = safeResourceValue(rawValue);

          const status = validValue
            ? resourceStatus(resourceId, value)
            : "critical";

          const percentage =
            metadata.max > 0
              ? Math.min(
                  100,
                  Math.max(0, (value / metadata.max) * 100),
                )
              : 0;

          const tone =
            status === "critical"
              ? "danger"
              : status === "low"
                ? "ember"
                : "signal";

          const statusLabel =
            status === "critical"
              ? "Critical"
              : status === "low"
                ? "Low"
                : "Healthy";

          return (
            <article
              key={resourceId}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white">
                    {metadata.label}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {metadata.whyItMatters}
                  </p>
                </div>

                <StatusIndicator
                  label={statusLabel}
                  tone={tone}
                />
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-semibold tabular-nums text-white">
                  {validValue
                    ? formatValue(rawValue, resourceId)
                    : "Unavailable"}
                </span>

                <span className="text-xs text-slate-500">
                  {metadata.max} {metadata.unit}
                </span>
              </div>

              <ProgressBar
                label={`${metadata.label} level`}
                value={percentage}
                tone={tone}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}

