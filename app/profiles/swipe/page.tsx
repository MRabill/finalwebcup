"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import matchResults from "../match-results.json";
import "@/app/profile/animations.css"; // Ensure animations are loaded

type Profile = (typeof matchResults.output)[number];

// --- Cyberpunk Match Overlay ---
function MatchOverlay({ profile }: { profile: Profile }) {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserAvatar(localStorage.getItem("user_avatar"));
    }
  }, []);

  // Generate random hearts
  const hearts = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 4,
    size: 20 + Math.random() * 40,
    color: Math.random() > 0.5 ? '#ec4899' : '#06b6d4', // Pink or Cyan
  })), []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 animate-in fade-in duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      
      {/* Floating Cyber Hearts */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {hearts.map((heart) => (
             <div
               key={heart.id}
               className="absolute bottom-[-10%] opacity-0"
               style={{
                 left: `${heart.left}%`,
                 animation: `float-up ${heart.duration}s linear infinite`,
                 animationDelay: `${heart.delay}s`,
                 color: "transparent",
                 WebkitTextStroke: `2px ${heart.color}`, // Cyberpunk outline style
                 fontSize: `${heart.size}px`,
                 filter: `drop-shadow(0 0 10px ${heart.color})`,
               }}
             >
               ♥
             </div>
        ))}
      </div>
      <style>{`
         @keyframes float-up {
           0% { transform: translateY(0) scale(0.5); opacity: 0; }
           10% { opacity: 1; }
           100% { transform: translateY(-110vh) scale(1.2); opacity: 0; }
         }
      `}</style>

      {/* Background Grid/Scanlines */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      <div className="absolute inset-0 data-loading opacity-20 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-4xl w-full px-4">
        
        {/* Header Text */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <h1 
              className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-500 glitch"
              data-glitch="IT'S A MATCH"
              style={{ filter: "drop-shadow(0 0 20px rgba(0,255,255,0.5))" }}
            >
              IT'S A MATCH
            </h1>
            <div className="absolute -inset-1 bg-cyan-500/20 blur-xl -z-10 animate-pulse" />
          </div>
          <div className="h-6 flex items-center justify-center">
             <p className="typing-text text-pink-400 font-mono text-sm md:text-base tracking-[0.3em] border-r-2 border-pink-500 pr-2">
               NEURAL SYNC ESTABLISHED // 100%
             </p>
          </div>
        </div>

        {/* Avatars */}
        <div className="flex items-center gap-8 md:gap-16">
          {/* User Placeholder */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)] overflow-hidden relative z-10 bg-black">
               {userAvatar ? (
                 <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-cyan-900 to-black flex items-center justify-center">
                   <span className="text-4xl">👤</span>
                 </div>
               )}
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-20" />
          </div>

          {/* Connection Line */}
          <div className="flex-1 h-[2px] bg-gradient-to-r from-cyan-500 to-pink-500 relative w-16 md:w-32">
             <div className="absolute top-1/2 left-0 w-3 h-3 bg-white rounded-full -translate-y-1/2 shadow-[0_0_10px_white] animate-[spin_1s_linear_infinite]" 
                  style={{ animationName: 'move-lr', animationDuration: '1s', animationIterationCount: 'infinite' }} />
             {/* Inline style for simple ping-pong movement if needed, or just static gradient */}
             <style>{`
               @keyframes move-lr {
                 0% { left: 0%; }
                 50% { left: 100%; }
                 100% { left: 0%; }
               }
             `}</style>
          </div>

          {/* Matched Profile */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.5)] overflow-hidden relative z-10 bg-black">
              <img 
                src={profile.avatar_url ?? ""} 
                alt={profile.alias}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-pink-400 animate-ping opacity-20 animation-delay-500" />
          </div>
        </div>

        {/* Action / Loading */}
        <div className="text-center space-y-2 mt-8">
           <p className="text-white/50 font-mono text-xs animate-pulse">
             INITIATING ENCRYPTED CHANNEL...
           </p>
           <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
             <div className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 w-full animate-[loading_4s_ease-in-out_forwards]" 
               style={{
                 animation: "fill-bar 3.5s linear forwards"
               }}
             />
             <style>{`
               @keyframes fill-bar {
                 from { width: 0%; }
                 to { width: 100%; }
               }
             `}</style>
           </div>
        </div>

      </div>
    </div>
  );
}

// --- Cyberpunk Card Component ---
const CyberCard = ({ profile }: { profile: Profile }) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black/80 border border-cyan-500/30">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${profile.avatar_url ?? ""})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,6px_100%]" />
      </div>

      {/* Cyber Frame */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="absolute top-0 left-0 w-8 h-[2px] bg-cyan-500" />
        <div className="absolute top-0 left-0 w-[2px] h-8 bg-cyan-500" />
        <div className="absolute top-0 right-0 w-8 h-[2px] bg-cyan-500" />
        <div className="absolute top-0 right-0 w-[2px] h-8 bg-cyan-500" />
        
        <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-pink-500" />
        <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-pink-500" />
        <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-pink-500" />
        <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-pink-500" />

        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-cyan-500/50" />
        <div className="absolute bottom-20 left-4 w-[1px] h-16 bg-white/20" />
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <div className="px-2 py-1 bg-black/60 border border-cyan-500/50 backdrop-blur-md flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-400 font-mono tracking-wider">ONLINE</span>
        </div>
        <div className="px-2 py-1 bg-black/60 border border-pink-500/50 backdrop-blur-md">
           <span className="text-[10px] text-pink-400 font-mono tracking-wider">{profile.match_score}% MATCH</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
        <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
          {profile.alias}
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-0.5 bg-cyan-900/30 border border-cyan-500/30 text-[10px] text-cyan-200 font-mono">
            RISK: {profile.risk_level}
          </span>
          <span className="px-2 py-0.5 bg-purple-900/30 border border-purple-500/30 text-[10px] text-purple-200 font-mono">
            CHEM: {profile.chemistry_index}
          </span>
          <span className="px-2 py-0.5 bg-pink-900/30 border border-pink-500/30 text-[10px] text-pink-200 font-mono">
            DRAMA: {profile.drama_potential}
          </span>
        </div>

        <p className="text-xs text-gray-300 font-mono leading-relaxed line-clamp-2 border-l-2 border-cyan-500 pl-3 mb-2">
          {profile.notes || "No additional data available."}
        </p>
        
        <div className="text-[10px] text-white/40 font-mono mt-2 tracking-widest uppercase">
          // DIPLOMATIC IMPACT: {profile.diplomatic_impact}
        </div>
      </div>
    </div>
  );
};

export default function SwipeProfiles() {
  const router = useRouter();
  const profiles = useMemo<Profile[]>(() => matchResults.output as Profile[], []);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const startXRef = useRef<number | null>(null);
  const whooshRef = useRef<HTMLAudioElement | null>(null);
  const whooshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const matchSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    whooshRef.current = new Audio("/sounds/Whoosh Sounds effects No copyright.mp3");
    whooshRef.current.volume = 0.5;

    matchSoundRef.current = new Audio("/sounds/Tinder notificacion sound effect.mp3");
    matchSoundRef.current.volume = 0.6;
  }, []);

  const playWhoosh = () => {
    if (whooshRef.current) {
        if (whooshTimeoutRef.current) {
            clearTimeout(whooshTimeoutRef.current);
        }

        whooshRef.current.currentTime = 0;
        whooshRef.current.play().catch(() => {});

        // Stop after 1 second
        whooshTimeoutRef.current = setTimeout(() => {
            if (whooshRef.current) {
                whooshRef.current.pause();
                whooshRef.current.currentTime = 0;
            }
        }, 1000);
    }
  };

  const playMatchSound = () => {
    if (matchSoundRef.current) {
        matchSoundRef.current.currentTime = 0;
        matchSoundRef.current.play().catch(() => {});
    }
  };

  const current = profiles[index];
  const next = profiles[index + 1];
  const third = profiles[index + 2];

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!current) return;
      
      if (direction === "right" && current.match) {
        // Play match sound
        playMatchSound();

        // Trigger Match Overlay
        setMatchedProfile(current);
        setShowMatchOverlay(true);
        
        // Auto-redirect after animation
        setTimeout(() => {
           router.push(`/profile/${current.candidate_id}`);
        }, 3500); 
        return;
      }

      playWhoosh();

      setIsDragging(false);
      setDragX(0);
      setIndex((prev) => Math.min(profiles.length, prev + 1));
    },
    [current, profiles.length, router]
  );

  const onPointerDown = useCallback((clientX: number) => {
    startXRef.current = clientX;
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((clientX: number) => {
    if (!isDragging || startXRef.current === null) return;
    setDragX(clientX - startXRef.current);
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    if (!isDragging) return;
    const threshold = 120;
    if (dragX > threshold) {
      handleSwipe("right");
    } else if (dragX < -threshold) {
      handleSwipe("left");
    } else {
      setDragX(0);
      setIsDragging(false);
    }
    startXRef.current = null;
  }, [dragX, isDragging]);

  const reset = () => setIndex(0);

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        backgroundImage: "url('/illustration-rain-futuristic-city.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/75 pointer-events-none" />
      
      {/* Ambient Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(500px) rotateX(60deg) translateY(200px) scale(2)",
        }}
      />

      {/* Left Side Decoration - INTENSE */}
      <div className="absolute top-0 left-0 bottom-0 w-1/3 pointer-events-none hidden md:flex flex-col justify-between overflow-hidden z-0">
        {/* Huge Vertical Text Background */}
        <div className="absolute top-0 left-0 h-full flex items-center -ml-4 select-none opacity-20 mix-blend-screen">
            <span className="text-[18vh] font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-cyan-900 to-transparent tracking-tighter" style={{ writingMode: 'vertical-rl', fontFamily: 'Orbitron, sans-serif' }}>
                CYBERNETICS
            </span>
        </div>

        {/* Top Info Block */}
        <div className="mt-32 ml-12 space-y-4 relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                <span className="text-cyan-400 font-mono text-lg font-bold tracking-[0.2em] glitch" data-glitch="NET_ID: 884-29X">NET_ID: 884-29X</span>
            </div>
            <div className="h-1.5 w-48 bg-cyan-900/30 overflow-hidden border border-cyan-500/30">
                <div className="h-full w-full bg-cyan-400 origin-left animate-[scale-x_2s_ease-in-out_infinite]" />
            </div>
            <div className="text-xs text-cyan-600 font-mono leading-relaxed pl-2 border-l-2 border-cyan-500/50">
                UPLINK_SECURE // <span className="text-cyan-300">ACTIVE</span><br/>
                ENCRYPTION_KEY_VALID
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
                <div className="text-cyan-500 font-bold text-xs mb-2 tracking-widest">DATA_STREAM_INCOMING</div>
                <div className="space-y-1 font-mono text-[10px] text-cyan-400/60">
                    {Array.from({length: 6}).map((_, i) => (
                        <div key={i} className="truncate w-48">
                            {`> 0x${Math.random().toString(16).slice(2,8).toUpperCase()}_PKT_${i} [OK]`}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Right Side Decoration - INTENSE */}
      <div className="absolute top-0 right-0 bottom-0 w-1/3 pointer-events-none hidden md:flex flex-col justify-between items-end overflow-hidden z-0">
         {/* Huge Number Background */}
         <div className="absolute top-20 right-[-20px] select-none mix-blend-overlay opacity-30">
            <span className="text-[40vh] font-black text-pink-600 italic tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>01</span>
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
                    UNAUTHORIZED SIGNAL DETECTED IN SECTOR 7G. SECURITY PROTOCOLS ENGAGED.
                </div>
            </div>
            {/* Hazard Stripes */}
            <div className="w-4 h-24 flex flex-col gap-1">
                {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="flex-1 bg-red-500/40 skew-y-[-20deg]" />
                ))}
            </div>
         </div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <header className="mb-8 text-center text-white">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-black/40 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-cyan-300">SYSTEM: ONLINE</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            IASTRO-MATCH
          </h1>
          <p className="text-[10px] text-gray-400 font-mono tracking-[0.3em] mt-1">
            FIND YOUR CO-PILOT
          </p>
        </header>

        {current ? (
          <div className="relative h-[550px] w-full select-none perspective-[1000px]">
            {next && (
              <div
                className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-black/80 border border-white/5 opacity-40 scale-90 translate-y-12 blur-[2px]"
                style={{
                  backgroundImage: `url(${next.avatar_url ?? ""})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] touch-none transition-transform duration-200 ease-out"
              style={{
                transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                cursor: "grab",
              }}
              onMouseDown={(e) => onPointerDown(e.clientX)}
              onMouseMove={(e) => onPointerMove(e.clientX)}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
              onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
              onTouchEnd={onPointerUp}
            >
              <CyberCard profile={current} />
              
              {/* Swipe Indicators */}
              <div className={`absolute top-10 left-10 border-4 border-green-500 rounded-lg px-4 py-2 -rotate-12 opacity-0 transition-opacity duration-200 ${dragX > 50 ? 'opacity-100' : ''}`}>
                <span className="text-green-500 font-black text-4xl tracking-widest">LIKE</span>
              </div>
              <div className={`absolute top-10 right-10 border-4 border-red-500 rounded-lg px-4 py-2 rotate-12 opacity-0 transition-opacity duration-200 ${dragX < -50 ? 'opacity-100' : ''}`}>
                <span className="text-red-500 font-black text-4xl tracking-widest">NOPE</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute -bottom-24 left-0 right-0 flex items-center justify-center gap-8">
              <button
                onClick={() => handleSwipe("left")}
                className="group relative w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                <span className="absolute inset-0 rounded-full border border-red-500 opacity-0 group-hover:animate-ping" />
                <span className="text-2xl text-red-500">✕</span>
              </button>
              
              <button
                onClick={() => handleSwipe("right")}
                className="group relative w-20 h-20 rounded-full bg-black/50 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              >
                <span className="absolute inset-0 rounded-full border border-cyan-500 opacity-0 group-hover:animate-ping" />
                <span className="text-3xl text-cyan-400 fill-current">♥</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-xl text-center text-white py-16 px-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center">
              <span className="text-2xl animate-pulse">📡</span>
            </div>
            <div className="text-2xl font-bold mb-2 font-mono tracking-wider text-cyan-400">SIGNAL LOST</div>
            <p className="text-gray-400 mb-8 font-mono text-sm">
              All available frequencies scanned. <br/>
              No new signals detected in your sector.
            </p>
            <button
              onClick={reset}
              className="px-8 py-3 rounded-none skew-x-[-10deg] bg-cyan-500 text-black font-black tracking-widest hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all active:scale-95"
            >
              <span className="block skew-x-[10deg]">RE-SCAN SECTOR</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Match Overlay */}
      {showMatchOverlay && matchedProfile && <MatchOverlay profile={matchedProfile} />}
    </main>
  );
}
