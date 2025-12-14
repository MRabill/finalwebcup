"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import matchResults from "../match-results.json";

type Profile = (typeof matchResults.output)[number];

export default function SwipeProfiles() {
  const router = useRouter();
  const profiles = useMemo<Profile[]>(() => matchResults.output as Profile[], []);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);

  const current = profiles[index];
  const next = profiles[index + 1];
  const third = profiles[index + 2];

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!current) return;
      if (direction === "right" && current.match) {
        router.push(`/profile/${current.candidate_id}`);
        return;
      }
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
    </main>
  );
}
