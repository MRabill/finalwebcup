"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Glitch } from "@react-three/postprocessing";
import * as THREE from "three";
import { X, Heart, XCircle, Aperture, Activity, Radio, Crosshair } from "lucide-react";
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
}

const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    size: 0.38,
    dist: 7,
    speed: 0.004,
    initialAngle: 0,
    texture: "/textures/mercury.jpg",
    type: "planet",
    description: "Small, fast, and hot. I like to keep things moving. No baggage (moons).",
    temp: "167°C",
    dayLength: "1,408h",
    age: "4.5B",
    moons: []
  },
  {
    name: "Venus",
    size: 0.9,
    dist: 11,
    speed: 0.0016,
    initialAngle: 4.8,
    texture: "/textures/venus.jpg",
    type: "planet",
    description: "I'm toxic but beautiful. I radiate heat and shine brighter than anyone else.",
    temp: "464°C",
    dayLength: "5,832h",
    age: "4.5B",
    moons: []
  },
  {
    name: "Earth",
    size: 1,
    dist: 15,
    speed: 0.001,
    initialAngle: 3.45,
    texture: "/textures/earth.jpg",
    type: "planet",
    description: "The only one with life (that we know of). I have water, cats, and memes.",
    temp: "15°C",
    dayLength: "24h",
    age: "4.5B",
    moons: [
      { name: "Moon", size: 0.27, dist: 2.5, speed: 0.037, initialAngle: 1.2, color: "#888888" }
    ]
  },
  {
    name: "Mars",
    size: 0.8,
    dist: 19,
    speed: 0.00053,
    initialAngle: 0.9,
    texture: "/textures/mars.jpg",
    type: "planet",
    description: "A bit rusty, but I have great potential. Looking for someone to colonize me.",
    temp: "-65°C",
    dayLength: "25h",
    age: "4.6B",
    moons: [
      { name: "Phobos", size: 0.05, dist: 1.5, speed: 0.32, color: "#664222" },
      { name: "Deimos", size: 0.03, dist: 2.2, speed: 0.08, color: "#664222" }
    ]
  },
  {
    name: "Jupiter",
    size: 2.5,
    dist: 25,
    speed: 0.000084,
    initialAngle: 2.7,
    texture: "/textures/jupiter.jpg",
    type: "planet",
    description: "Big personality. I protect the inner planets. King of the solar system.",
    temp: "-110°C",
    dayLength: "10h",
    age: "4.6B",
    moons: [
      { name: "Io", size: 0.15, dist: 3.5, speed: 0.56, color: "#FFFF99" },
      { name: "Europa", size: 0.13, dist: 4.2, speed: 0.28, color: "#87CEEB" },
      { name: "Ganymede", size: 0.22, dist: 5.1, speed: 0.14, color: "#8C7D6B" },
      { name: "Callisto", size: 0.20, dist: 6.0, speed: 0.06, color: "#696969" }
    ]
  },
  {
    name: "Saturn",
    size: 2.0,
    dist: 31,
    speed: 0.000034,
    initialAngle: 5.8,
    texture: "/textures/saturn.jpg",
    hasRings: true,
    type: "planet",
    description: "Put a ring on it? I already have thousands. The jewel of the cosmos.",
    temp: "-140°C",
    dayLength: "10.7h",
    age: "4.5B",
    moons: [
        { name: "Titan", size: 0.21, dist: 5.5, speed: 0.063, color: "#FFa500" }
    ]
  },
  {
    name: "Uranus",
    size: 1.2,
    dist: 37,
    speed: 0.000012,
    initialAngle: 1.2,
    texture: "/textures/uranus.jpg",
    type: "planet",
    description: "I spin differently. Ice cold demeanor, but chill once you get to know me.",
    temp: "-195°C",
    dayLength: "17h",
    age: "4.5B",
    moons: []
  },
  {
    name: "Neptune",
    size: 1.1,
    dist: 42,
    speed: 0.0000061,
    initialAngle: 6.1,
    texture: "/textures/neptune.jpg",
    type: "planet",
    description: "Mysterious, distant, and windy. I love long drifts in the dark.",
    temp: "-200°C",
    dayLength: "16h",
    age: "4.5B",
    moons: [
        { name: "Triton", size: 0.11, dist: 3.0, speed: 0.17, color: "#87CEEB" }
    ]
  }
];

// --- Components ---

function UniverseBackground({ onBackgroundClick }: { onBackgroundClick?: () => void }) {
  const [starTexture, skyTexture] = useLoader(THREE.TextureLoader, [
    "/textures/8k_stars.jpg",
    "/textures/stars.png"
  ]);

  return (
    <group onClick={(e) => {
      // @ts-ignore
      if (e.delta > 5) return;
      onBackgroundClick && onBackgroundClick();
    }}>
      <mesh>
        <sphereGeometry args={[400, 64, 64]} />
        <meshBasicMaterial 
          map={starTexture} 
          side={THREE.BackSide} 
          toneMapped={false}
          color={new THREE.Color(1.2, 1.2, 1.2)}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[390, 64, 64]} />
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

  return (
    <group>
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
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


function LoginCard({ className = "", onLogin }: { className?: string, onLogin: () => void }) {
  const [mode, setMode] = useState<"choice" | "signin" | "signup">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<{ field: "email" | "password" | "global"; msg: string } | null>(null);

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
      className={`bg-[#0a0a0f]/60 backdrop-blur-xl p-8 relative overflow-visible w-[350px] md:w-[400px] ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
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
      <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4 relative z-10">
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
          <sphereGeometry args={[data.size, 32, 32]} />
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
      <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1 font-mono flex justify-between">
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
  const planetRefs = useRef<{[key: string]: THREE.Group}>({});

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
      @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
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
    setIsZoomingIn(true);
    setLoginVisible(false); // Hide the card during zoom
    // Let the zoom kick in, then route away
    setTimeout(() => {
      onLogin();
    }, 900);
  };

  return (
    <div className="w-full h-screen bg-[#000814] relative font-['Orbitron',_sans-serif] overflow-hidden">
      
      {/* Solar System Layer */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{ position: [0, 10, 45], fov: 45 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
        >
          <UniverseBackground onBackgroundClick={() => setSelectedPlanet(null)} />
          <ambientLight intensity={0.1} />
          <Sun />
          
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
            <Bloom 
              luminanceThreshold={0.05} 
              mipmapBlur 
              intensity={2.0} 
              radius={0.7} 
            />
            <Glitch 
              delay={new THREE.Vector2(5.0, 10.0)} // min and max delay between glitches
              duration={new THREE.Vector2(0.3, 0.6)} // min and max duration of a glitch
              strength={new THREE.Vector2(0.3, 0.8)} // min and max strength
              mode={1} // GlitchMode.SPORADIC
              active // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
              ratio={0.85} // Threshold for strong glitches
            />
          </EffectComposer>
        </Canvas>
      
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
             <div className="relative mb-4 ml-2">
               <div className="flex gap-8 text-white/50 font-mono text-xs backdrop-blur-sm p-4 rounded border border-white/5 bg-black/20">
                  <div className="flex flex-col">
                     <span className="text-pink-500 text-[20px] mb-1 font-bold tracking-widest">POS_X</span>
                     <RandomCharacters length={6} className="text-[20px] text-white/80 leading-none" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-cyan-500 text-[20px] mb-1 font-bold tracking-widest">POS_Y</span>
                     <RandomCharacters length={6} className="text-[20px] text-white/80 leading-none" />
                  </div>
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
            />
          </div>
        )}
      </div>

    </div>
  );
}
