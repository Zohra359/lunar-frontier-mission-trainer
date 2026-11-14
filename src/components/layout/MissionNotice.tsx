"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusIndicator";
import { NAV_ITEMS, STATUS_META } from "@/config/navigation";

interface MissionNoticeContextValue {
  open: () => void;
  close: () => void;
}

const MissionNoticeContext = createContext<MissionNoticeContextValue | null>(
  null,
);

export function useMissionNotice(): MissionNoticeContextValue {
  const context = useContext(MissionNoticeContext);
  if (!context) {
    throw new Error(
      "useMissionNotice must be used inside <MissionNoticeProvider>.",
    );
  }
  return context;
}

/**
 * Provides the "simulator not yet online" dialog to the whole app, so a Begin
 * button on any page can open it without owning any dialog state.
 */
export function MissionNoticeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <MissionNoticeContext.Provider value={value}>
      {children}
      <Modal
        open={isOpen}
        onClose={close}
        eyebrow="Mission Control Notice"
        title="The simulator is not yet online"
        footer={
          <>
            <Button href="/#mission" onClick={close}>
              View objectives
            </Button>
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
          </>
        }
      >
        <p>
          Lunar Frontier is being built module by module. The landing page and
          navigation are ready. Mission gameplay will unlock in a future build.
        </p>
        <ul className="mt-6 divide-y divide-white/5 border-y border-white/5">
          {NAV_ITEMS.map((item) => {
            const meta = STATUS_META[item.status];
            return (
              <li
                key={item.href}
                className="flex items-center justify-between py-3"
              >
                <span className="text-slate-200">{item.label}</span>
                <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
              </li>
            );
          })}
        </ul>
      </Modal>
    </MissionNoticeContext.Provider>
  );
}