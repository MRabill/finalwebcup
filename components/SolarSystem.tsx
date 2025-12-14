"use client";

import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Glitch } from "@react-three/postprocessing";
import * as THREE from "three";
import { X, Heart, XCircle, Aperture, Activity, Radio, Crosshair, Skull, TriangleAlert } from "lucide-react";
import IconButton from "./IconButton";

// --- Data & Configuration ---

interface MoonData {
  name: string;
  size: number;
  dist: number;
  speed: number;
  initialAngle?: number;
  color: string;
}

interface PlanetData {
  name: string;
  size: number;
  dist: number;
  speed: number;
  initialAngle: number;
  texture: string;
  type: string;
  hasRings?: boolean;
 
  moons: MoonData[];
  description?: string;
  temp?: string;
  dayLength?: string;
  age?: string;

  // New fields
  atmosphere?: string;
  dangerLevel?: string;
  politicalInstability?: string;
  compatibilityScore?: number;
}

const PLANETS: PlanetData[] = [
  {
    name: "Shadow Core",
    size: 0.38,
    dist: 7,
    speed: 0.004,
    initialAngle: 0,
    texture: "/textures/mercury.jpg",
    type: "planet",
    description: "A scorched rock close to the energy source. Shadows here are absolute.",
    temp: "167°C",
    dayLength: "1,408h",
    age: "4.5B",
    atmosphere: "Ionized Plasma Haze",
    dangerLevel: "Solar Flare Bombardment",
    politicalInstability: "AI Mining Guild Control",
    compatibilityScore: 15,
    moons: []
  },
  {
    name: "Nova District",
    size: 0.9,
    dist: 11,
    speed: 0.0016,
    initialAngle: 4.8,
    texture: "/textures/venus.jpg",
    type: "planet",
    description: "A toxic paradise of acid rain and crushing pressure. High fashion meets high mortality.",
    temp: "464°C",
    dayLength: "5,832h",
    age: "4.5B",
    atmosphere: "Sulfuric Smog Density: 99%",
    dangerLevel: "Corrosive Acid Monsoons",
    politicalInstability: "MegaCorp Hostile Takeover",
    compatibilityScore: 45,
    moons: []
  },
  {
    name: "Cyber Earth",
    size: 1,
    dist: 15,
    speed: 0.001,
    initialAngle: 3.45,
    texture: "/textures/earth.jpg",
    type: "planet",
    description: "The cradle of humanity, now a sprawling neon megastructure.",
    temp: "15°C",
    dayLength: "24h",
    age: "4.5B",
    atmosphere: "Filtered O2 (Sub. Req.)",
    dangerLevel: "Nanotech Smog / Acid Rain",
    politicalInstability: "Corp. Oligarchy vs Resistance",
    compatibilityScore: 88,
    moons: [
      { name: "Moon", size: 0.27, dist: 2.5, speed: 0.037, initialAngle: 1.2, color: "#888888" }
    ]
  },
  {
    name: "Mars Colony",
    size: 0.8,
    dist: 19,
    speed: 0.00053,
    initialAngle: 0.9,
    texture: "/textures/mars.jpg",
    type: "planet",
    description: "The red frontier. Hard labor, dust storms, and the dream of terraforming.",
    temp: "-65°C",
    dayLength: "25h",
    age: "4.6B",
    atmosphere: "Pressurized Dome Clusters",
    dangerLevel: "Silicate Razor Storms",
    politicalInstability: "Indentured Worker Uprisings",
    compatibilityScore: 35,
    moons: [
      { name: "Phobos", size: 0.05, dist: 1.5, speed: 0.32, color: "#664222" },
      { name: "Deimos", size: 0.03, dist: 2.2, speed: 0.08, color: "#664222" }
    ]
  },
  {
    name: "Neo Tokyo",
    size: 2.5,
    dist: 25,
    speed: 0.000084,
    initialAngle: 2.7,
    texture: "/textures/jupiter.jpg",
    type: "planet",
    description: "A gas giant of endless storms. Floating cities house the elite.",
    temp: "-110°C",
    dayLength: "10h",
    age: "4.6B",
    atmosphere: "Toxic Gas Oceans",
    dangerLevel: "Gravitational Shear Waves",
    politicalInstability: "Yakuza High-Orbit Syndicate",
    compatibilityScore: 75,
    moons: [
      { name: "Io", size: 0.15, dist: 3.5, speed: 0.56, color: "#FFFF99" },
      { name: "Europa", size: 0.13, dist: 4.2, speed: 0.28, color: "#87CEEB" },
      { name: "Ganymede", size: 0.22, dist: 5.1, speed: 0.14, color: "#8C7D6B" },
      { name: "Callisto", size: 0.20, dist: 6.0, speed: 0.06, color: "#696969" }
    ]
  },
  {
    name: "Orbital X",
    size: 2.0,
    dist: 31,
    speed: 0.000034,
    initialAngle: 5.8,
    texture: "/textures/saturn.jpg",
    hasRings: true,
    type: "planet",
    description: "The ringed jewel. A hub for smugglers, traders, and ring-racers.",
    temp: "-140°C",
    dayLength: "10.7h",
    age: "4.5B",
    atmosphere: "Cryo-Vapor Clouds",
    dangerLevel: "Debris Field Collisions",
    politicalInstability: "Smuggler Cartel Warlords",
    compatibilityScore: 98,
    moons: [
        { name: "Titan", size: 0.21, dist: 5.5, speed: 0.063, color: "#FFa500" }
    ]
  },
  {
    name: "Void Helix",
    size: 1.2,
    dist: 37,
    speed: 0.000012,
    initialAngle: 1.2,
    texture: "/textures/uranus.jpg",
    type: "planet",
    description: "A frozen giant spinning on its side. Home to data vaults and cryo-prisons.",
    temp: "-195°C",
    dayLength: "17h",
    age: "4.5B",
    atmosphere: "Frozen Methane Mist",
    dangerLevel: "Absolute Zero Pockets",
    politicalInstability: "Autonomous Data-Vault Sentinels",
    compatibilityScore: 5,
    moons: []
  },
  {
    name: "Neon Prime",
    size: 1.1,
    dist: 42,
    speed: 0.0000061,
    initialAngle: 6.1,
    texture: "/textures/neptune.jpg",
    type: "planet",
    description: "The furthest outpost. Deep blue winds and illegal cybernetics labs.",
    temp: "-200°C",
    dayLength: "16h",
    age: "4.5B",
    atmosphere: "Dark Matter Turbulence",
    dangerLevel: "Supersonic Diamond Winds",
    politicalInstability: "Anarchist Hacker Collectives",
    compatibilityScore: 60,
    moons: [
        { name: "Triton", size: 0.11, dist: 3.0, speed: 0.17, color: "#87CEEB" }
    ]
  }
];

// --- Components ---

// Loading fallback component
function UniverseBackgroundFallback() {
  return (
    <mesh>
      <sphereGeometry args={[400, 16, 16]} />
      <meshBasicMaterial color={new THREE.Color(0.05, 0.05, 0.1)} side={THREE.BackSide} />
    </mesh>
  );
}

function UniverseBackground({ onBackgroundClick }: { onBackgroundClick?: () => void }) {
  const [starTexture, skyTexture] = useLoader(THREE.TextureLoader, [
    "/textures/8k_stars.jpg",
    "/textures/stars.png"
  ]);

  // Optimize texture settings for faster loading
  if (starTexture) {
    starTexture.generateMipmaps = true;
    starTexture.minFilter = THREE.LinearMipmapLinearFilter;
    starTexture.magFilter = THREE.LinearFilter;
  }
  if (skyTexture) {
    skyTexture.generateMipmaps = true;
    skyTexture.minFilter = THREE.LinearMipmapLinearFilter;
    skyTexture.magFilter = THREE.LinearFilter;
  }

  return (
    <group onClick={(e) => {
      // @ts-ignore
      if (e.delta > 5) return;
      onBackgroundClick && onBackgroundClick();
    }}>
      <mesh>
        {/* Reduced from 64,64 to 32,32 for better performance */}
        <sphereGeometry args={[400, 32, 32]} />
        <meshBasicMaterial 
          map={starTexture} 
          side={THREE.BackSide} 
          toneMapped={false}
          color={new THREE.Color(1.2, 1.2, 1.2)}
        />
      </mesh>
      <mesh>
        {/* Reduced from 64,64 to 32,32 for better performance */}
        <sphereGeometry args={[390, 32, 32]} />
        <meshBasicMaterial 
          map={skyTexture} 
          side={THREE.BackSide} 
          transparent 
          opacity={0.3} 
          toneMapped={false}
          color={new THREE.Color(0.8, 0.9, 1.0)}
        />
      </mesh>
    </group>
  );
}

function Sun() {
  const texture = useLoader(THREE.TextureLoader, "/textures/sun.png");
  const lightRef = useRef<THREE.PointLight>(null);

  // Optimize texture
  if (texture) {
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
  }

  return (
    <group>
      <mesh>
        {/* Reduced from 64,64 to 32,32 for better performance */}
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial 
          map={texture} 
          color={new THREE.Color(3, 2.4, 1.5)} 
          toneMapped={false}
        />
      </mesh>
      <pointLight 
        ref={lightRef}
        position={[0, 0, 0]} 
        intensity={3000} 
        distance={1000} 
        decay={2} 
        castShadow 
      />
    </group>
  );
}

function OrbitPath({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * 2 * Math.PI;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <Line 
      points={points} 
      color="#ffffff" 
      transparent 
      opacity={0.03} 
      lineWidth={1} 
    />
  );
}


// --- New Components ---

function WarningScreen({ score }: { score: number }) {
  let message = "CAUTION ADVISED";
  if (score < 10) message = "IMMINENT DEATH";
  else if (score < 30) message = "CRITICAL HAZARD";

  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center border-2 border-red-500 overflow-hidden">
      {/* Hazard Stripes Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #ef4444 0, #ef4444 10px, transparent 10px, transparent 20px)"
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center animate-pulse">
        <Skull size={48} className="text-red-500 mb-4" />
        <div className="bg-red-500/20 px-4 py-1 border border-red-500 mb-2">
           <span className="text-red-500 font-black tracking-[0.3em] text-xl">WARNING</span>
        </div>
        <h3 className="text-white font-mono font-bold text-lg tracking-wider mb-1">THREAT DETECTED</h3>
        <p className="text-red-400 font-mono text-xs tracking-[0.2em]">{message}</p>
        <p className="text-red-500/50 font-mono text-[10px] mt-4">COMPATIBILITY: {score}%</p>
      </div>

      {/* Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500" />
    </div>
  );
}

function LoveAnimation() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
       {[...Array(6)].map((_, i) => (
         <div 
           key={i}
           className="absolute text-pink-500/30 animate-float-up"
           style={{
             left: `${20 + Math.random() * 60}%`,
             bottom: '-20px',
             animationDelay: `${Math.random() * 2}s`,
             fontSize: `${20 + Math.random() * 20}px`
           }}
         >
           <Heart fill="currentColor" />
         </div>
       ))}
       <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent animate-pulse" />
    </div>
  );
}

function DangerHUD() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between overflow-hidden">
       {/* Top Bar */}
       <div className="w-full h-2 bg-red-600/50 shadow-[0_0_20px_#ef4444] animate-pulse"></div>
       
       <div className="flex-1 flex justify-between">
          {/* Left Bar */}
          <div className="w-2 h-full bg-red-600/50 shadow-[0_0_20px_#ef4444] animate-pulse"></div>
          {/* Right Bar */}
          <div className="w-2 h-full bg-red-600/50 shadow-[0_0_20px_#ef4444] animate-pulse"></div>
       </div>

       {/* Bottom Bar */}
       <div className="w-full h-2 bg-red-600/50 shadow-[0_0_20px_#ef4444] animate-pulse"></div>
       
       {/* Vignette */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(220,38,38,0.2)_100%)] animate-pulse"></div>
       
       {/* Tech Lines */}
        <div className="absolute top-4 left-4 w-32 h-[1px] bg-red-500 animate-pulse"></div>
        <div className="absolute top-4 right-4 w-32 h-[1px] bg-red-500 animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-32 h-[1px] bg-red-500 animate-pulse"></div>
        <div className="absolute bottom-4 right-4 w-32 h-[1px] bg-red-500 animate-pulse"></div>
    </div>
  );
}

function LoginCard({ className = "", onLogin, planet }: { className?: string, onLogin: () => void, planet: PlanetData | null }) {
  const [mode, setMode] = useState<"choice" | "signin" | "signup">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<{ field: "email" | "password" | "global"; msg: string } | null>(null);

  // Determine which specialized screen to show (if any)
  const score = planet?.compatibilityScore ?? 0;
  const isWarning = score < 50;
  const isHighLove = score >= 80;

  const validateSignIn = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFieldError({ field: "email", msg: "EMAIL REQUIRED" });
      return false;
    }
    // Basic email sanity check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmedEmail)) {
      setFieldError({ field: "email", msg: "INVALID NETWORK SYNTAX" });
      return false;
    }
    if (!password) {
      setFieldError({ field: "password", msg: "PASSWORD REQUIRED" });
      return false;
    }
    if (password.length < 4) {
      setFieldError({ field: "password", msg: "PASSWORD TOO SHORT" });
      return false;
    }
    setFieldError(null);
    return true;
  };

  const submitSignIn = () => {
    if (!validateSignIn()) return;
    onLogin();
  };

  return (
    <div
      className={`bg-[#0a0a0f]/60 backdrop-blur-xl p-8 relative overflow-hidden w-[350px] md:w-[400px] ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* High Compatibility Background Animation */}
      {isHighLove && <LoveAnimation />}

      {/* Warning Screen Overlay */}
      {isWarning && <WarningScreen score={score} />}

      {/* Rotating glow dot (same as ParallaxLogin) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full overflow-visible">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            strokeWidth="3"
            pathLength="100"
            strokeDasharray="2 98"
            strokeLinecap="round"
            className="animate-border-rotate opacity-80"
          />
        </svg>
      </div>

      {/* Broken Borders / Tech Frame */}
      <div className="absolute top-0 left-0 w-8 h-[2px] bg-cyan-500" />
      <div className="absolute top-0 left-0 w-[2px] h-8 bg-cyan-500" />
      <div className="absolute top-0 right-0 w-8 h-[2px] bg-cyan-500" />
      <div className="absolute top-0 right-0 w-[2px] h-8 bg-cyan-500" />
      <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-pink-500" />
      <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-pink-500" />
      <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-pink-500" />
      <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-pink-500" />

      {/* Decorative broken lines */}
      <div className="absolute top-0 left-1/4 w-16 h-[1px] bg-white/20" />
      <div className="absolute bottom-0 right-1/4 w-16 h-[1px] bg-white/20" />

      {/* Header (match ParallaxLogin vibe) */}
      <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-[0.2em]">
            IASTROMATCH
          </h2>
          <p className="text-[10px] text-cyan-500/70 font-mono mt-1 tracking-wider">
            AUTH REQUIRED // ROUTE: ONBOARDING
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-white/30 font-mono tracking-widest">
            ACCESS_V0.9
          </span>
        </div>
      </div>

      {planet && (
        <div className="mb-6 relative z-10 bg-white/5 p-4 border-l-2 border-cyan-500 backdrop-blur-sm">
           <h3 className="text-lg text-white font-bold tracking-widest mb-1">{planet.name.toUpperCase()}</h3>
           <p className="text-xs text-gray-400 font-mono mb-3 leading-relaxed">{planet.description}</p>
           
           <div className="grid grid-cols-1 gap-2 text-[10px] font-mono tracking-wider">
             <div className="flex justify-between border-b border-white/5 pb-1">
               <span className="text-pink-500">MATCH RATE</span>
               <span className={`text-right font-bold text-lg ${
                 (planet.compatibilityScore || 0) >= 80 ? "text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" : 
                 (planet.compatibilityScore || 0) < 50 ? "text-red-500" : "text-white"
               }`}>
                 {planet.compatibilityScore || 0}%
               </span>
             </div>
             <div className="flex justify-between border-b border-white/5 pb-1">
               <span className="text-cyan-500">ATMOSPHERE</span>
               <span className="text-white text-right">{planet.atmosphere || "UNKNOWN"}</span>
             </div>
             <div className="flex justify-between border-b border-white/5 pb-1">
               <span className="text-red-400">DANGER</span>
               <span className="text-white text-right">{planet.dangerLevel || "UNKNOWN"}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-purple-400">POLITICS</span>
               <span className="text-white text-right">{planet.politicalInstability || "STABLE"}</span>
             </div>
           </div>
        </div>
      )}

      <div className="space-y-6 relative z-10">
        {mode === "choice" && (
          <>
            <p className="text-white/50 font-mono text-sm tracking-widest leading-relaxed">
              YOU’RE ABOUT TO ENTER THE INTERGALACTIC TINDER LAYER.
              <br />
              CHOOSE YOUR ENTRY PROTOCOL.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <IconButton
                text="SIGN IN_"
                onClick={() => {
                  setMode("signin");
                  setFieldError(null);
                }}
              />
              <IconButton
                text="SIGN UP_"
                onClick={() => {
                  // For now, route to onboarding (signup flow can be built there)
                  setMode("signup");
                  onLogin();
                }}
              />
            </div>
          </>
        )}

        {mode === "signin" && (
          <>
            <p className="text-white/50 font-mono text-sm tracking-widest leading-relaxed">
              SIGN IN TO SYNC YOUR MATCH DATASTREAM.
            </p>

            {/* Email */}
            <div className="relative">
              <label className="block text-cyan-400 font-mono text-xs tracking-[0.2em] font-bold mb-2">
                QUANTUM_MAIL
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError?.field === "email") setFieldError(null);
                  }}
                  placeholder="USER@VOID.NET"
                  className={`w-full bg-black/50 border ${
                    fieldError?.field === "email" ? "border-red-500/50" : "border-white/10"
                  } text-white font-mono text-lg py-3 px-4 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/10 transition-all placeholder:text-white/10`}
                  autoFocus
                />
                <div
                  className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${
                    fieldError?.field === "email"
                      ? "border-red-500"
                      : "border-white/30 group-focus-within:border-cyan-500"
                  } transition-colors`}
                />
                <div
                  className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${
                    fieldError?.field === "email"
                      ? "border-red-500"
                      : "border-white/30 group-focus-within:border-cyan-500"
                  } transition-colors`}
                />

                <div
                  className={`absolute -bottom-6 right-0 text-red-500 text-[10px] font-mono font-bold tracking-wider flex items-center gap-2 transition-all duration-200 ${
                    fieldError?.field === "email" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-sm animate-pulse shadow-[0_0_10px_#ef4444]" />
                  {fieldError?.field === "email" ? fieldError.msg : ""}
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-cyan-400 font-mono text-xs tracking-[0.2em] font-bold mb-2">
                ACCESS_CODE
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldError?.field === "password") setFieldError(null);
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-black/50 border ${
                    fieldError?.field === "password" ? "border-red-500/50" : "border-white/10"
                  } text-white font-mono text-lg py-3 px-4 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/10 transition-all placeholder:text-white/10`}
                />
                <div
                  className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${
                    fieldError?.field === "password"
                      ? "border-red-500"
                      : "border-white/30 group-focus-within:border-cyan-500"
                  } transition-colors`}
                />
                <div
                  className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${
                    fieldError?.field === "password"
                      ? "border-red-500"
                      : "border-white/30 group-focus-within:border-cyan-500"
                  } transition-colors`}
                />

                <div
                  className={`absolute -bottom-6 right-0 text-red-500 text-[10px] font-mono font-bold tracking-wider flex items-center gap-2 transition-all duration-200 ${
                    fieldError?.field === "password" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-sm animate-pulse shadow-[0_0_10px_#ef4444]" />
                  {fieldError?.field === "password" ? fieldError.msg : ""}
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <IconButton text="ENGAGE_" onClick={submitSignIn} />
              <IconButton
                text="BACK_"
                onClick={() => {
                  setMode("choice");
                  setEmail("");
                  setPassword("");
                  setFieldError(null);
                }}
                className="opacity-80"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LocationMarker({ 
  position, 
  color = "#FFFFFF", 
  scale = 1, 
  isActive, 
  onHover, 
  onOut 
}: { 
  position: THREE.Vector3, 
  color?: string, 
  scale?: number, 
  isActive: boolean,
  onHover: (e: any) => void,
  onOut: (e: any) => void
}) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        position.clone().normalize()
      );
    }
  }, [position]);

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={[scale, scale, scale]}
      onPointerOver={onHover}
      onPointerOut={onOut}
    >
      {/* Main Beam (Tapered) */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.0, 0.04, 2.0, 8, 1, true]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Core Beam (Brighter, thinner) */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.0, 0.01, 2.0, 8, 1, true]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.6} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Base Glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Base Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
         <ringGeometry args={[0.08, 0.12, 32]} />
         <meshBasicMaterial 
           color={color} 
           side={THREE.DoubleSide} 
           transparent 
           opacity={0.5} 
           blending={THREE.AdditiveBlending}
           toneMapped={false}
         />
      </mesh>
    </group>
  );
}

function LocationMarkers({ 
  radius, 
  count = 5, 
  color = "#00f0ff", 
  setRotationPaused,
  setLoginVisible
}: { 
  radius: number, 
  count?: number, 
  color?: string, 
  setRotationPaused: (paused: boolean) => void,
  setLoginVisible: (visible: boolean) => void
}) {
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const markers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        arr.push(new THREE.Vector3(x, y, z));
    }
    return arr;
  }, [radius, count]);

  const handleMarkerHover = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveMarker(index);
    setRotationPaused(true);
    setLoginVisible(true);
    document.body.style.cursor = 'pointer';
  };

  const handleMarkerOut = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMarker(null);
      setRotationPaused(false);
      document.body.style.cursor = 'auto';
    }, 3000);
  };

  useEffect(() => {
    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <group>
      {markers.map((pos, i) => (
        <LocationMarker 
          key={i} 
          position={pos} 
          color={color} 
          scale={radius * 0.2} 
          isActive={activeMarker === i}
          onHover={(e) => { e.stopPropagation(); handleMarkerHover(i); }}
          onOut={(e) => { handleMarkerOut(); }}
        />
      ))}
    </group>
  );
}

function Planet({ 
  data, 
  onPlanetSelect, 
  setRef,
  isSelected,
  setLoginVisible
}: { 
  data: PlanetData, 
  onPlanetSelect: (data: PlanetData) => void,
  setRef: (name: string, obj: THREE.Group) => void,
  isSelected: boolean,
  setLoginVisible: (visible: boolean) => void
}) {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, data.texture);
  const startAngle = data.initialAngle;
  const [isRotationPaused, setRotationPaused] = useState(false);

  // Optimize texture loading
  useEffect(() => {
    if (texture) {
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  // Register ref
  useEffect(() => {
    if (meshRef.current) {
      setRef(data.name, meshRef.current);
    }
  }, [data.name, setRef]);

  useFrame(({ clock }) => {
    if (meshRef.current && !isRotationPaused && !isSelected) {
      const t = clock.getElapsedTime();
      const angle = startAngle + t * data.speed * 10;
      const x = Math.cos(angle) * data.dist;
      const z = Math.sin(angle) * data.dist;
      meshRef.current.position.set(x, 0, z);
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <OrbitPath radius={data.dist} />
      <group 
        ref={meshRef} 
        onClick={(e) => {
          e.stopPropagation();
          onPlanetSelect(data);
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <mesh castShadow receiveShadow>
          {/* Reduced from 32,32 to 24,24 for better performance */}
          <sphereGeometry args={[data.size, 24, 24]} />
          <meshStandardMaterial 
            map={texture} 
            roughness={0.7} 
            metalness={0.1} 
          />
        </mesh>
        
       

        {data.moons.map((moon, i) => (
          <Moon key={i} data={moon} />
        ))}

        {isSelected && (
          <LocationMarkers 
            radius={data.size} 
            color={data.name === "Earth" ? "#00f0ff" : "#ffffff"} 
            setRotationPaused={setRotationPaused}
            setLoginVisible={setLoginVisible}
          />
        )}
      </group>
    </group>
  );
}

function Moon({ data }: { data: MoonData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const angle = (data.initialAngle || 0) + t * data.speed;
      const x = Math.cos(angle) * data.dist;
      const z = Math.sin(angle) * data.dist;
      meshRef.current.position.set(x, 0, z);
    }
  });

  return (
    <mesh ref={meshRef} position={[data.dist, 0, 0]}>
      <sphereGeometry args={[data.size, 16, 16]} />
      <meshStandardMaterial color={data.color} />
    </mesh>
  );
}

function CameraController({ 
  selectedPlanet, 
  planetRefs,
  isZoomingIn
}: { 
  selectedPlanet: PlanetData | null, 
  planetRefs: React.MutableRefObject<{[key: string]: THREE.Group}>,
  isZoomingIn: boolean
}) {
  const { camera, controls } = useThree();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastSelectedName = useRef<string | null>(null);

  // Trigger transition when selection changes
  useEffect(() => {
    if (selectedPlanet?.name !== lastSelectedName.current) {
      setIsTransitioning(true);
      lastSelectedName.current = selectedPlanet?.name || null;
    }
  }, [selectedPlanet]);

  useFrame((state, delta) => {
    // @ts-ignore
    const orbitControls = (controls as any);

    if (selectedPlanet && planetRefs.current[selectedPlanet.name]) {
      const planetGroup = planetRefs.current[selectedPlanet.name];
      const targetPos = new THREE.Vector3();
      
      planetGroup.getWorldPosition(targetPos);

      // 1. Always update the OrbitControls target to focus on the planet
      if (orbitControls) {
        orbitControls.target.lerp(targetPos, 0.1);
      }

      // If zooming in for login, we override everything else
      if (isZoomingIn) {
         // Get very close to the surface.
         // Assuming unit sphere mesh at 0,0,0 relative to parent group.
         // We want camera to move towards the planet center but stop right in front.
         const dist = selectedPlanet.size * 1.5; 
         const offset = new THREE.Vector3(0, 0, dist); 
         // Adjust offset based on current camera angle if we wanted, 
         // but a fixed offset is cleaner for "entering" effect.
         
         const desiredCamPos = targetPos.clone().add(offset);
         state.camera.position.lerp(desiredCamPos, 0.04);
         
         return; // Skip other logic
      }

      // 2. Only force camera position during transition
      if (isTransitioning) {
        const dist = selectedPlanet.size * 4; 
        const height = selectedPlanet.size * 2;
        const offset = new THREE.Vector3(0, height, dist); // Relative offset
        
        // Calculate desired absolute position: Target + Offset
        // We want a fixed angle initially, so we just add to target
        const desiredCamPos = targetPos.clone().add(offset);

        state.camera.position.lerp(desiredCamPos, 0.05);

        // Stop transitioning when close enough
        if (state.camera.position.distanceTo(desiredCamPos) < 0.5) {
          setIsTransitioning(false);
        }
      }
      
      if (orbitControls) {
        orbitControls.update();
      }

    } else {
      // Return to default view if no planet selected
      const defaultTarget = new THREE.Vector3(0, 0, 0);
      const defaultPos = new THREE.Vector3(0, 10, 45);

      if (!selectedPlanet) {
          state.camera.position.lerp(defaultPos, 0.05);
          if (orbitControls) {
            orbitControls.target.lerp(defaultTarget, 0.05);
            orbitControls.update();
          }
      }
    }
  });

  return null;
}

// --- Cyberpunk UI Components ---

const GlitchText = ({ 
  text, 
  className = "", 
  color1 = "text-red-500", 
  color2 = "text-blue-500" 
}: { 
  text: string, 
  className?: string,
  color1?: string,
  color2?: string 
}) => {
  return (
    <div className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className={`absolute top-0 left-0 -z-10 w-full h-full ${color1} opacity-70 animate-glitch-1 clip-text`}>{text}</span>
      <span className={`absolute top-0 left-0 -z-10 w-full h-full ${color2} opacity-70 animate-glitch-2 clip-text`}>{text}</span>
    </div>
  );
};

const RandomCharacters = ({ length = 10, className = "" }: { length?: number, className?: string }) => {
  const [chars, setChars] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      let result = "";
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      setChars(result);
    }, 100);
    return () => clearInterval(interval);
  }, [length]);
  return <span className={`font-mono ${className || "text-xs text-cyan-500/50"}`}>{chars}</span>;
};

const RotatingRing = () => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/10 rounded-full animate-spin-slow pointer-events-none">
    <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#0ff]"></div>
    <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#0ff]"></div>
  </div>
);

function CyberCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative bg-black p-6 ${className}`}
      style={{
        clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
      }}
    >
      {/* Gradient Border Simulation */}
      <div className="absolute inset-0 p-[2px] -z-10 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
        style={{
           clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
        }}
      >
        <div className="w-full h-full bg-black"></div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-24 h-[2px] bg-gradient-to-l from-pink-500 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-pink-500"></div>
      <div className="absolute bottom-0 left-0 w-24 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent"></div>
      
      {/* Scanning Line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        <div className="w-full h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 absolute top-0 animate-scan opacity-30"></div>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ 
          backgroundImage: "radial-gradient(circle, #ec4899 1px, transparent 1px)", 
          backgroundSize: "20px 20px" 
        }}
      ></div>
      
      {children}
    </div>
  );
}

function StatBox({ label, value, color = "text-white" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-2 relative overflow-hidden group hover:bg-white/10 transition-colors">
      <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-cyan-500 to-pink-500 group-hover:w-[4px] transition-all"></div>
      <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-mono flex justify-between">
        {label}
        <Activity size={10} className="text-pink-500/50" />
      </span>
      <span className={`text-lg font-bold font-mono ${color} drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]`}>{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, onClick, type = "neutral" }: { icon: any, onClick: () => void, type?: "like" | "pass" | "neutral" }) {
  const colors = {
    like: "border-pink-500 text-pink-400 hover:bg-pink-500/20 hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]",
    pass: "border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]",
    neutral: "border-white/20 text-white hover:bg-white/10"
  };

  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-full border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 bg-black/50 backdrop-blur-sm ${colors[type]} group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <Icon size={28} strokeWidth={2.5} />
    </button>
  );
}

export default function SolarSystem({ onLogin }: { onLogin: () => void }) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [loginVisible, setLoginVisible] = useState(false);
  const [isZoomingIn, setIsZoomingIn] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const planetRefs = useRef<{[key: string]: THREE.Group}>({});
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const romanceRef = useRef<HTMLAudioElement | null>(null);
  const glitchRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const zoomRef = useRef<HTMLAudioElement | null>(null);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to play zoom sound segment
  const playZoomSound = () => {
    if (!zoomRef.current) {
      zoomRef.current = new Audio("/sounds/Zoom For Scifi Hud Sound Effects.mp3");
      zoomRef.current.volume = 0.5;
    }

    const audio = zoomRef.current;
    
    // Clear any pending stop timeout
    if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
    }

    // Reset and play from 3s
    audio.currentTime = 3;
    audio.play().catch(() => {});

    // Stop after 3 seconds (at 00:06)
    zoomTimeoutRef.current = setTimeout(() => {
        audio.pause();
        audio.currentTime = 3;
    }, 3000);
  };

  // Interaction unlock for audio
  useEffect(() => {
    const handleInteraction = () => {
        // Unlock Ambient
        if (ambientRef.current) {
            ambientRef.current.play().catch(() => {});
        }
        
        // Unlock Glitch (silent play/pause)
        if (glitchRef.current) {
            glitchRef.current.play().then(() => {
                glitchRef.current?.pause();
                glitchRef.current!.currentTime = 0;
            }).catch(() => {});
        }

        // Unlock Zoom
        if (zoomRef.current) {
             zoomRef.current.play().then(() => {
                zoomRef.current?.pause();
                zoomRef.current!.currentTime = 3;
             }).catch(() => {});
        }

        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Ambient Sound Logic
  useEffect(() => {
    if (!ambientRef.current) {
      ambientRef.current = new Audio("/sounds/ambient.mp3");
      ambientRef.current.loop = true;
      ambientRef.current.volume = 0.8; 
    }

    // Try playing immediately
    ambientRef.current.play().catch(() => {
        // Will be handled by the interaction listener above
    });

    return () => {
      if (ambientRef.current) {
        ambientRef.current.pause();
      }
    };
  }, []);

  // Audio Logic (Alarm & Romance)
  useEffect(() => {
    const score = selectedPlanet?.compatibilityScore ?? 100;
    const isDangerous = selectedPlanet && score < 50;
    const isRomantic = selectedPlanet && score >= 80;

    // Handle Alarm
    if (isDangerous) {
      if (!alarmRef.current) {
        alarmRef.current = new Audio("/sounds/Nuclear alarm siren sound effect NUKE.mp3");
        alarmRef.current.loop = true;
        alarmRef.current.volume = 0.4;
      }
      if (alarmRef.current.paused) {
        alarmRef.current.play().catch((e) => console.log("Alarm play failed:", e));
      }
    } else {
      if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
      }
    }

    // Handle Romance
    if (isRomantic) {
      if (!romanceRef.current) {
        romanceRef.current = new Audio("/sounds/Romantic music sound effect.mp3");
        romanceRef.current.loop = true;
        romanceRef.current.volume = 0.4;
      }
      if (romanceRef.current.paused) {
        romanceRef.current.play().catch((e) => console.log("Romance play failed:", e));
      }
    } else {
      if (romanceRef.current) {
        romanceRef.current.pause();
        romanceRef.current.currentTime = 0;
      }
    }

    // Play zoom sound on planet selection
    if (selectedPlanet) {
        playZoomSound();
    }
  }, [selectedPlanet]);

  // Glitch Effect Loop
  useEffect(() => {
    let timeoutId: any;
    let activeTimeoutId: any;

    // Pre-load glitch sound to minimize latency
    if (!glitchRef.current) {
        glitchRef.current = new Audio("/sounds/Glitch Sound Effect - Free.mp3");
        glitchRef.current.volume = 0.25;
    }

    const scheduleNextGlitch = () => {
      const delay = Math.random() * 5000 + 5000; // 5-10s delay
      timeoutId = setTimeout(() => {
        setGlitchActive(true);
        
        if (glitchRef.current) {
            glitchRef.current.currentTime = 4;
            glitchRef.current.play().catch(() => {});
        }

        const duration = Math.random() * 300 + 300; // 300-600ms duration
        activeTimeoutId = setTimeout(() => {
            setGlitchActive(false);
            
            // Stop sound immediately when glitch stops
            if (glitchRef.current) {
                glitchRef.current.pause();
                glitchRef.current.currentTime = 0;
            }
            
            scheduleNextGlitch();
        }, duration);
      }, delay);
    };

    scheduleNextGlitch();

    return () => {
        clearTimeout(timeoutId);
        clearTimeout(activeTimeoutId);
        // Clean up audio on unmount
        if (glitchRef.current) {
            glitchRef.current.pause();
            glitchRef.current.currentTime = 0;
        }
    };
  }, []);

  // Keep the auth modal open while a planet is selected (prevents auto-closing while typing).
  useEffect(() => {
    if (!selectedPlanet) {
      setLoginVisible(false);
      return;
    }
    // During zoom-out/route transition, keep it hidden.
    if (isZoomingIn) return;
    setLoginVisible(true);
  }, [selectedPlanet, isZoomingIn]);

  // Font and Styles import
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Share+Tech+Mono&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes glitch-1 {
        0% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); transform: translate(0); }
        20% { clip-path: polygon(0 10%, 100% 0, 100% 90%, 0 100%); transform: translate(-2px, 2px); }
        40% { clip-path: polygon(0 0, 100% 10%, 100% 100%, 0 90%); transform: translate(2px, -2px); }
        60% { clip-path: polygon(0 5%, 100% 0, 100% 95%, 0 100%); transform: translate(-1px, 1px); }
        80% { clip-path: polygon(0 0, 100% 5%, 100% 100%, 0 95%); transform: translate(1px, -1px); }
        100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); transform: translate(0); }
      }
      @keyframes glitch-2 {
        0% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); transform: translate(0); }
        20% { clip-path: polygon(0 0, 100% 10%, 100% 90%, 0 100%); transform: translate(2px, -2px); }
        40% { clip-path: polygon(0 10%, 100% 0, 100% 100%, 0 90%); transform: translate(-2px, 2px); }
        60% { clip-path: polygon(0 0, 100% 5%, 100% 95%, 0 100%); transform: translate(1px, -1px); }
        80% { clip-path: polygon(0 5%, 100% 0, 100% 100%, 0 95%); transform: translate(-1px, 1px); }
        100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); transform: translate(0); }
      }
      @keyframes scan {
        0% { top: 0%; opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
      .animate-glitch-1 { animation: glitch-1 2.5s infinite linear alternate-reverse; }
      .animate-glitch-2 { animation: glitch-2 3s infinite linear alternate-reverse; }
      .animate-scan { animation: scan 3s linear infinite; }
      .animate-spin-slow { animation: spin 20s linear infinite; }
      .animate-float-up { animation: float-up 3s ease-in-out infinite; }
      @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
      @keyframes float-up {
        0% { transform: translateY(0) scale(0.5); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
      }
      @keyframes progress-scan {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);

    return () => { 
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  const handleSetRef = (name: string, obj: THREE.Group) => {
    planetRefs.current[name] = obj;
  };

  const handleLogin = () => {
    playZoomSound();
    setIsZoomingIn(true);
    setLoginVisible(false); // Hide the card during zoom
    // Let the zoom kick in, then route away
    setTimeout(() => {
        // Stop music/alarms before transitioning
        if (romanceRef.current) {
            romanceRef.current.pause();
            romanceRef.current.currentTime = 0;
        }
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
      onLogin();
    }, 900);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [dataStreamIds] = useState(() => 
    Array.from({length: 5}, () => Math.random().toString(16).slice(2,8).toUpperCase())
  );

  // Update loading progress
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(prev + Math.random() * 15, 100);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="w-full h-screen bg-[#000814] relative font-['Orbitron',_sans-serif] overflow-hidden">
      
      {/* Cyberpunk Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#000814] overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10"
            style={{ 
              backgroundImage: "linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)", 
              backgroundSize: "50px 50px" 
            }}
          />
          
          {/* Scanning Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent absolute top-1/4 animate-scan opacity-30"></div>
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent absolute top-1/2 animate-scan opacity-30" style={{ animationDelay: '1.5s' }}></div>
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent absolute top-3/4 animate-scan opacity-30" style={{ animationDelay: '3s' }}></div>
          </div>

          {/* Main Loading Container */}
          <div className="relative z-10 w-full max-w-2xl mx-auto px-8">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-12 h-[2px] bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
            <div className="absolute top-0 left-0 w-[2px] h-12 bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
            <div className="absolute top-0 right-0 w-12 h-[2px] bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
            <div className="absolute top-0 right-0 w-[2px] h-12 bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
            <div className="absolute bottom-0 left-0 w-12 h-[2px] bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
            <div className="absolute bottom-0 left-0 w-[2px] h-12 bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
            <div className="absolute bottom-0 right-0 w-12 h-[2px] bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
            <div className="absolute bottom-0 right-0 w-[2px] h-12 bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>

            {/* Glitch Title */}
            <div className="text-center mb-12">
              <GlitchText 
                text="IASTROMATCH" 
                className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter font-['Orbitron'] drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                color1="text-cyan-500"
                color2="text-pink-500"
              />
              <div className="mt-4">
                <p className="text-cyan-400 font-mono text-sm md:text-base tracking-[0.3em] font-bold">
                  INITIALIZING UNIVERSE PROTOCOLS...
                </p>
              </div>
            </div>

            {/* Progress Container */}
            <div className="bg-black/40 backdrop-blur-sm p-6 border border-cyan-500/30 border-l-4 border-l-cyan-500 mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-cyan-500 font-mono text-xs font-bold tracking-widest">SYSTEM_BOOT</span>
                <RandomCharacters length={8} className="text-xs text-cyan-400/60" />
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-cyan-900/30 overflow-hidden border border-cyan-500/30 relative">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500"
                  style={{ 
                    width: '100%',
                    backgroundSize: '200% 100%',
                    animation: 'progress-scan 2s ease-in-out infinite'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan"></div>
              </div>
            </div>

            {/* Data Stream */}
            <div className="bg-black/40 backdrop-blur-sm p-4 border border-cyan-500/20 border-l-4 border-l-cyan-500 mb-6">
              <div className="text-cyan-500 font-bold text-xs mb-3 tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></div>
                DATA_STREAM_INCOMING
              </div>
              <div className="space-y-1 font-mono text-[10px] text-cyan-400/60">
                {dataStreamIds.map((id, i) => {
                  const completed = Math.floor((loadingProgress / 100) * 5);
                  const status = i < completed ? 'OK' : i === completed ? 'LOADING' : 'PENDING';
                  return (
                    <div key={i} className="truncate">
                      {`> 0x${id}_PKT_${String(i).padStart(2, '0')} [${status}]`}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/30 backdrop-blur-sm p-3 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
                  <span className="text-[9px] text-cyan-400 font-mono tracking-wider">NETWORK</span>
                </div>
                <span className="text-cyan-300 font-mono text-xs font-bold">ONLINE</span>
              </div>
              <div className="bg-black/30 backdrop-blur-sm p-3 border border-pink-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-pink-400 animate-pulse shadow-[0_0_8px_#ec4899]"></div>
                  <span className="text-[9px] text-pink-400 font-mono tracking-wider">RENDER</span>
                </div>
                <span className="text-pink-300 font-mono text-xs font-bold">ACTIVE</span>
              </div>
              <div className="bg-black/30 backdrop-blur-sm p-3 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
                  <span className="text-[9px] text-cyan-400 font-mono tracking-wider">SYNC</span>
                </div>
                <span className="text-cyan-300 font-mono text-xs font-bold">READY</span>
              </div>
            </div>

            {/* Rotating Ring Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/10 rounded-full animate-spin-slow pointer-events-none -z-10">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#0ff]"></div>
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Solar System Layer */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Canvas
            shadows
            camera={{ position: [0, 10, 45], fov: 45 }}
            gl={{ 
              antialias: true, 
              toneMapping: THREE.ACESFilmicToneMapping, 
              outputColorSpace: THREE.SRGBColorSpace,
              powerPreference: "high-performance",
              stencil: false,
              depth: true
            }}
            onCreated={() => {
              // Hide loading state once canvas is ready
              setTimeout(() => setIsLoading(false), 500);
            }}
            dpr={[1, 2]} // Limit pixel ratio for better performance
          >
          <Suspense fallback={<UniverseBackgroundFallback />}>
            <UniverseBackground onBackgroundClick={() => setSelectedPlanet(null)} />
          </Suspense>
          <ambientLight intensity={0.1} />
          <Suspense fallback={null}>
            <Sun />
          </Suspense>
          
          <Suspense fallback={null}>
            {PLANETS.map((planet, i) => (
              <Planet 
                key={i} 
                data={planet} 
                onPlanetSelect={setSelectedPlanet}
                setRef={handleSetRef}
                isSelected={selectedPlanet?.name === planet.name}
                setLoginVisible={setLoginVisible}
              />
            ))}
          </Suspense>

          <CameraController selectedPlanet={selectedPlanet} planetRefs={planetRefs} isZoomingIn={isZoomingIn} />

          <OrbitControls 
              makeDefault
              enablePan={true} 
              enableZoom={!isZoomingIn} 
              minDistance={5} 
              maxDistance={350}
              maxPolarAngle={Math.PI / 1.5}
          />

          <EffectComposer>
            {/* Reduced Bloom intensity and radius for better performance */}
            <Bloom 
              luminanceThreshold={0.1} 
              mipmapBlur 
              intensity={1.5} 
              radius={0.5} 
            />
            <Glitch 
              delay={new THREE.Vector2(0, 0)} 
              duration={new THREE.Vector2(0.1, 0.3)} 
              strength={new THREE.Vector2(0.3, 0.8)} 
              mode={1} 
              active={glitchActive}
              ratio={0.85} 
            />
          </EffectComposer>
        </Canvas>
        </Suspense>
      
        {/* Danger HUD Overlay */}
        {(selectedPlanet?.compatibilityScore ?? 100) < 50 && <DangerHUD />}

        {/* Cyberpunk HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12 overflow-hidden">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-6">
               {/* Pill */}
               <div className="pointer-events-auto w-fit bg-black/20 backdrop-blur-md border border-pink-500/30 px-6 py-2 rounded-full flex items-center gap-3 hover:bg-black/40 transition-colors">
                 <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 animate-pulse shadow-[0_0_10px_#ec4899]"></div>
                 <span className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 font-mono tracking-[0.2em] font-bold">STATUS: ONLINE</span>
               </div>

               {/* Main Title */}
               <GlitchText 
                 text="IASTROMATCH" 
                 className="text-[7vw] font-black text-white leading-none tracking-tighter font-['Orbitron'] drop-shadow-[0_0_30px_rgba(236,72,153,0.3)] mix-blend-overlay opacity-90"
                 color1="text-pink-500"
                 color2="text-cyan-500"
               />

               {/* Subtitle & CTA */}
               <div className="max-w-md pl-2">
                 <p className="text-cyan-100 font-mono text-sm md:text-base leading-relaxed mb-8 tracking-widest border-l-2 border-transparent border-image-slice-1 pl-4 backdrop-blur-sm relative">
                   <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500 to-pink-500"></span>
                   ENTER THE INTERGALACTIC LAYER. <br/>
                   UNLEASH THE LOVE ECONOMY.
                 </p>
               </div>
            </div>

            {/* Top Right Stats */}
            <div className="flex flex-col items-end pt-2">
               <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-2 h-6 ${i < 3 ? 'bg-gradient-to-t from-cyan-500 to-pink-500' : 'bg-white/10'} skew-x-12`}></div>
                  ))}
               </div>
               <div className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 font-mono tracking-widest font-bold">SIGNAL_V.0.9</div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex justify-between items-end">
             {/* Bottom Left Coords */}
             <div className="relative -ml-6 translate-y-4">
               <div className={`relative transition-all duration-100 ${glitchActive ? 'translate-x-1 -translate-y-1 skew-x-12 opacity-50' : 'opacity-90'}`}>
                  <img 
                    src="/Astra pattern.png" 
                    alt="Astra Match Engine" 
                    className="w-48 md:w-64 mix-blend-screen object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  />
                  {glitchActive && (
                    <img 
                        src="/Astra pattern.png" 
                        alt="Glitch Layer"
                        className="absolute inset-0 w-full h-full mix-blend-overlay opacity-70 translate-x-2 translate-y-[-2px] saturate-200"
                    />
                  )}
               </div>
             </div>

             {/* Bottom Right Title */}
             <div>
               <GlitchText 
                 text="CYBERPUNK"
                 className="text-[7vw] font-black text-white leading-none tracking-tighter font-['Orbitron'] text-right drop-shadow-[0_0_30px_rgba(6,182,212,0.3)] mix-blend-overlay opacity-90 italic"
                 color1="text-cyan-500"
                 color2="text-pink-500"
               />
             </div>
          </div>
        </div>

        {/* Cyberpunk Card Overlay */}
        {selectedPlanet && loginVisible && !isZoomingIn && (
          <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
            <LoginCard 
              className="animate-in fade-in slide-in-from-right-20 duration-500" 
              onLogin={handleLogin}
              planet={selectedPlanet}
            />
          </div>
        )}
      </div>

    </div>
  );
}
