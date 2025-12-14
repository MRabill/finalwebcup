'use client';

import { useState } from "react";
import Image from "next/image";
import DatingChatInterface from "@/components/dating-chat-interface";

interface ProfileData {
    id: string;
    alias: string;
    archetype: string;
    avatar_url: string;
    augmentation_level: string;
    primary_skill: string;
    risk_tolerance: number;
    created_at: string;
    love_mood: string;
    vibe: string;
    short_bio: string;
    looking_for: string;
    age_or_build_year: number;
}

export default function ProfilePageContent({ profile }: { profile: ProfileData }) {
    const [showChat, setShowChat] = useState(false);

    return (
        <>
            {/* Profile Page */}
            <div
                className="min-h-screen p-0 md:p-1 relative overflow-hidden font-sans"
                style={{
                    backgroundColor: "#0a0e27",
                    background: "linear-gradient(135deg, #0a0e27 0%, #1a0a2e 50%, #16213e 100%)"
                }}
            >
                {/* Background */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(45deg, #1b1d23 0, #1b1d23 2px, #0d0f14 2px, #0d0f14 6px)",
                        mixBlendMode: "screen",
                    }}
                />
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.07) 40px, rgba(255,255,255,0.07) 41px)",
                    }}
                />

                {/* Vertical name – ABSOLUTE so it does not affect layout / PDF flow */}
                <div className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 z-20">
                    <div
                        className="text-gray-300 font-black text-5xl xl:text-7xl uppercase leading-none"
                        style={{
                            fontFamily: "'Orbitron','Space Grotesk',sans-serif",
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                            transform: "rotate(180deg)",
                            letterSpacing: "-3px",
                        }}
                    >
                        {profile.alias.toUpperCase()}
                    </div>
                    <div className="mt-4 text-[9px] text-gray-500 font-mono uppercase tracking-[0.25em] rotate-180">
                        {profile.archetype} / {profile.primary_skill}
                    </div>
                </div>

                <div className="w-full relative z-10 md:pl-20">
                    {/* Top banner similar to reference */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <span
                                className="text-[10px] uppercase tracking-[0.35em] text-gray-400"
                                style={{ fontFamily: "'Orbitron','Space Grotesk',sans-serif" }}
                            >
                                Upcoming Character
                            </span>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <h1
                                className="text-5xl md:text-7xl lg:text-8xl font-black uppercase text-gray-200 leading-none text-center glitch"
                                data-glitch="ZENLESS ZONE ZERO"
                                style={{
                                    fontFamily: "'Orbitron','Space Grotesk',sans-serif",
                                    letterSpacing: "0.2em",
                                }}
                            >
                                ZENLESS<br />
                                ZONE ZERO
                            </h1>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-mono">
                                Render on CYBERSPACE
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-gradient-to-r from-cyan-400 to-magenta-500 text-black text-[10px] font-black uppercase tracking-[0.25em]">
                                    {profile.love_mood}
                                </div>
                                <div className="w-9 h-9 border-2 border-magenta-500 flex items-center justify-center text-magenta-400 text-lg font-black">
                                    ◆
                                </div>
                            </div>
                            <div className="text-[9px] text-gray-500 font-mono uppercase tracking-[0.25em] text-right">
                                <div>ID #{profile.id.slice(0, 8).toUpperCase()}</div>
                                <div>{profile.archetype} / {profile.augmentation_level}</div>
                            </div>
                        </div>
                    </div>

                    {/* Thin top stripe like poster */}
                    <div className="h-3 bg-gradient-to-r from-cyan-400 via-magenta-500 to-purple-600 mb-0" />
                    <div className="h-0.5 bg-gradient-to-r from-cyan-300 via-purple-400 to-transparent mb-2" />

                    {/* Main layout: image + right info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-1 relative">
                        {/* Image block framed with orange border */}
                        <div className="lg:col-span-1">
                            <div
                                className="relative border-[6px] bg-[#0f1729] overflow-visible"
                                style={{ borderColor: "#00ffff" }}
                            >
                                {/* slight top offset to mimic character going out of frame */}
                                <div className="relative h-[580px] md:h-[720px] bg-gradient-to-b from-[#1a0f2e] to-[#0a0e27] overflow-visible">
                                    <Image
                                        src="/Astra1.png"
                                        alt="Character Profile"
                                        fill
                                        className="object-contain object-bottom scale-[1.2] md:scale-[1.3]"
                                        style={{ transformOrigin: 'bottom center' }}
                                        priority
                                    />
                                </div>

                                {/* bottom stat strip */}
                                <div className="grid grid-cols-3 text-xs font-mono uppercase tracking-[0.25em]">
                                    <div className="border-t-[3px] border-r-[1px] border-cyan-400 bg-[#0f1729] px-3 py-3">
                                        <div className="text-cyan-400 mb-1">Rank</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-2xl font-black">S</span>
                                            <span className="px-2 py-0.5 bg-white text-black font-black text-[10px]">
                                                Prime
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-t-[3px] border-r-[1px] border-cyan-400 bg-[#0a0e27] px-3 py-3">
                                        <div className="text-purple-300 mb-1">Class</div>
                                        <div className="text-white text-[11px]">
                                            {profile.archetype}<br />
                                            {profile.augmentation_level}
                                        </div>
                                    </div>
                                    <div className="border-t-[3px] border-cyan-400 bg-[#140a24] px-3 py-3">
                                        <div className="text-purple-300 mb-1">Risk</div>
                                        <div className="text-magenta-400 text-xl font-black">{profile.risk_tolerance}/10</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column cards */}
                        <div className="space-y-2 relative z-0 pt-0">
                            <div
                                className="border-[4px]"
                                style={{
                                    borderColor: "#d946ef",
                                    background:
                                        "linear-gradient(135deg, rgba(217,70,239,0.1), rgba(10,14,39,0.95))",
                                }}
                            >
                                <div className="border-b-2 border-magenta-500 px-5 py-2">
                                    <div className="text-[10px] text-black bg-gradient-to-r from-cyan-400 to-magenta-500 inline-block px-2 py-1 font-black uppercase tracking-[0.25em] mb-2">
                                        {profile.archetype} - {profile.augmentation_level} Level
                                    </div>
                                    <h2
                                        className="text-white text-6xl font-black uppercase leading-none typing-text"
                                        style={{ fontFamily: "'Orbitron',sans-serif" }}
                                    >
                                        {profile.alias}
                                    </h2>
                                    <p className="mt-2 text-[14px] text-gray-300 leading-snug data-loading">
                                        {profile.short_bio}
                                    </p>
                                </div>
                                <div className="px-5 py-2 grid grid-cols-2 gap-2 text-[12px] font-mono uppercase tracking-[0.25em] text-gray-300">
                                    <div className="flex justify-between">
                                        <span>Status</span>
                                        <span className="text-lime-400 font-black ">Active</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Vibe</span>
                                        <span className="text-purple-300 font-black">{profile.vibe}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Skill</span>
                                        <span className="text-white font-black">{profile.primary_skill}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Risk Level</span>
                                        <span className="text-white font-black ">{profile.risk_tolerance}/10</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                                <div
                                    className="border-[3px] bg-[#0f1729] px-4 py-2"
                                    style={{ borderColor: "#00ffff" }}
                                >
                                    <div className="text-[10px] text-cyan-400 uppercase tracking-[0.25em] font-black mb-2">
                                        Archetype
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 text-lg font-black">
                                            ⚡
                                        </div>
                                        <div className="text-[12px] text-white font-black uppercase leading-tight">
                                            {profile.archetype}<br />
                                            {profile.augmentation_level}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="border-[3px] bg-[#0f1729] px-4 py-2"
                                    style={{ borderColor: "#d946ef" }}
                                >
                                    <div className="text-[10px] text-magenta-400 uppercase tracking-[0.25em] font-black mb-2">
                                        Looking For
                                    </div>
                                    <div className="text-[12px] text-white font-black uppercase leading-tight">
                                        {profile.looking_for}<br />
                                        {profile.love_mood} Energy
                                    </div>
                                </div>
                            </div>

                            <div
                                className="border-[3px] bg-[#140a24] px-4 py-2"
                                style={{ borderColor: "#a78bfa" }}
                            >
                                <div className="text-[10px] text-purple-400 uppercase tracking-[0.25em] font-black mb-2">
                                    System Status
                                </div>
                                <div className="space-y-1 text-[12px] font-mono text-gray-300">
                                    <div className="flex justify-between">
                                        <span>Age / Built</span>
                                        <span className="text-lime-400 font-black ">{profile.age_or_build_year}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Risk Tolerance</span>
                                        <span className="text-red-400 font-black glitch" data-glitch={profile.risk_tolerance.toString()}>{profile.risk_tolerance}/10</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Mood</span>
                                        <span className="text-cyan-400 font-black ">{profile.love_mood}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowChat(true)}
                                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-black py-4 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 uppercase tracking-wider text-sm"
                            >
                                💬 Open Chat with {profile.alias}
                            </button>
                        </div>
                    </div>

                    {/* Bottom content kept same as before or tweak as you like */}
                    {/* ... (you can keep your existing bio / quote / footer sections here) */}
                </div>
            </div>

            {/* Chat Modal Overlay */}
            {showChat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-2xl h-screen md:h-[90vh] bg-gradient-to-b from-[#0a0e27] via-[#1a0a2e] to-[#16213e] rounded-lg overflow-hidden border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
                        {/* Chat Interface */}
                        <DatingChatInterface
                            targetAlias={profile.alias}
                            targetAvatar={profile.avatar_url}
                            onClose={() => setShowChat(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
