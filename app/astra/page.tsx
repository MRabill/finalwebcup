"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Orb } from "@/components/orb";

interface Message {
    id: string;
    text: string;
    timestamp: Date;
    isUser: boolean;
}

const WEBHOOK_URL =
    "https://mrabeel.app.n8n.cloud/webhook/e9f233e4-ddff-4b07-a6ee-3b2f1763dca4";

// Utility function to extract image URLs from text
const extractImageUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg))/gi;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
};

// Utility function to remove image URL from text
const removeImageUrl = (text: string): string => {
    const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg))/gi;
    return text.replace(urlRegex, "").trim();
};

export default function AstraPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatSessionUUID, setChatSessionUUID] = useState<string>("");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sessionUUID = `${Math.random()
            .toString(36)
            .substring(2, 11)}-${Date.now()}`;
        setChatSessionUUID(sessionUUID);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatOpen]);

    const handleSendPrompt = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!prompt.trim() || !chatSessionUUID) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: prompt,
            timestamp: new Date(),
            isUser: true,
        };

        setMessages((prev) => [...prev, userMessage]);
        setPrompt("");
        setIsLoading(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: prompt,
                    chatSessionUUIS: chatSessionUUID,
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text:
                    data.output || "// ASTRA-Λ SYSTEM: Signal lost. Please try again.",
                timestamp: new Date(),
                isUser: false,
            };

            setMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error sending message:", error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: `// ASTRA-Λ SYSTEM ERROR: Failed to process request. ${error instanceof Error ? error.message : "Unknown error"
                    }`,
                timestamp: new Date(),
                isUser: false,
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className= "relative h-screen w-full overflow-hidden bg-slate-950 text-slate-50" >
        {/* Cyberpunk background */ }
        < div className = "absolute inset-0" >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
                <div
          className="absolute inset-0 opacity-10"
    style = {{
        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(34,211,238,0.12) 25%, rgba(34,211,238,0.12) 26%, transparent 27%, transparent 74%, rgba(34,211,238,0.12) 75%, rgba(34,211,238,0.12) 76%, transparent 77%, transparent),
                              linear-gradient(90deg, transparent 24%, rgba(236,72,153,0.12) 25%, rgba(236,72,153,0.12) 26%, transparent 27%, transparent 74%, rgba(236,72,153,0.12) 75%, rgba(236,72,153,0.12) 76%, transparent 77%, transparent)`,
            backgroundSize: "48px 48px",
          }
}
        />
    < div className = "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.18),_transparent_55%)]" />
        </div>

{/* Optional page content placeholder */ }
<div className="relative z-0 flex h-full w-full items-center justify-center" >
    <p className="font-sarpanch text-sm uppercase tracking-[0.25em] text-slate-600" >
        // astra - λ interface idle
        </p>
        </div>

{/* Floating Orb trigger (bottom-right) */ }
<button
        type="button"
onClick = {() => setIsChatOpen(true)}
className = "group fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/60 bg-slate-950/90 shadow-[0_0_35px_rgba(34,211,238,0.7)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-fuchsia-400 hover:shadow-[0_0_45px_rgba(236,72,153,0.8)]"
    >
    <div className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,_rgba(34,211,238,0.2),_rgba(236,72,153,0.2),_rgba(129,140,248,0.25),_rgba(34,211,238,0.2))] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex items-center justify-center" >
            <Orb
            palette={
    {
        mainBgStart: "rgb(34, 211, 238)",
            mainBgEnd: "rgb(129, 140, 248)",
                shadowColor1: "rgba(34, 211, 238, 0)",
                    shadowColor2: "rgba(34, 211, 238, 0.5)",
                        shadowColor3: "rgba(244, 244, 245, 0.9)",
                            shadowColor4: "rgb(59, 130, 246)",
                                shapeAStart: "rgb(45, 212, 191)",
                                    shapeAEnd: "rgba(15, 23, 42, 0)",
                                        shapeBStart: "rgb(224, 242, 254)",
                                            shapeBMiddle: "rgb(56, 189, 248)",
                                                shapeBEnd: "rgba(15, 23, 42, 0)",
                                                    shapeCStart: "rgba(226, 232, 240, 0)",
                                                        shapeCMiddle: "rgba(56, 189, 248, 0)",
                                                            shapeCEnd: "#22d3ee",
                                                                shapeDStart: "rgba(103, 232, 249, 0)",
                                                                    shapeDMiddle: "rgba(56, 189, 248, 0)",
                                                                        shapeDEnd: "#6366f1",
            }
}
size = { 0.9}
animationSpeedBase = { 1.6}
animationSpeedHue = { 1}
hueRotation = { 210}
mainOrbHueAnimation = { true}
    />
    </div>
    </button>

{/* Chat Modal */ }
{
    isChatOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" >
            {/* Backdrop */ }
            < div
    className = "absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
    onClick = {() => setIsChatOpen(false)
}
          />

{/* Modal card */ }
<div className="relative z-50 flex h-[80vh] w-full max-w-5xl flex-col overflow-visible rounded-3xl border border-cyan-500/40 bg-slate-950/90 shadow-[0_0_80px_rgba(34,211,238,0.7)]" >
    {/* Orb centered on top */ }
    < div className = "pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2" >
        <div className="relative h-28 w-28" >
            <div className="absolute inset-0 blur-2xl bg-cyan-400/30" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-cyan-400/60 bg-slate-950/70 shadow-[0_0_45px_rgba(34,211,238,0.9)]" >
                    <Orb
                    palette={
    {
        mainBgStart: "rgb(34, 211, 238)",
            mainBgEnd: "rgb(129, 140, 248)",
                shadowColor1: "rgba(34, 211, 238, 0)",
                    shadowColor2: "rgba(34, 211, 238, 0.6)",
                        shadowColor3: "rgba(244, 244, 245, 0.9)",
                            shadowColor4: "rgb(59, 130, 246)",
                                shapeAStart: "rgb(45, 212, 191)",
                                    shapeAEnd: "rgba(15, 23, 42, 0)",
                                        shapeBStart: "rgb(224, 242, 254)",
                                            shapeBMiddle: "rgb(56, 189, 248)",
                                                shapeBEnd: "rgba(15, 23, 42, 0)",
                                                    shapeCStart: "rgba(226, 232, 240, 0)",
                                                        shapeCMiddle: "rgba(56, 189, 248, 0)",
                                                            shapeCEnd: "#22d3ee",
                                                                shapeDStart: "rgba(103, 232, 249, 0)",
                                                                    shapeDMiddle: "rgba(56, 189, 248, 0)",
                                                                        shapeDEnd: "#6366f1",
                    }
}
size = { 1.6}
animationSpeedBase = { 1.5}
animationSpeedHue = { 1}
hueRotation = { 210}
mainOrbHueAnimation = { true}
    />
    </div>
    </div>
    </div>

{/* Header */ }
<header className="flex items-center justify-between border-b border-cyan-500/30 px-6 py-4 pt-8 md:px-8" >
    <div className="flex items-center gap-3" >
        <div>
        <div className="font-orbitron text-xl font-semibold tracking-[0.25em] text-cyan-300" >
            ASTRA - Λ
            </div>
            < p className = "font-sarpanch text-sm uppercase tracking-[0.25em] text-slate-400" >
                quantum cognition chat console
                    </p>
                    </div>
                    </div>

                    < div className = "flex items-center gap-3" >
                        <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-xs font-sarpanch uppercase tracking-[0.22em] text-lime-300" >
                            online
                            </span>
                            < button
type = "button"
onClick = {() => setIsChatOpen(false)}
className = "rounded-full border border-fuchsia-500/60 bg-fuchsia-500/10 px-3 py-1 text-sm font-sarpanch uppercase tracking-[0.22em] text-fuchsia-200 hover:bg-fuchsia-500/20"
    >
    close
    </button>
    </div>
    </header>

{/* Chat body */ }
<main className="flex-1 overflow-hidden px-4 py-4 md:px-6 md:py-6" >
    <div className="flex h-full flex-col gap-4" >
        <div
                  className="flex-1 overflow-y-auto rounded-2xl border border-cyan-500/20 bg-slate-950/80 px-4 py-4 md:px-5 md:py-5 shadow-inner shadow-cyan-500/15"
style = {{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
    {
        messages.length === 0 ? (
            <div className= "flex h-full flex-col items-center justify-center gap-4 text-center" >
            <p className="font-sarpanch text-base text-slate-500">
                // NO TRANSMISSIONS YET
                </p>
                < p className="max-w-sm text-sm font-sarpanch uppercase tracking-[0.22em] text-cyan-500/70" >
                type your first prompt below to link with the astra - λ
mesh
    </p>
    </div>
                  ) : (
    <div className= "space-y-4" >
    {
        messages.map((message) => {
            const imageUrl = extractImageUrl(message.text);
            const textWithoutImage = removeImageUrl(message.text);

            return (
                <div
                            key= { message.id }
            className = {`flex ${message.isUser ? "justify-end" : "justify-start"
                }`
        }
                          >
            <div
                              className={`flex max-w-[85%] flex-col space-y-3 md:max-w-[70%] ${message.isUser ? "items-end" : "items-start"
            }`}
    >
    { imageUrl && (
        <div className="overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-900/70 shadow-[0_0_25px_rgba(34,211,238,0.5)]" >
            <img
                                    src={ imageUrl }
alt = "AI response image"
className = "h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
onError = {(e) => {
    e.currentTarget.style.display = "none";
}}
                                  />
    </div>
                              )}

{
    textWithoutImage && (
        <div
                                  className={
        `relative rounded-xl border px-4 py-3 text-base leading-relaxed shadow-[0_0_20px_rgba(15,23,42,0.9)] backdrop-blur-md ${message.isUser
            ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100"
            : "border-fuchsia-400/60 bg-fuchsia-500/10 text-fuchsia-100"
        }`
    }
                                >
        {!message.isUser && (
            <span className="mb-1 inline-block font-sarpanch text-xs uppercase tracking-[0.24em] text-fuchsia-200/80" >
                // astra - λ
                </span>
                                  )
}

<p
                                    className={
    !message.isUser
        ? "font-orbitron text-base"
        : ""
}
                                  >
    { textWithoutImage }
    </p>

    < div className = "mt-2 flex items-center justify-end gap-2 text-xs font-sarpanch uppercase tracking-[0.18em] text-slate-400" >
        <span className="h-[3px] w-8 bg-gradient-to-r from-transparent via-slate-500/70 to-transparent" />
            <span>
            { message.timestamp.toLocaleTimeString() }
            </span>
            </div>

            < div
className = {`pointer-events-none absolute inset-0 rounded-xl border border-transparent ${message.isUser
        ? "shadow-[0_0_25px_rgba(34,211,238,0.65)]"
        : "shadow-[0_0_25px_rgba(236,72,153,0.65)]"
    } opacity-30`}
                                  />
    </div>
                              )}
</div>
    </div>
                        );
                      })}

{
    isLoading && (
        <div className="flex justify-start" >
            <div className="flex items-center gap-3 rounded-xl border border-fuchsia-400/60 bg-fuchsia-500/10 px-4 py-2 text-sm font-sarpanch uppercase tracking-[0.24em] text-fuchsia-100 shadow-[0_0_20px_rgba(236,72,153,0.45)]" >
                <span className="h-2 w-2 animate-ping rounded-full bg-fuchsia-300" />
                    <span>processing quantum stream </span>
                        </div>
                        </div>
                      )
}

<div ref={ messagesEndRef } />
    </div>
                  )}
</div>

{/* Input area */ }
<form onSubmit={ handleSendPrompt } className = "space-y-3" >
    <div className="group rounded-2xl border border-cyan-500/40 bg-slate-950/80 px-3 py-2 shadow-[0_0_35px_rgba(34,211,238,0.4)] transition-all duration-300 focus-within:border-cyan-300 focus-within:shadow-[0_0_45px_rgba(34,211,238,0.7)]" >
        <div className="flex items-center gap-2 px-1 pb-1 text-xs font-sarpanch uppercase tracking-[0.22em] text-slate-500" >
            <span className="h-[3px] w-10 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-transparent" />
                <span>input channel </span>
                    </div>
                    < Input
type = "text"
placeholder = "Type a prompt to ping the ASTRA - Λ core..."
value = { prompt }
onChange = {(e) => setPrompt(e.target.value)}
className = "h-10 border-0 bg-transparent text-sm text-cyan-100 placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0"
disabled = { isLoading }
    />
    </div>

    < div className = "flex flex-wrap items-center justify-between gap-3" >
        <div className="flex gap-3" >
            <Button
                        type="submit"
disabled = {!prompt.trim() || isLoading}
className = "font-orbitron bg-cyan-400 px-8 py-2 text-xs font-semibold tracking-[0.32em] text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
    TRANSMIT
    </Button>
    < Button
type = "button"
onClick = {() => {
    setMessages([]);
    setPrompt("");
}}
variant = "outline"
className = "border-fuchsia-500/60 bg-transparent px-6 py-2 text-xs font-orbitron tracking-[0.28em] text-fuchsia-300 hover:border-fuchsia-400 hover:bg-fuchsia-500/10"
    >
    PURGE LOG
        </Button>
        </div>

        < div className = "flex items-center gap-2 text-[10px] font-sarpanch uppercase tracking-[0.22em] text-slate-500" >
            <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                <span>
                linked to astra - λ mesh // route: mrabeel.n8n.cloud
                    </span>
                    </div>
                    </div>
                    </form>
                    </div>
                    </main>
                    </div>
                    </div>
      )}
</div>
  );
}
