"use client";

import * as React from "react";
import type { CyberToastContextValue } from "./CyberToastProvider";
import { CyberToastContext } from "./CyberToastProvider";

export function useCyberToast() {
  const ctx = React.useContext<CyberToastContextValue | null>(CyberToastContext);
  if (!ctx) throw new Error("useCyberToast must be used within CyberToastProvider");
  return ctx;
}
