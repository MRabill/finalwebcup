export const ONBOARDING_WEBHOOK_URL =
  "https://mrabeel.app.n8n.cloud/webhook/0c09ed69-3255-4b57-9a58-1b28c68e182d";

export const DEFAULT_AVATAR_URL =
  "https://fstopgvgzqymmvzerpbk.supabase.co/storage/v1/object/public/cyber/futuristic-person-listening-music-ultra-modern-headphones.jpg";

export type OnboardingPayload = {
  codename?: string;
  access_key?: string;
  neural_link?: string;
  sector?: string;
  origin?: string;
  avatar?: string;
  // enriched
  avatar_url?: string;
  created_at?: string;
  [k: string]: unknown;
};

export async function sendOnboardingToWebhook(payload: OnboardingPayload): Promise<void> {
  const body: OnboardingPayload = {
    ...payload,
    avatar_url: payload.avatar_url ?? DEFAULT_AVATAR_URL,
    created_at: payload.created_at ?? new Date().toISOString(),
  };

  const res = await fetch(ONBOARDING_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}
