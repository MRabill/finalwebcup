'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, AlertTriangle, X, Power } from "lucide-react";
import DatingChatInterface from "@/components/dating-chat-interface";
import { Orb } from "@/components/orb";
import AstraChat from "@/components/astra-chat";
import { supabase } from "@/lib/supabase";
import { LanguageProvider, useLanguage } from "@/components/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

export default function ProfilePageContent({
    profile,
}: {
    profile: ProfileData;
}) {
    const [showChat, setShowChat] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        if (supabase) {
            await supabase.auth.signOut();
        }
        // Simulate a system shutdown effect delay if desired, or just redirect
        setTimeout(() => {
            router.push("/");
        }, 800);
    };

    return (
        <>
            {/* Logout Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md p-1">
                        {/* Cyber Border */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-50 blur-sm" />
                        <div className="relative bg-[#0a0a10] border border-red-500/50 p-8 shadow-[0_0_50px_rgba(220,38,38,0.3)] clip-path-polygon">
                            {/* Decorative Corners */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500" />

                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center animate-pulse">
                                    <Power className="w-8 h-8 text-red-500" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-red-500 tracking-widest font-orbitron mb-2 uppercase glitch" data-glitch={t("terminateLink")}>
                                        {t("terminateLink")}
                                    </h3>
                                    <p className="text-red-200/60 font-mono text-xs whitespace-pre-line">
                                        {t("terminateWarning")}
                                    </p>
                                </div>

                                <div className="flex w-full gap-4 pt-4">
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 py-3 border border-red-500/30 text-red-400 font-mono text-xs hover:bg-red-500/10 transition-all uppercase tracking-widest"
                                    >
                                        {t("cancel")}
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="flex-1 py-3 bg-red-600 text-black font-black font-orbitron tracking-widest hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] transition-all uppercase flex items-center justify-center gap-2"
                                    >
                                        {isLoggingOut ? (
                                            <span className="animate-pulse">{t("aborting")}</span>
                                        ) : (
                                            <>
                                                <span>{t("confirm")}</span>
                                                <AlertTriangle className="w-3 h-3" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <LanguageSwitcher />

            {/* Logout Trigger Button */}
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className="fixed top-6 right-6 z-50 group flex items-center gap-2 px-4 py-2 bg-black/60 border border-red-500/30 backdrop-blur-md hover:border-red-500 hover:bg-red-950/30 transition-all duration-300"
            >
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-red-500/70 font-mono tracking-widest group-hover:text-red-400">{t("system")}</span>
                    <span className="text-xs text-red-500 font-bold font-orbitron tracking-wider group-hover:text-red-300">{t("logout")}</span>
                </div>
                <div className="w-8 h-8 rounded border border-red-500/50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-black transition-all text-red-500">
                    <LogOut className="w-4 h-4" />
                </div>
            </button>

            {/* Profile Page */}
            <div
                className="min-h-screen w-full flex items-center justify-center p-0 md:p-1 relative overflow-hidden font-sans bg-[#0a0e27]"
                style={{
                    background: "linear-gradient(135deg, #0a0e27 0%, #1a0a2e 50%, #16213e 100%)",
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

                {/* Left Side Decoration - INTENSE */}
                <div className="absolute top-0 left-0 bottom-0 w-1/3 pointer-events-none hidden xl:flex flex-col justify-between overflow-hidden z-0">
                    {/* Huge Vertical Text Background */}
                    <div className="absolute top-0 left-0 h-full flex items-center -ml-4 select-none opacity-20 mix-blend-screen">
                        <span className="text-[18vh] font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-cyan-900 to-transparent tracking-tighter" style={{ writingMode: 'vertical-rl', fontFamily: 'Orbitron, sans-serif' }}>
                            {profile.alias.length < 10 ? profile.alias.toUpperCase() : "CYBERNETICS"}
                        </span>
                    </div>

                    {/* Top Info Block */}
                    <div className="mt-32 ml-12 space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                            <span className="text-cyan-400 font-mono text-lg font-bold tracking-[0.2em] glitch" data-glitch={`ID: ${profile.id.slice(0, 8)}`}>ID: {profile.id.slice(0, 8)}</span>
                        </div>
                        <div className="h-1.5 w-48 bg-cyan-900/30 overflow-hidden border border-cyan-500/30">
                            <div className="h-full w-full bg-cyan-400 origin-left animate-[scale-x_2s_ease-in-out_infinite]" />
                        </div>
                        <div className="text-xs text-cyan-600 font-mono leading-relaxed pl-2 border-l-2 border-cyan-500/50">
                            {t("targetAcquired")} // <span className="text-cyan-300">{t("locked")}</span><br />
                            {t("encryptionLevel")}: {profile.augmentation_level.toUpperCase()}
                        </div>
                    </div>

                    {/* Middle Decorative Kanji */}
                    <div className="absolute top-1/2 left-16 -translate-y-1/2 opacity-60 mix-blend-plus-lighter">
                        <div className="text-7xl font-black text-cyan-500/10 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" style={{ writingMode: 'vertical-rl', textShadow: '2px 2px 0px rgba(0,255,255,0.2)' }}>
                            接続確立
                        </div>
                    </div>

                    {/* Bottom Data Stream */}
                    <div className="mb-24 ml-12 relative z-10">
                        <div className="bg-black/40 backdrop-blur-sm p-4 border border-cyan-500/20 border-l-4 border-l-cyan-500">
                            <div className="text-cyan-500 font-bold text-xs mb-2 tracking-widest">{t("dataStreamIncoming")}</div>
                            <div className="space-y-1 font-mono text-[10px] text-cyan-400/60">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="truncate w-48">
                                        {`> 0x${Math.random().toString(16).slice(2, 8).toUpperCase()}_PKT_${i} [OK]`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Decoration - INTENSE */}
                <div className="absolute top-0 right-0 bottom-0 w-1/3 pointer-events-none hidden xl:flex flex-col justify-between items-end overflow-hidden z-0">
                    {/* Huge Number Background */}
                    <div className="absolute top-20 right-[-20px] select-none mix-blend-overlay opacity-30">
                        <span className="text-[40vh] font-black text-pink-600 italic tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            {profile.risk_tolerance ? String(profile.risk_tolerance).padStart(2, '0') : "99"}
                        </span>
                    </div>

                    {/* Top Radar Element */}
                    <div className="mt-32 mr-12 relative w-64 h-64 border border-pink-500/20 rounded-full flex items-center justify-center bg-pink-900/5 backdrop-blur-sm">
                        <div className="absolute inset-0 border-2 border-pink-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-2 border border-dashed border-pink-500/40 rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="absolute inset-12 border border-pink-500/20 rounded-full" />

                        {/* Radar Sweep */}
                        <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-gradient-to-b from-pink-500 to-transparent origin-bottom animate-[spin_4s_linear_infinite] shadow-[0_0_15px_#ec4899]" />

                        {/* Blips */}
                        <div className="absolute top-10 right-10 w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                        <div className="absolute bottom-16 left-12 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse delay-700" />
                    </div>

                    {/* Middle Status Bars */}
                    <div className="mr-12 space-y-6 text-right relative z-10">
                        <div className="text-5xl font-black text-white/5 tracking-widest absolute -right-4 -top-12 select-none">STATUS</div>
                        <div className="flex flex-col items-end gap-2 bg-black/20 p-4 rounded border-r-2 border-pink-500/50 backdrop-blur-sm">
                            {['MEMORY', 'CPU_CORE', 'NET_LINK', 'PWR_CELL'].map((label, i) => (
                                <div key={label} className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-pink-400 font-bold tracking-wider">{label}</span>
                                    <div className="w-32 h-2 bg-pink-900/30 skew-x-[-12deg] overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-pink-600 to-pink-400 animate-pulse"
                                            style={{ width: `${Math.random() * 40 + 60}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Warning Block */}
                    <div className="mb-24 mr-12 flex items-end gap-6 relative z-10">
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-2 mb-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                <div className="text-red-500 font-black tracking-[0.2em] text-lg glitch" data-glitch="WARNING">WARNING</div>
                            </div>
                            <div className="text-[10px] text-pink-500/70 font-mono max-w-[200px] leading-relaxed border-t border-pink-500/30 pt-2">
                                {t("unauthorizedSignal")}
                            </div>
                        </div>
                        {/* Hazard Stripes */}
                        <div className="w-4 h-24 flex flex-col gap-1">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex-1 bg-red-500/40 skew-y-[-20deg]" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full relative z-10 max-w-6xl mx-auto">
                    {/* Top banner similar to reference */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <span
                                className="text-[10px] uppercase tracking-[0.35em] text-gray-400"
                                style={{ fontFamily: "'Orbitron','Space Grotesk',sans-serif" }}
                            >
                                {t("upcomingCharacter")}
                            </span>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <h1
                                className="text-5xl md:text-7xl lg:text-8xl font-black uppercase text-gray-200 leading-none text-center glitch"
                                data-glitch={`${t("zenless")} ${t("zoneZero")}`}
                                style={{
                                    fontFamily: "'Orbitron','Space Grotesk',sans-serif",
                                    letterSpacing: "0.2em",
                                }}
                            >
                                {t("zenless")}
                                <br />
                                {t("zoneZero")}
                            </h1>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-mono">
                                {t("renderOnCyberspace")}
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
                                <div>
                                    {profile.archetype} / {profile.augmentation_level}
                                </div>
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
                    src={
                      profile.alias === "ZeroTrace"
                        ? "/Astra2.png"
                        : profile.alias === "NeonWitch"
                        ? "/Astra3.png"
                        : "/Astra1.png"
                    }
                                        alt="Character Profile"
                                        fill
                                        className="object-contain object-bottom scale-[1.2] md:scale-[1.3]"
                    style={{ transformOrigin: "bottom center" }}
                                        priority
                                    />
                                </div>

                                {/* bottom stat strip */}
                                <div className="grid grid-cols-3 text-xs font-mono uppercase tracking-[0.25em]">
                                    <div className="border-t-[3px] border-r-[1px] border-cyan-400 bg-[#0f1729] px-3 py-3">
                                        <div className="text-cyan-400 mb-1">{t("rank")}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-2xl font-black">S</span>
                                            <span className="px-2 py-0.5 bg-white text-black font-black text-[10px]">
                                                {t("prime")}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-t-[3px] border-r-[1px] border-cyan-400 bg-[#0a0e27] px-3 py-3">
                                        <div className="text-purple-300 mb-1">{t("class")}</div>
                                        <div className="text-white text-[11px]">
                                            {profile.archetype}
                                            <br />
                                            {profile.augmentation_level}
                                        </div>
                                    </div>
                                    <div className="border-t-[3px] border-cyan-400 bg-[#140a24] px-3 py-3">
                                        <div className="text-purple-300 mb-1">{t("risk")}</div>
                                        <div className="text-magenta-400 text-xl font-black">
                                            {profile.risk_tolerance}/10
                                        </div>
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
                                        <span>{t("status")}</span>
                                        <span className="text-lime-400 font-black ">{t("active")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t("vibe")}</span>
                                        <span className="text-purple-300 font-black">
                                            {profile.vibe}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t("skill")}</span>
                                        <span className="text-white font-black">
                                            {profile.primary_skill}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t("riskLevel")}</span>
                                        <span className="text-white font-black ">
                                            {profile.risk_tolerance}/10
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                                <div
                                    className="border-[3px] bg-[#0f1729] px-4 py-2"
                                    style={{ borderColor: "#00ffff" }}
                                >
                                    <div className="text-[10px] text-cyan-400 uppercase tracking-[0.25em] font-black mb-2">
                                        {t("archetype")}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 text-lg font-black">
                                            ⚡
                                        </div>
                                        <div className="text-[12px] text-white font-black uppercase leading-tight">
                                            {profile.archetype}
                                            <br />
                                            {profile.augmentation_level}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="border-[3px] bg-[#0f1729] px-4 py-2"
                                    style={{ borderColor: "#d946ef" }}
                                >
                                    <div className="text-[10px] text-magenta-400 uppercase tracking-[0.25em] font-black mb-2">
                                        {t("lookingFor")}
                                    </div>
                                    <div className="text-[12px] text-white font-black uppercase leading-tight">
                                        {profile.looking_for}
                                        <br />
                                        {profile.love_mood} {t("energy")}
                                    </div>
                                </div>
                            </div>

                            <div
                                className="border-[3px] bg-[#140a24] px-4 py-2"
                                style={{ borderColor: "#a78bfa" }}
                            >
                                <div className="text-[10px] text-purple-400 uppercase tracking-[0.25em] font-black mb-2">
                                    {t("systemStatus")}
                                </div>
                                <div className="space-y-1 text-[12px] font-mono text-gray-300">
                                    <div className="flex justify-between">
                                        <span>{t("ageBuilt")}</span>
                                        <span className="text-lime-400 font-black ">
                                            {profile.age_or_build_year}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t("riskTolerance")}</span>
                                        <span
                                            className="text-red-400 font-black glitch"
                                            data-glitch={profile.risk_tolerance.toString()}
                                        >
                                            {profile.risk_tolerance}/10
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t("mood")}</span>
                                        <span className="text-cyan-400 font-black ">
                                            {profile.love_mood}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowChat(true)}
                                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-black py-4 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 uppercase tracking-wider text-sm"
                            >
                                💬 {t("openChat")} {profile.alias}
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

            {/* Floating Orb trigger (bottom-right) - Astra Chat */}
            <AstraChat position="bottom-right" />
        </>
    );
}
