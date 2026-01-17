"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  className,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const focusableSelector = useMemo(
    () =>
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    []
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      const t = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(t);
    }

    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), 160);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();

      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;

        const nodes = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
          (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
        );
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }

        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!active || active === first || !root.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!active || active === last || !root.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, focusableSelector]);

  useEffect(() => {
    if (!open) {
      lastFocusedRef.current?.focus?.();
      return;
    }

    const root = dialogRef.current;
    if (!root) return;

    const t = window.setTimeout(() => {
      const first = root.querySelector<HTMLElement>(focusableSelector);
      (first ?? root).focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, focusableSelector]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950/80 p-5 text-white shadow-2xl backdrop-blur-xl outline-none",
          "transform transition-all duration-150",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div id={titleId} className="text-sm font-semibold text-white/90">
            {title}
          </div>
          <button
            type="button"
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            onClick={onClose}
          >
            Esc
          </button>
        </div>

        <div className="mt-4">{children}</div>

        {footer ? <div className="mt-5 flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
