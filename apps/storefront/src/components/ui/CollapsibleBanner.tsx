"use client";

import React, { useCallback, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export const EASE = [0.23, 1, 0.32, 1] as const;
export const DISCLOSE = { type: "spring", stiffness: 190, damping: 30, mass: 1 } as const;
export const NUDGE = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;
export const INSTANT = { duration: 0 } as const;

export type BannerState = "open" | "folded" | "dismissed";

export type UseCollapsibleBannerOptions = {
  state?: BannerState;
  defaultState?: BannerState;
  onStateChange?: (state: BannerState) => void;
  onDismiss?: () => void;
};

export type UseCollapsibleBannerResult = {
  state: BannerState;
  open: boolean;
  folded: boolean;
  dismissed: boolean;
  fold: () => void;
  expand: () => void;
  toggle: () => void;
  dismiss: () => void;
  restore: () => void;
};

/**
 * Hook managing spring-animated collapsible disclosure state.
 */
export function useCollapsibleBanner({
  state: controlled,
  defaultState = "open",
  onStateChange,
  onDismiss,
}: UseCollapsibleBannerOptions = {}): UseCollapsibleBannerResult {
  const [uncontrolled, setUncontrolled] = useState<BannerState>(defaultState);
  const state = controlled ?? uncontrolled;

  const changed = useRef(onStateChange);
  changed.current = onStateChange;
  const closed = useRef(onDismiss);
  closed.current = onDismiss;

  const commit = useCallback((next: BannerState) => {
    setUncontrolled(next);
    changed.current?.(next);
  }, []);

  const fold = useCallback(() => commit("folded"), [commit]);
  const expand = useCallback(() => commit("open"), [commit]);
  const restore = useCallback(() => commit("open"), [commit]);

  const toggle = useCallback(
    () => commit(state === "open" ? "folded" : "open"),
    [commit, state],
  );

  const dismiss = useCallback(() => {
    commit("dismissed");
    closed.current?.();
  }, [commit]);

  return {
    state,
    open: state === "open",
    folded: state === "folded",
    dismissed: state === "dismissed",
    fold,
    expand,
    toggle,
    dismiss,
    restore,
  };
}

const NOTICE_GLYPH = (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <circle cx="128" cy="128" r="96" stroke="currentColor" strokeWidth="18" />
    <polyline
      points="120 120 128 120 128 176 136 176"
      stroke="currentColor"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="124" cy="84" r="12" fill="currentColor" />
  </svg>
);

const CARET_DOWN = (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <polyline
      points="208 96 128 176 48 96"
      stroke="currentColor"
      strokeWidth="20"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CLOSE = (
  <svg width="13" height="13" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <line
      x1="200"
      y1="56"
      x2="56"
      y2="200"
      stroke="currentColor"
      strokeWidth="20"
      strokeLinecap="round"
    />
    <line
      x1="200"
      y1="200"
      x2="56"
      y2="56"
      stroke="currentColor"
      strokeWidth="20"
      strokeLinecap="round"
    />
  </svg>
);

export type CollapsibleBannerProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;

  dismissible?: boolean;
  state?: BannerState;
  defaultState?: BannerState;
  onStateChange?: (state: BannerState) => void;
  onDismiss?: () => void;
  dismissLabel?: string;
  dismissedMessage?: string;
  className?: string;
};

/**
 * GLOROV Theme-Integrated CollapsibleBanner with Spring Disclosure Physics
 */
export function CollapsibleBanner({
  title,
  description,
  children,
  action,
  icon,
  dismissible = true,
  state: controlled,
  defaultState = "open",
  onStateChange,
  onDismiss,
  dismissLabel = "Dismiss notice",
  dismissedMessage = "Notice dismissed.",
  className = "",
}: CollapsibleBannerProps) {
  const reduced = useReducedMotion();
  const uid = useId();
  const bodyId = `${uid}-body`;
  const titleId = `${uid}-title`;

  const { state, open, dismissed, toggle, fold, dismiss } = useCollapsibleBanner({
    state: controlled,
    defaultState,
    onStateChange,
    onDismiss,
  });

  const hasBody = Boolean(description || children || action);

  const disclose = reduced
    ? INSTANT
    : {
        height: DISCLOSE,
        opacity: { duration: 0.16, ease: EASE, delay: open ? 0.04 : 0 },
        y: DISCLOSE,
      };

  return (
    <>
      <motion.div
        initial={false}
        animate={{ height: dismissed ? 0 : "auto", opacity: dismissed ? 0 : 1 }}
        transition={
          reduced
            ? INSTANT
            : { height: DISCLOSE, opacity: { duration: 0.16, ease: EASE } }
        }
        style={{ overflow: "hidden" }}
        className="rounded-xl"
      >
        <div
          role="region"
          aria-labelledby={titleId}
          className={`rounded-xl border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(27,67,50,0.05),0_4px_12px_-6px_rgba(27,67,50,0.08)] dark:border-white/[0.16] dark:bg-[#12241C] ${className}`}
        >
          <div className="flex items-center gap-2.5 p-3">
            {/* Themed Icon Glyph Container */}
            <span
              aria-hidden="true"
              className="grid size-[28px] shrink-0 place-items-center rounded-lg bg-[#E8F5E9] text-[#1B4332] shadow-[inset_0_1px_2px_rgba(27,67,50,0.08)] dark:bg-[#1B3629] dark:text-[#74C69D]"
            >
              {icon ?? NOTICE_GLYPH}
            </span>

            {hasBody ? (
              <button
                type="button"
                onClick={toggle}
                onKeyDown={(e) => {
                  if (e.key !== "Escape" || !open) return;
                  e.stopPropagation();
                  fold();
                }}
                aria-expanded={open}
                aria-controls={bodyId}
                className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#52B788]/50"
              >
                <span
                  id={titleId}
                  className="min-w-0 flex-1 truncate text-[13.5px] font-bold leading-5 text-[#111827] group-hover:text-[#1B4332] dark:text-stone-100"
                >
                  {title}
                </span>
                <motion.span
                  aria-hidden="true"
                  className="flex shrink-0 text-[#1B4332] group-hover:text-[#0A4C36] dark:text-[#74C69D]"
                  initial={false}
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={reduced ? INSTANT : NUDGE}
                >
                  {CARET_DOWN}
                </motion.span>
              </button>
            ) : (
              <span
                id={titleId}
                className="min-w-0 flex-1 truncate text-[13.5px] font-bold leading-5 text-[#111827] dark:text-stone-100"
              >
                {title}
              </span>
            )}

            {dismissible ? (
              <button
                type="button"
                onClick={dismiss}
                aria-label={dismissLabel}
                className="grid size-[28px] shrink-0 place-items-center rounded-lg text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-[#1B4332] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788]/50 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100 cursor-pointer"
              >
                {CLOSE}
              </button>
            ) : null}
          </div>

          {hasBody ? (
            <motion.div
              id={bodyId}
              inert={!open}
              initial={false}
              animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
              transition={disclose}
              style={{ overflow: "hidden" }}
            >
              <motion.div
                initial={false}
                animate={{ y: open ? 0 : -6 }}
                transition={reduced ? INSTANT : DISCLOSE}
                className="pb-3 pl-11 pr-3.5"
              >
                {description ? (
                  <p className="text-[12.5px] leading-relaxed text-[#4B5563] dark:text-stone-300">
                    {description}
                  </p>
                ) : null}

                {children}

                {action ? <div className="mt-2.5">{action}</div> : null}
              </motion.div>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "dismissed" ? dismissedMessage : ""}
      </span>
    </>
  );
}
