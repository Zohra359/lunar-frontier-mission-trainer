"use client";

import { Button } from "@/components/ui/Button";
import type { ButtonProps } from "@/components/ui/Button";
import { MISSION_START_HREF } from "@/config/navigation";
import { useMissionNotice } from "./MissionNotice";

type BeginMissionButtonProps = Omit<
  ButtonProps,
  "href" | "onClick" | "children"
> & {
  label?: string;
  /** Extra callback, e.g. to close a menu before the notice opens. */
  onBegin?: () => void;
};

/**
 * Single entry point for starting a mission. Until MISSION_START_HREF is set
 * it opens the honest "not yet online" notice; afterwards it is a real link.
 */
export function BeginMissionButton({
  label = "BEGIN YOUR MISSION",
  onBegin,
  ...buttonProps
}: BeginMissionButtonProps) {
  const { open } = useMissionNotice();

  if (MISSION_START_HREF) {
    return (
      <Button {...buttonProps} href={MISSION_START_HREF} onClick={onBegin}>
        {label}
      </Button>
    );
  }

  return (
    <Button
      {...buttonProps}
      onClick={() => {
        onBegin?.();
        open();
      }}
    >
      {label}
    </Button>
  );
}