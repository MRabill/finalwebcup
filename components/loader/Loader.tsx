"use client";

import React, { useEffect, useRef } from "react";
import { Orbitron } from "next/font/google";
import styles from "./Loader.module.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Loader({
  warningText = "CAUTION, DO NOT TURN OFF.",
}: {
  warningText?: string;
}) {
  const audioCleanupRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    // Autoplay policies may block this; we fail silently.
    try {
      const AudioContextCtor =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextCtor) return;

      const ctx: AudioContext = new AudioContextCtor();

      // Very low volume master gain
      const master = ctx.createGain();
      master.gain.value = 0.0;
      master.connect(ctx.destination);

      // Subtle “engine hum”
      const hum = ctx.createOscillator();
      hum.type = "triangle";
      hum.frequency.value = 55;

      const humGain = ctx.createGain();
      humGain.gain.value = 0.35;
      hum.connect(humGain).connect(master);
      hum.start();

      // Periodic “boot ticks”
      const tick = ctx.createOscillator();
      tick.type = "square";
      tick.frequency.value = 880;

      const tickGain = ctx.createGain();
      tickGain.gain.value = 0.0;
      tick.connect(tickGain).connect(master);
      tick.start();

      const pulse = () => {
        const t0 = ctx.currentTime;
        // quick click envelope
        tickGain.gain.cancelScheduledValues(t0);
        tickGain.gain.setValueAtTime(0.0, t0);
        tickGain.gain.linearRampToValueAtTime(0.9, t0 + 0.01);
        tickGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);
      };

      pulse();
      const interval = window.setInterval(pulse, 520);

      const rampIn = () => {
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(0.06, t + 0.18);
      };

      const tryResume = () => {
        // If already running, just ensure volume is up.
        if (ctx.state === "running") {
          rampIn();
          return;
        }
        ctx.resume()
          .then(() => {
            rampIn();
          })
          .catch(() => {
            // ignore
          });
      };

      // Try resume immediately, then keep nudging briefly.
      tryResume();
      const resumeInterval = window.setInterval(tryResume, 350);

      // Also resume on the first user interaction (covers strict autoplay policies).
      const onUserGesture = () => tryResume();
      window.addEventListener("pointerdown", onUserGesture, { passive: true });
      window.addEventListener("keydown", onUserGesture);
      window.addEventListener("touchstart", onUserGesture, { passive: true });

      audioCleanupRef.current = () => {
        window.clearInterval(interval);
        window.clearInterval(resumeInterval);
        window.removeEventListener("pointerdown", onUserGesture);
        window.removeEventListener("keydown", onUserGesture);
        window.removeEventListener("touchstart", onUserGesture);
        try {
          hum.stop();
          tick.stop();
        } catch {}
        try {
          hum.disconnect();
          tick.disconnect();
          humGain.disconnect();
          tickGain.disconnect();
          master.disconnect();
        } catch {}
        ctx.close().catch(() => {});
      };

      return () => {
        audioCleanupRef.current?.();
        audioCleanupRef.current = null;
      };
    } catch {
      // ignore
    }
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      aria-label="Loading"
      role="status"
    >
      <div className={`${styles.container} ${orbitron.className}`}>
        <div className={styles.loader}>
          <div className={styles.titleRow}>
            <p className={styles.loadingText}>LOADING</p>
            <div className={styles.therefore}>∴</div>
            <p className={styles.loadingNumber} />
            <p className={styles.loadingNumberSuffix}>%</p>
          </div>

          <div className={styles.barBorder}>
            <div className={styles.bar} />
          </div>

          <div className={styles.warning}>
            <span className={styles.exclamation}>!</span>
            <span>{warningText}</span>
            <div className={styles.lineCascades} />
          </div>
        </div>
      </div>
    </div>
  );
}

