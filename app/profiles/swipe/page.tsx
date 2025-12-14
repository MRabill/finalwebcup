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
      <div className="w-full max-w-sm relative">
        <header className="mb-4 text-center text-white">
          <p className="uppercase text-xs tracking-[0.25em] text-cyan-200">
            Swipe Profiles
          </p>
          <h1 className="text-3xl font-black">Cyber Dating Deck</h1>
        </header>

        {current ? (
          <div className="relative h-[440px] w-full select-none">
            {next && (
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-black/60"
                style={{
                  transform: "scale(0.92) translateY(18px)",
                  opacity: 0.6,
                  backgroundImage: `url(${next.avatar_url ?? ""})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            {third && (
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-black/60"
                style={{
                  transform: "scale(0.86) translateY(32px)",
                  opacity: 0.4,
                  backgroundImage: `url(${third.avatar_url ?? ""})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/60 touch-none"
              style={{
                backgroundImage: `url(${current.avatar_url ?? ""})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                transition: isDragging ? "none" : "transform 0.2s ease-out",
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
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
              <div className="absolute top-3 right-3 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 text-cyan-200 text-xs border border-cyan-400/40">
                  {current.match ? "MATCH" : "POSSIBLE"}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 text-purple-200 text-xs border border-purple-400/40">
                  Risk {current.risk_level}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-2">
                <div className="text-2xl font-black">{current.alias}</div>
                <div className="text-xs text-gray-200 font-mono flex flex-wrap gap-2">
                  <span>Match {current.match_score}%</span>
                  <span>•</span>
                  <span>Conf {Math.round((current.confidence ?? 0) * 100)}%</span>
                  <span>•</span>
                  <span>Risk {current.risk_level}</span>
                  <span>•</span>
                  <span>Chem {current.chemistry_index}</span>
                  <span>•</span>
                  <span>Stability {current.stability_index}</span>
                  <span>•</span>
                  <span>Drama {current.drama_potential}</span>
                </div>
                <div className="text-xs text-purple-200">
                  Diplomatic impact: {current.diplomatic_impact}
                </div>
                {current.notes && (
                  <p className="text-sm text-gray-200 line-clamp-3">{current.notes}</p>
                )}
              </div>
            </div>

            <div className="absolute inset-x-0 -bottom-16 flex items-center justify-center gap-6">
              <button
                onClick={() => handleSwipe("left")}
                className="h-14 w-14 rounded-full bg-black/70 text-gray-200 border border-white/15 shadow-lg text-2xl hover:scale-105 transition"
                title="Dislike"
              >
                ✕
              </button>
              <button
                onClick={() => handleSwipe("right")}
                className="ml-2 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-cyan-400 text-white border border-purple-200/60 shadow-[0_0_25px_rgba(168,85,247,0.6)] text-3xl hover:scale-110 transition"
                title="Like"
              >
                ♥
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/40 text-center text-white py-16 px-6 shadow-2xl">
            <div className="text-2xl font-bold mb-2">Deck finished</div>
            <p className="text-gray-300 mb-4">
              You swiped through all profiles.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-full bg-cyan-500 text-black font-semibold shadow hover:scale-105 transition"
            >
              Restart
            </button>
          </div>
        )}
      </div>
      
      {/* Match Overlay */}
      {showMatchOverlay && matchedProfile && <MatchOverlay profile={matchedProfile} />}
    </main>
  );
}
