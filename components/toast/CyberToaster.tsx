"use client";

import * as React from "react";
import styles from "./cyber-toast.module.css";
import type { CyberToastInstance } from "./types";

export function CyberToaster({
  items,
  onDismiss,
}: {
  items: CyberToastInstance[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className={`${styles.container} ${styles.topRight}`} aria-live="polite">
      {items.map((t) => (
        <CyberToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function CyberToastItem({
  toast,
  onDismiss,
}: {
  toast: CyberToastInstance;
  onDismiss: (id: string) => void;
}) {
  const [typed, setTyped] = React.useState("");

  React.useEffect(() => {
    setTyped("");
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setTyped(toast.message.slice(0, i));
      if (i >= toast.message.length) window.clearInterval(interval);
    }, toast.typingSpeedMs);

    return () => window.clearInterval(interval);
  }, [toast.id, toast.message, toast.typingSpeedMs]);

  const className = [
    styles.toast,
    styles[toast.type],
    toast.visible ? styles.visible : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} onClick={() => onDismiss(toast.id)} role="status">
      <div className={styles.header}>{toast.header}</div>
      <div className={styles.textRow}>
        <span>{typed}</span>
        <span className={styles.cursor} />
      </div>
    </div>
  );
}
