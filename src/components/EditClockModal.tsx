"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";

export function EditClockModal({
  open,
  timezone,
  onClose,
  onSave,
}: {
  open: boolean;
  timezone: string;
  onClose: () => void;
  onSave: (timezone: string) => void;
}) {
  const [value, setValue] = useState(timezone);

  const label = useMemo(() => {
    if (value === "local") return "Local time";
    return value;
  }, [value]);

  return (
    <Modal
      open={open}
      title="Clock settings"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black"
            onClick={() => {
              onSave(value.trim() || "local");
              onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="grid gap-3">
        <div className="text-xs text-white/60">
          Set timezone using IANA format (e.g. <code className="text-white/80">Asia/Manila</code>,{" "}
          <code className="text-white/80">America/New_York</code>) or <code className="text-white/80">local</code>.
        </div>

        <label className="grid gap-1">
          <span className="text-[11px] text-white/60">Timezone</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            placeholder="local"
          />
        </label>

        <div className="text-[11px] text-white/50">Preview: {label}</div>
      </div>
    </Modal>
  );
}
