"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Orb } from "@/components/orb";
import { Volume2, VolumeX, SendHorizontal, Trash2 } from "lucide-react";

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
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);
    const [voicePulse, setVoicePulse] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
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

    // Function to synthesize speech and play audio
    const playVoiceOutput = async (text: string) => {
        if (!isVoiceEnabled) return;

        try {
            setIsPlayingVoice(true);
            const response = await fetch(
                "https://mrabeel.app.n8n.cloud/webhook/f946994e-41a3-4e14-a2e2-93a1ef67bf37",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        textToSpeech: text,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`TTS error: ${response.statusText}`);
            }

            // Get the audio blob from the response
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Play the audio
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play().catch((error) => {
                    console.error("Error playing audio:", error);
                });
            }
        } catch (error) {
            console.error("Error synthesizing speech:", error);
        } finally {
            setIsPlayingVoice(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatOpen]);

    // Setup audio visualization when voice starts playing
    useEffect(() => {
        if (isPlayingVoice && audioRef.current) {
            try {
                // Initialize Web Audio API
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const analyser = audioContext.createAnalyser();

                // Create a source from the media element
                const source = audioContext.createMediaElementAudioSource(audioRef.current);

                source.connect(analyser);
                analyser.connect(audioContext.destination);
                analyser.fftSize = 256;

                audioContextRef.current = audioContext;
                analyserRef.current = analyser;

                // Animation loop for pulse based on audio frequency
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const animate = () => {
                    analyser.getByteFrequencyData(dataArray);

                    // Calculate average frequency
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

                    // Normalize to 0-1 range and add some easing
                    const pulse = Math.min(average / 255, 1);
                    setVoicePulse(pulse);

                    animationFrameRef.current = requestAnimationFrame(animate);
                };

                animate();
            } catch (error) {
                console.error("Error setting up audio visualization:", error);
                // Fallback: simple pulse animation without frequency analysis
                const simplePulse = () => {
                    const time = Date.now() % 1000;
                    const pulse = Math.sin(time / 200) * 0.5 + 0.5;
                    setVoicePulse(pulse);
                    animationFrameRef.current = requestAnimationFrame(simplePulse);
                };
                simplePulse();
            }
        } else {
            // Cleanup animation frame and reset pulse
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            setVoicePulse(0);

            // Close audio context if it exists
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlayingVoice]);

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

            // Play voice output if enabled
            if (isVoiceEnabled) {
                const cleanText = removeImageUrl(data.output || "");
                if (cleanText) {
                    await playVoiceOutput(cleanText);
                }
            }
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
        <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-slate-50" >
            {/* Cyberpunk background */}
            < div className="absolute inset-0" >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(34,211,238,0.12) 25%, rgba(34,211,238,0.12) 26%, transparent 27%, transparent 74%, rgba(34,211,238,0.12) 75%, rgba(34,211,238,0.12) 76%, transparent 77%, transparent),
                              linear-gradient(90deg, transparent 24%, rgba(236,72,153,0.12) 25%, rgba(236,72,153,0.12) 26%, transparent 27%, transparent 74%, rgba(236,72,153,0.12) 75%, rgba(236,72,153,0.12) 76%, transparent 77%, transparent)`,
                        backgroundSize: "48px 48px",
                    }
                    }
                />
                < div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.18),_transparent_55%)]" />
            </div>

            {/* Optional page content placeholder */}
            <div className="relative z-0 flex h-full w-full items-center justify-center" >
                <p className="font-sarpanch text-sm uppercase tracking-[0.25em] text-slate-600" >
        // astra - λ interface idle
                </p>
            </div>

            {/* Floating Orb trigger (bottom-right) */}
            <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="group fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/60 bg-slate-950/90 shadow-[0_0_35px_rgba(34,211,238,0.7)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-fuchsia-400 hover:shadow-[0_0_45px_rgba(236,72,153,0.8)]"
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
                        size={0.9}
                        animationSpeedBase={1.6}
                        animationSpeedHue={1}
                        hueRotation={210}
                        mainOrbHueAnimation={true}
                    />
                </div>
            </button>

            {/* Chat Modal */}
            {isChatOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        onClick={() => setIsChatOpen(false)}
                    />

                    {/* Modal card */}
                    <div className="relative z-50 flex h-[85vh] w-full max-w-5xl flex-col overflow-visible rounded-3xl border border-cyan-500/40 bg-slate-950/90 shadow-[0_0_80px_rgba(34,211,238,0.7)]">
                        {/* Orb centered on top */}
                        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2">
                            <div
                                className="relative h-28 w-28 transition-all duration-100"
                                style={{
                                    transform: isPlayingVoice
                                        ? `scale(${1 + voicePulse * 0.3})`
                                        : "scale(1)",
                                }}
                            >
                                <div
                                    className={`absolute inset-0 blur-3xl transition-all duration-100 ${isPlayingVoice
                                            ? "bg-cyan-400/60 opacity-100"
                                            : "bg-cyan-400/30 opacity-50"
                                        }`}
                                    style={{
                                        boxShadow: isPlayingVoice
                                            ? `0 0 ${30 + voicePulse * 50}px rgba(34, 211, 238, ${0.6 + voicePulse * 0.4
                                            })`
                                            : "0 0 30px rgba(34, 211, 238, 0.3)",
                                    }}
                                />
                                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-cyan-400/60 bg-slate-950/70 shadow-[0_0_45px_rgba(34,211,238,0.9)]">
                                    <Orb
                                        palette={{
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
                                        }}
                                        size={1.6}
                                        animationSpeedBase={1.5 + voicePulse * 2}
                                        animationSpeedHue={1}
                                        hueRotation={210}
                                        mainOrbHueAnimation
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Header */}
                        <header className="flex items-center justify-between border-b border-cyan-500/30 px-6 py-4 pt-8 md:px-8">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="font-orbitron text-xl font-semibold tracking-[0.25em] text-cyan-300">
                                        ASTRA - Λ
                                    </div>
                                    <p className="font-sarpanch text-sm uppercase tracking-[0.25em] text-slate-400">
                                        quantum cognition chat console
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-xs font-sarpanch uppercase tracking-[0.22em] text-lime-300">
                                    online
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsChatOpen(false)}
                                    className="rounded-full border border-fuchsia-500/60 bg-fuchsia-500/10 px-3 py-1 text-sm font-sarpanch uppercase tracking-[0.22em] text-fuchsia-200 hover:bg-fuchsia-500/20"
                                >
                                    close
                                </button>
                            </div>
                        </header>

                        {/* Chat body */}
                        <main className="flex-1 overflow-hidden px-4 py-4 md:px-6 md:py-6">
                            <div className="flex h-full flex-col gap-4">
                                {/* Conversation area – now takes more space visually */}
                                <div
                                    className="flex-1 overflow-y-auto rounded-2xl border border-cyan-500/20 bg-slate-950/80 px-4 py-4 md:px-5 md:py-5 shadow-inner shadow-cyan-500/15"
                                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                                >
                                    {messages.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                                            <p className="font-sarpanch text-base text-slate-500">
                  // NO TRANSMISSIONS YET
                                            </p>
                                            <p className="max-w-sm text-sm font-sarpanch uppercase tracking-[0.22em] text-cyan-500/70">
                                                type your first prompt below to link with the astra - λ mesh
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map((message) => {
                                                const imageUrl = extractImageUrl(message.text);
                                                const textWithoutImage = removeImageUrl(message.text);

                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`flex ${message.isUser ? "justify-end" : "justify-start"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`flex max-w-[85%] flex-col space-y-3 md:max-w-[70%] ${message.isUser ? "items-end" : "items-start"
                                                                }`}
                                                        >
                                                            {imageUrl && (
                                                                <div className="overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-900/70 shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt="AI response image"
                                                                        className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = "none";
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}

                                                            {textWithoutImage && (
                                                                <div
                                                                    className={`relative rounded-xl border px-4 py-3 text-base leading-relaxed shadow-[0_0_20px_rgba(15,23,42,0.9)] backdrop-blur-md ${message.isUser
                                                                            ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100"
                                                                            : "border-fuchsia-400/60 bg-fuchsia-500/10 text-fuchsia-100"
                                                                        }`}
                                                                >
                                                                    {!message.isUser && (
                                                                        <span className="mb-1 inline-block font-sarpanch text-xs uppercase tracking-[0.24em] text-fuchsia-200/80">
                                // astra - λ
                                                                        </span>
                                                                    )}

                                                                    <p
                                                                        className={
                                                                            !message.isUser
                                                                                ? "font-orbitron text-base"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        {textWithoutImage}
                                                                    </p>

                                                                    <div className="mt-2 flex items-center justify-end gap-2 text-xs font-sarpanch uppercase tracking-[0.18em] text-slate-400">
                                                                        <span className="h-[3px] w-8 bg-gradient-to-r from-transparent via-slate-500/70 to-transparent" />
                                                                        <span>
                                                                            {message.timestamp.toLocaleTimeString()}
                                                                        </span>
                                                                    </div>

                                                                    <div
                                                                        className={`pointer-events-none absolute inset-0 rounded-xl border border-transparent ${message.isUser
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

                                            {isLoading && (
                                                <div className="flex justify-start">
                                                    <div className="flex items-center gap-3 rounded-xl border border-fuchsia-400/60 bg-fuchsia-500/10 px-4 py-2 text-sm font-sarpanch uppercase tracking-[0.24em] text-fuchsia-100 shadow-[0_0_20px_rgba(236,72,153,0.45)]">
                                                        <span className="h-2 w-2 animate-ping rounded-full bg-fuchsia-300" />
                                                        <span>processing quantum stream</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Input area with icons on the right */}
                                <form onSubmit={handleSendPrompt} className="space-y-2">
                                    <div className="group rounded-2xl border border-cyan-500/40 bg-slate-950/80 px-3 py-2 shadow-[0_0_35px_rgba(34,211,238,0.4)] transition-all duration-300 focus-within:border-cyan-300 focus-within:shadow-[0_0_45px_rgba(34,211,238,0.7)]">
                                        <div className="flex items-center gap-2 px-1 pb-1 text-xs font-sarpanch uppercase tracking-[0.22em] text-slate-500">
                                            <span className="h-[3px] w-10 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-transparent" />
                                            <span>input channel</span>
                                        </div>

                                        <div className="flex items-center gap-2 px-1">
                                            <Input
                                                type="text"
                                                placeholder="Type a prompt to ping the ASTRA - Λ core..."
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                className="h-10 flex-1 border-0 bg-transparent text-base text-cyan-100 placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                disabled={isLoading}
                                            />

                                            {/* Icons on the right */}
                                            <div className="flex items-center gap-1">
                                                {/* Voice toggle */}
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                                    className={`h-9 w-9 border text-xs font-orbitron tracking-[0.2em] transition-all duration-300 ${isVoiceEnabled
                                                            ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/30"
                                                            : "border-slate-500/60 bg-transparent text-slate-400 hover:border-slate-400 hover:bg-slate-500/10"
                                                        }`}
                                                    title={isVoiceEnabled ? "Voice output enabled" : "Voice output disabled"}
                                                >
                                                    {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                                </Button>

                                                {/* Send */}
                                                <Button
                                                    type="submit"
                                                    size="icon"
                                                    disabled={!prompt.trim() || isLoading || isPlayingVoice}
                                                    className="h-9 w-9 font-orbitron bg-cyan-400 text-xs font-semibold tracking-[0.28em] text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                                                    title="Transmit"
                                                >
                                                    <SendHorizontal className="h-4 w-4" />
                                                </Button>

                                                {/* Clear / purge log */}
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    onClick={() => {
                                                        setMessages([]);
                                                        setPrompt("");
                                                    }}
                                                    className="h-9 w-9 border border-fuchsia-500/60 bg-transparent text-xs font-orbitron tracking-[0.2em] text-fuchsia-300 hover:border-fuchsia-400 hover:bg-fuchsia-500/10"
                                                    title="Purge log"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 text-xs font-sarpanch uppercase tracking-[0.22em] text-slate-500">
                                        <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                                        <span>linked to astra - λ mesh // route: mrabeel.n8n.cloud</span>
                                    </div>
                                </form>

                                {/* Hidden audio element for voice output */}
                                <audio
                                    ref={audioRef}
                                    onEnded={() => setIsPlayingVoice(false)}
                                    style={{ display: "none" }}
                                />
                            </div>
                        </main>
                    </div>
                </div>
            )}


        </div>
    );
}
