"use client";

import * as React from "react";
import type { CyberToastShowInput, CyberToastType } from "./types";
import { CyberToaster } from "./CyberToaster";

export type CyberToastApiResult = {
  ok: boolean;
  message?: string;
};

export type CyberToastContextValue = {
  show: (message: string, type?: CyberToastType | "false") => void;
  showWithOptions: (input: CyberToastShowInput) => void;
  success: (message: string, opts?: Omit<CyberToastShowInput, "message" | "type">) => void;
  error: (message: string, opts?: Omit<CyberToastShowInput, "message" | "type">) => void;
  info: (message: string, opts?: Omit<CyberToastShowInput, "message" | "type">) => void;
  fromApi: (res: CyberToastApiResult, opts?: Omit<CyberToastShowInput, "message" | "type">) => void;
};

export const CyberToastContext = React.createContext<CyberToastContextValue | null>(null);

export function CyberToastProvider({
  children,
  defaultDurationMs = 5000,
  defaultTypingSpeedMs = 30,
  defaultSound = true,
}: {
  children: React.ReactNode;
  defaultDurationMs?: number;
  defaultTypingSpeedMs?: number;
  defaultSound?: boolean;
}) {
  const [items, setItems] = React.useState<
    Array<import("./types").CyberToastInstance>
  >([]);

  const timeoutsRef = React.useRef(new Map<string, number>());

  const clearToastTimeout = React.useCallback((id: string) => {
    const t = timeoutsRef.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const remove = React.useCallback(
    (id: string) => {
      clearToastTimeout(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    },
    [clearToastTimeout]
  );

  const dismiss = React.useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      );
      window.setTimeout(() => remove(id), 300);
    },
    [remove]
  );

  const playSound = React.useCallback(async (type: CyberToastType) => {
    try {
      const AnyWindow = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioCtx = AnyWindow.AudioContext ?? AnyWindow.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      // Best-effort resume (may still be blocked until user interaction)
      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => undefined);
      }

      const gain = ctx.createGain();
      gain.gain.value = 0.05;
      gain.connect(ctx.destination);

      const beep = (freq: number, startAt: number, dur: number) => {
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start(ctx.currentTime + startAt);
        osc.stop(ctx.currentTime + startAt + dur);
      };

      if (type === "success") {
        beep(880, 0, 0.07);
        beep(1320, 0.08, 0.06);
      } else if (type === "error") {
        beep(220, 0, 0.09);
        beep(180, 0.11, 0.09);
      } else {
        beep(440, 0, 0.07);
      }

      window.setTimeout(() => {
        ctx.close().catch(() => undefined);
      }, 400);
    } catch {
      // ignore
    }
  }, []);

  const showWithOptions = React.useCallback(
    (input: CyberToastShowInput) => {
      const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
      const rawType = input.type ?? "info";
      const type: CyberToastType = rawType === "false" ? "error" : rawType;

      const header =
        input.header ?? (type === "error" ? "[CRITICAL ERROR]" : "[SYSTEM MESSAGE]");

      const toast: import("./types").CyberToastInstance = {
        id,
        type,
        message: input.message,
        header,
        createdAt: Date.now(),
        durationMs: input.durationMs ?? defaultDurationMs,
        typingSpeedMs: input.typingSpeedMs ?? defaultTypingSpeedMs,
        sound: input.sound ?? defaultSound,
        visible: true,
      };

      setItems((prev) => [toast, ...prev].slice(0, 4));

      if (toast.sound) {
        // fire-and-forget
        void playSound(type);
      }

      const total = toast.durationMs + toast.message.length * toast.typingSpeedMs;
      const timeout = window.setTimeout(() => dismiss(id), total);
      timeoutsRef.current.set(id, timeout);
    },
    [defaultDurationMs, defaultSound, defaultTypingSpeedMs, dismiss, playSound]
  );

  const show = React.useCallback(
    (message: string, type: CyberToastType | "false" = "info") => {
      showWithOptions({ message, type });
    },
    [showWithOptions]
  );

  const api: CyberToastContextValue = React.useMemo(
    () => ({
      show,
      showWithOptions,
      success: (message, opts) => showWithOptions({ message, type: "success", ...opts }),
      error: (message, opts) => showWithOptions({ message, type: "error", ...opts }),
      info: (message, opts) => showWithOptions({ message, type: "info", ...opts }),
      fromApi: (res, opts) => {
        if (res.ok) {
          showWithOptions({ message: res.message ?? "OPERATION COMPLETE", type: "success", ...opts });
        } else {
          showWithOptions({ message: res.message ?? "OPERATION FAILED", type: "error", ...opts });
        }
      },
    }),
    [show, showWithOptions]
  );

  React.useEffect(() => {
    return () => {
      // cleanup any pending timers
      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <CyberToastContext.Provider value={api}>
      {children}
      <CyberToaster items={items} onDismiss={dismiss} />
    </CyberToastContext.Provider>
  );
}
