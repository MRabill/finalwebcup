export type CyberToastType = "success" | "error" | "info";

export type CyberToastShowInput = {
  message: string;
  /** accepts 'false' as alias for 'error' */
  type?: CyberToastType | "false";
  /** base duration before dismiss (typing time is added on top) */
  durationMs?: number;
  /** ms per character */
  typingSpeedMs?: number;
  /** enable sound (best-effort; may be blocked until user interaction) */
  sound?: boolean;
  /** override header line */
  header?: string;
};

export type CyberToastInstance = {
  id: string;
  type: CyberToastType;
  message: string;
  header: string;
  createdAt: number;
  durationMs: number;
  typingSpeedMs: number;
  sound: boolean;
  visible: boolean;
};
