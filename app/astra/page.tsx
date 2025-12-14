"use client";

import { Orb } from "@/components/orb";
import AstraChat from "@/components/astra-chat";

export default function AstraPage() {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-slate-50">
            {/* Cyberpunk background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(34,211,238,0.12) 25%, rgba(34,211,238,0.12) 26%, transparent 27%, transparent 74%, rgba(34,211,238,0.12) 75%, rgba(34,211,238,0.12) 76%, transparent 77%, transparent),
                              linear-gradient(90deg, transparent 24%, rgba(236,72,153,0.12) 25%, rgba(236,72,153,0.12) 26%, transparent 27%, transparent 74%, rgba(236,72,153,0.12) 75%, rgba(236,72,153,0.12) 76%, transparent 77%, transparent)`,
                        backgroundSize: "48px 48px",
                    }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.18),_transparent_55%)]" />
            </div>

            {/* Optional page content placeholder */}
            <div className="relative z-0 flex h-full w-full items-center justify-center">
                <p className="font-sarpanch text-sm uppercase tracking-[0.25em] text-slate-600">
          // astra - λ interface idle
                </p>
            </div>

            <AstraChat position="bottom-right" />
        </div>
    );
}
