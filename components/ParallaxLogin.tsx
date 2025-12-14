"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import IconButton from "./IconButton";
import Loader from "./loader/Loader";
import { useCyberToast } from "@/components/toast";
import { sendOnboardingToWebhook, DEFAULT_AVATAR_URL } from "@/lib/api/onboarding";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { motion, AnimatePresence } from "framer-motion";
import { supabase, hasSupabaseCredentials } from "@/lib/supabase";

const CONFIG = {
    bgColor: 0x000000, // Pitch black
    gridColor: 0xff00ff,
    camStart: { x: 0, y: 3.2, z: 14 }
};

const FORM_STEPS = [
    {
        id: "callsign",
        label: "CALLSIGN",
        type: "text",
        placeholder: "ENTER ALIAS",
        hint: "Your handle in the neon mesh",
        pattern: /^.{3,}$/,
        errorMsg: "MIN LENGTH: 3 CHARS",
    },
    {
        id: "access_code",
        label: "ACCESS_CODE",
        type: "password",
        placeholder: "••••••••",
        hint: "Encrypted keyphrase (min 4 chars)",
        pattern: /^.{4,}$/,
        errorMsg: "SECURE CODE TOO SHORT",
    },
    {
        id: "quantum_mail",
        label: "QUANTUM_MAIL",
        type: "email",
        placeholder: "USER@VOID.NET",
        hint: "Uplink address (UPPERCASE PROTOCOL)",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
        errorMsg: "INVALID NETWORK SYNTAX",
    },
    {
        id: "home_sector",
        label: "HOME_SECTOR",
        type: "select",
        placeholder: "SELECT SECTOR",
        hint: "Pick your grid coordinate",
        options: [
            "SECTOR-7G",
            "NEON DOCKS",
            "KOWLOON NODE",
            "ORBITAL HAB-12",
            "DUST RING OUTPOST",
            "SYNTH CITY CORE",
        ],
        errorMsg: "SECTOR REQUIRED",
    },
    {
        id: "species_origin",
        label: "SPECIES_ORIGIN",
        type: "select",
        placeholder: "SELECT ORIGIN",
        hint: "Your manufacture / birth cluster",
        options: [
            "TERRA_PRIME",
            "MARS COLONY",
            "LUNAR ARC",
            "EUROPA VAULTS",
            "SYNTH FORGE",
            "UNKNOWN SIGNAL",
        ],
        errorMsg: "ORIGIN REQUIRED",
    },
    {
        id: "skills",
        label: "SKILLS",
        type: "multi-select",
        placeholder: "SELECT MODULES",
        hint: "Install your core modules (multi-select)",
        options: [
            "NETRUNNING",
            "MECH-ENGINEERING",
            "BIOHACKING",
            "COMBAT SIMS",
            "DIPLOMACY",
            "ASTRO-NAV",
        ],
        errorMsg: "SELECT AT LEAST 1 SKILL",
    },
    {
        id: "vibes",
        label: "VIBES",
        type: "multi-select",
        placeholder: "SELECT AURA",
        hint: "Signal your baseline aura (multi-select)",
        options: ["EDGY", "REBEL", "COLD", "CHAOTIC", "ZEN", "NEON ROMANTIC"],
        errorMsg: "SELECT AT LEAST 1 VIBE",
    },
    {
        id: "love_mood",
        label: "LOVE_MOOD",
        type: "multi-select",
        placeholder: "SELECT MOOD",
        hint: "Current heart firmware (multi-select)",
        options: ["CURIOUS", "DOMINANT", "STRATEGIC", "DETACHED", "PLAYFUL", "OBSESSED"],
        errorMsg: "SELECT AT LEAST 1 MOOD",
    },
    {
        id: "looking_for",
        label: "LOOKING_FOR",
        type: "multi-select",
        placeholder: "SELECT TARGET",
        hint: "Define the mission objective (multi-select)",
        options: [
            "CREW MEMBER",
            "PARTNER IN CRIME",
            "TEMP ALLIANCE",
            "LONG-HAUL CO-PILOT",
            "NEON DATE",
            "COFFEE IN THE VOID",
        ],
        errorMsg: "SELECT AT LEAST 1 OBJECTIVE",
    },
    {
        id: "age",
        label: "AGE",
        type: "number",
        placeholder: "25",
        hint: "Temporal signature (18+)",
        pattern: null,
        errorMsg: "",
    },
    {
        id: "height_cm",
        label: "HEIGHT_CM",
        type: "number",
        placeholder: "175",
        hint: "Chassis height in centimeters",
        pattern: /^(?:1[2-9]\d|2[0-4]\d|250)$/,
        errorMsg: "INVALID HEIGHT",
    },
    {
        id: "short_bio",
        label: "SHORT_BIO",
        type: "textarea",
        placeholder: "TRANSMIT A SHORT SIGNAL...",
        hint: "One line. No noise. Pure intent.",
        pattern: null,
        errorMsg: "",
    },
    {
        id: "avatar_select",
        label: "AVATAR_SELECT",
        type: "image-select",
        placeholder: "SELECT AVATAR",
        hint: "Choose your visual representation",
        options: ["/assets/images/wlop1.jpg", "/assets/images/wlop2.jpg", "/assets/images/wlop3.jpg", "/assets/images/wlop4.jpg"],
        errorMsg: "AVATAR SELECTION REQUIRED",
    },
];

const CAMERA_WAYPOINTS = [
    { pos: new THREE.Vector3(0, 3.2, 14), look: new THREE.Vector3(0, 2, 0) },     // 0: Start - Intro (Gate)
    { pos: new THREE.Vector3(0, 2, 5), look: new THREE.Vector3(0, 2, -10) },      // 1: Approach - Callsign (Main Street)
    { pos: new THREE.Vector3(-8, 2, 0), look: new THREE.Vector3(0, 2, -10) },     // 2: Left Side - Access Code (Looking Center)
    { pos: new THREE.Vector3(8, 4, -5), look: new THREE.Vector3(0, 1, -10) },     // 3: Right Mid - Quantum Mail (Looking Center)
    { pos: new THREE.Vector3(-6, 8, -15), look: new THREE.Vector3(5, 0, -5) },    // 4: Back Left High - Home Sector
    { pos: new THREE.Vector3(6, 3, -20), look: new THREE.Vector3(-5, 5, -5) },    // 5: Back Right Low - Species Origin (Looking Up)
    { pos: new THREE.Vector3(0, 1.5, -10), look: new THREE.Vector3(0, 15, -10) }, // 6: Center Ground - Skills (Looking Way Up)
    { pos: new THREE.Vector3(-10, 5, -5), look: new THREE.Vector3(10, 2, -15) },  // 7: Wide Left - Vibes
    { pos: new THREE.Vector3(10, 6, -10), look: new THREE.Vector3(-10, 2, 0) },   // 8: Wide Right - Love Mood
    { pos: new THREE.Vector3(0, 10, 0), look: new THREE.Vector3(0, 0, -20) },     // 9: High Front - Looking For (Looking Down)
    { pos: new THREE.Vector3(-5, 2, -18), look: new THREE.Vector3(0, 5, -10) },   // 10: Deep Alley - Age
    { pos: new THREE.Vector3(5, 8, 5), look: new THREE.Vector3(-5, 0, -15) },     // 11: Front Roof - Height
    { pos: new THREE.Vector3(0, 1.5, 2), look: new THREE.Vector3(0, 2, -20) },    // 12: Street Level - Short Bio (Classic View)
    { pos: new THREE.Vector3(0, 3, -5), look: new THREE.Vector3(0, 1, -15) },     // 13: Close Up - Avatar Select
    { pos: new THREE.Vector3(20, 20, 20), look: new THREE.Vector3(0, 0, -10) },   // 14: Isometric Final - Success
];

export default function ParallaxLogin({ onBack, isActive = true }: { onBack?: () => void, isActive?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const activeRef = useRef(isActive);
    const [minDelayDone, setMinDelayDone] = useState(false);
    const cyberToast = useCyberToast();
    const router = useRouter();
    
    // Form State
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [inputValue, setInputValue] = useState("");
    const [multiValue, setMultiValue] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const stepRef = useRef(0); // Sync for Three.js loop
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Keep activeRef in sync with prop for use inside the animation loop
    useEffect(() => {
        activeRef.current = isActive;
    }, [isActive]);

    // Enforce a minimum 4s "boot" simulation whenever this screen becomes active.
    useEffect(() => {
        if (!isActive) {
            setMinDelayDone(false);
            return;
        }

        setMinDelayDone(false);
        const t = window.setTimeout(() => setMinDelayDone(true), 4000);
        return () => window.clearTimeout(t);
    }, [isActive]);

    const createUserOnly = async (finalPayload: Record<string, any>) => {
        if (!supabase || !hasSupabaseCredentials) {
            throw new Error("Supabase not configured");
        }
        const username = (finalPayload.callsign || "user").toString();
        const password = (finalPayload.access_code || "TempPass!123").toString();
        // Supabase requires a valid-looking email; map username to a synthetic-but-valid domain
        const email = `${username.toLowerCase()}@cyberpunk.dev`;

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    alias: username,
                },
            },
        });
        if (authError) throw authError;

        return authData;
    };

    const handleNext = async () => {
        if (isSubmitting) return;
        const currentStepConfig = FORM_STEPS[currentStep];
        
        // Resolve current step value based on type
        const stepType = currentStepConfig.type;
        const value =
            stepType === "multi-select"
                ? multiValue
                : inputValue;

        const isEmpty =
            stepType === "multi-select"
                ? (multiValue?.length ?? 0) === 0
                : !inputValue;

        if (isEmpty) {
            setError(
                stepType === "image-select"
                    ? "SELECTION REQUIRED"
                    : stepType === "multi-select"
                    ? "SELECT AT LEAST 1"
                    : "INPUT REQUIRED"
            );
            return;
        }
        
        // Validate single-value steps with pattern (if provided)
        if (
            stepType !== "multi-select" &&
            currentStepConfig.pattern &&
            currentStepConfig.pattern instanceof RegExp &&
            !currentStepConfig.pattern.test(inputValue)
        ) {
            setError(currentStepConfig.errorMsg || "INVALID INPUT");
            return;
        }

        setError(null);

        const nextStep = currentStep + 1;
        const isLastStep = nextStep === FORM_STEPS.length;

        // Build the final payload (includes the value for this step)
        const finalPayload = { ...formData, [FORM_STEPS[currentStep].id]: value };

        if (isLastStep) {
            // Save profile data locally for usage in the app
            if (typeof window !== "undefined") {
                localStorage.setItem("user_profile", JSON.stringify(finalPayload));
                localStorage.setItem("user_avatar", finalPayload.avatar_select);
            }

            setIsSubmitting(true);
            cyberToast.show("UPLINKING CREDENTIALS...", "info");

            try {
                // 1) Create Supabase auth user (optional - skip if not configured)
                if (supabase && hasSupabaseCredentials) {
                    try {
                        await createUserOnly(finalPayload);
                    } catch (supabaseError) {
                        // Log but don't block onboarding if Supabase fails
                        console.warn("Supabase user creation failed:", supabaseError);
                        cyberToast.show("WARNING: AUTH SYNC SKIPPED", "info");
                    }
                } else {
                    console.warn("Supabase not configured - skipping user creation");
                }

                // 2) Fire webhook (optional external logging)
                try {
                    await sendOnboardingToWebhook(finalPayload);
                } catch (webhookError) {
                    // Log but don't block onboarding if webhook fails
                    console.warn("Webhook failed:", webhookError);
                }

                cyberToast.show("DATASTREAM SYNCED", "success");
            } catch (e) {
                const msg = e instanceof Error ? e.message : "ONBOARDING FAILED";
                cyberToast.show(`CRITICAL FAILURE: ${msg}`, "error");
                setIsSubmitting(false);
                return; // stay on this step
            }

            setIsSubmitting(false);
        }

        setFormData(finalPayload);
        setInputValue("");
        setMultiValue([]);

        setCurrentStep(nextStep);
        stepRef.current = nextStep;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') void handleNext();
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        
        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.bgColor);
        // IMPORTANT:
        // FogExp2 at large distances will completely erase a sky-sphere unless the sky ignores fog.
        // We'll keep a gentle fog for the city, and explicitly disable fog on the sky materials below.
        scene.fog = new THREE.FogExp2(CONFIG.bgColor, 0.012);

        // Increase far plane to support a large sky sphere
        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(CONFIG.camStart.x, CONFIG.camStart.y, CONFIG.camStart.z);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // Slightly lower exposure so the galaxy texture doesn't blow out
        renderer.toneMappingExposure = 1.05;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // --- SKY SPHERE (Galaxy + nebula overlay) ---
        // Put the scene "inside" a big sphere and render galaxy textures on the inside.
        const textureLoader = new THREE.TextureLoader();
        const starTexture = textureLoader.load("/textures/8k_stars.jpg");
        const nebulaTexture = textureLoader.load("/textures/stars.png");
        starTexture.colorSpace = THREE.SRGBColorSpace;
        nebulaTexture.colorSpace = THREE.SRGBColorSpace;

        const skyGroup = new THREE.Group();
        scene.add(skyGroup);

        const skyGeo = new THREE.SphereGeometry(1200, 64, 64);
        const starMat = new THREE.MeshBasicMaterial({
            map: starTexture,
            side: THREE.BackSide,
            toneMapped: false,
            color: new THREE.Color(1.6, 1.6, 1.6), // brighten without affecting exposure
        });
        // Don't fog the sky (this is what was making it look like nothing was there)
        starMat.fog = false;
        const starSky = new THREE.Mesh(skyGeo, starMat);
        starSky.frustumCulled = false;
        skyGroup.add(starSky);

        const nebulaGeo = new THREE.SphereGeometry(1185, 64, 64);
        const nebulaMat = new THREE.MeshBasicMaterial({
            map: nebulaTexture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            toneMapped: false,
            color: new THREE.Color(1.2, 1.2, 1.6),
        });
        nebulaMat.fog = false;
        const nebulaSky = new THREE.Mesh(nebulaGeo, nebulaMat);
        nebulaSky.frustumCulled = false;
        skyGroup.add(nebulaSky);
        
        // --- LIGHTING ---
        // Balanced lighting so the city is lit, but the sky is still visible
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        // Key light to illuminate building faces
        const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
        mainLight.position.set(10, 20, 20);
        mainLight.castShadow = true;
        scene.add(mainLight);

        // Fill light (blue-ish)
        const fillLight = new THREE.DirectionalLight(0x88aaff, 1.0);
        fillLight.position.set(-10, 10, -10);
        scene.add(fillLight);


        // --- TERRAIN (Procedural) ---
        // Generate subtle terrain, but keep a flat city pad so the city doesn't look like it's floating.
        const simplex = new SimplexNoise();
        const terrainGeo = new THREE.PlaneGeometry(900, 900, 180, 180);
        const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
        const v = new THREE.Vector3();

        // City pad centered around (x=0, z=-10) in world-space.
        // The terrain geometry is built in local X/Y. We'll bias the "city center" by shifting the sample coords.
        const cityCenter = new THREE.Vector2(0, -10);
        const cityRadius = 55;
        const transition = 45;
        const baseHeight = -2.25;

        for (let i = 0; i < posAttr.count; i++) {
            v.fromBufferAttribute(posAttr, i);
            // v.x, v.y correspond to world x and world z after rotation.
            const dx = v.x - cityCenter.x;
            const dz = v.y - cityCenter.y;
            const dist = Math.sqrt(dx * dx + dz * dz);

            const n1 = simplex.noise(v.x * 0.008, v.y * 0.008) * 18;
            const n2 = simplex.noise(v.x * 0.02, v.y * 0.02) * 6;
            const n3 = simplex.noise(v.x * 0.06, v.y * 0.06) * 2;
            const raw = n1 + n2 + n3;

            let h = raw * 0.35 + baseHeight;
            if (dist < cityRadius) {
                h = baseHeight; // perfectly flat under the city
            } else if (dist < cityRadius + transition) {
                const t = (dist - cityRadius) / transition;
                const smoothT = t * t * (3 - 2 * t);
                h = THREE.MathUtils.lerp(baseHeight, raw * 0.35 + baseHeight, smoothT);
            }

            posAttr.setZ(i, h);
        }

        terrainGeo.computeVertexNormals();

        const terrainMat = new THREE.MeshStandardMaterial({
            color: 0x050510,
            roughness: 0.95,
            metalness: 0.15,
        });
        const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
        terrainMesh.rotation.x = -Math.PI / 2;
        terrainMesh.receiveShadow = true;
        scene.add(terrainMesh);

        // Flat city pad plane (small offset so the city feels grounded, not floating)
        const cityPadGeo = new THREE.PlaneGeometry(150, 150, 1, 1);
        const cityPadMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a12,
            roughness: 0.35,
            metalness: 0.7,
            emissive: new THREE.Color(0x000000),
            emissiveIntensity: 0.0,
        });
        const cityPad = new THREE.Mesh(cityPadGeo, cityPadMat);
        cityPad.rotation.x = -Math.PI / 2;
        cityPad.position.set(0, baseHeight + 0.06, -10);
        cityPad.receiveShadow = true;
        scene.add(cityPad);

        // --- BUILDINGS (GLB Model) ---
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('/cyberpunk_city_-_1.glb', (gltf) => {
            const model = gltf.scene;
            // Adjust scale and position to fit the scene
            model.scale.set(3, 3, 3); 
            // Slightly above the pad to avoid z-fighting
            model.position.set(0, baseHeight + 0.12, -10);
            
            model.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Boost emissive materials if they exist
                    const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                    if (mat) {
                        mat.envMapIntensity = 1.0; // React to environment
                        if (mat.emissive && mat.emissiveIntensity !== undefined) {
                            mat.emissiveIntensity = 3.0; // Stronger glow
                        }
                    }
                }
            });
            scene.add(model);
            setLoading(false);
        }, undefined, (error) => {
            console.error('An error happened loading the model:', error);
            setLoading(false);
        });

        let terrain: THREE.Object3D | null = cityPad; // Use the city pad for raycasting

        // --- POST PROCESSING ---
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.7;
        bloomPass.strength = 0.35;
        bloomPass.radius = 0.45;
        composer.addPass(bloomPass);

        const GrainShader = {
            uniforms: {
                "tDiffuse": { value: null },
                "amount": { value: 0.05 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform float amount;
                uniform sampler2D tDiffuse;
                varying vec2 vUv;
                
                float random( vec2 p ) {
                    vec2 K1 = vec2(
                        23.14069263277926,
                        2.665144142690225
                    );
                    return fract( cos( dot(p,K1) ) * 12345.6789 );
                }

                void main() {
                    vec4 color = texture2D( tDiffuse, vUv );
                    vec2 uvRandom = vUv;
                    uvRandom.y *= random(vec2(uvRandom.y, amount));
                    color.rgb += random(uvRandom) * amount;
                    gl_FragColor = vec4( color  );
                }
            `
        };

        const grainPass = new ShaderPass(GrainShader);
        grainPass.uniforms["amount"].value = 0.04;
        composer.addPass(grainPass);

        const BlueToneShader = {
            uniforms: {
                "tDiffuse": { value: null },
                "strength": { value: 0.55 },
                "brightness": { value: 1.1 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float strength;
                uniform float brightness;
                varying vec2 vUv;

                void main() {
                    vec4 color = texture2D( tDiffuse, vUv );
                    // Cyberpunk tint: push towards blue/magenta
                    vec3 tint = vec3(0.6, 0.2, 1.0); 
                    color.rgb = mix(color.rgb, color.rgb * tint, strength * 0.3);
                    color.rgb *= brightness;
                    gl_FragColor = vec4( color.rgb, color.a );
                }
            `
        };

        const blueTonePass = new ShaderPass(BlueToneShader);
        composer.addPass(blueTonePass);

        // --- ANIMATION & INTERACTION ---
        const clock = new THREE.Clock();
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(-999, -999);
        const hoverPoint = new THREE.Vector3(0, 0, 0);
        const cameraLookTarget = new THREE.Vector3(0, 1.2, 0);

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Optimization: Skip rendering if not active/visible
            if (!activeRef.current) return;
            
            const time = clock.getElapsedTime();

            // Keep sky centered on the camera so it feels like an "inside a sphere" environment
            skyGroup.position.copy(camera.position);

            // Camera Animation Logic (Travel through city)
            // Interpolate base position based on current step
            const currentWaypointIndex = Math.min(stepRef.current, CAMERA_WAYPOINTS.length - 1);
            const targetWaypoint = CAMERA_WAYPOINTS[currentWaypointIndex];
            
            // Smoothly lerp base camera position towards waypoint
            camera.position.lerp(targetWaypoint.pos, 0.03);
            
            // Calculate parallax offset
            const parallaxX = (mouse.x * 1.5);
            const parallaxY = (mouse.y * 1.0);
            
            // Apply parallax on top of the lerped position (we add it to the current position loosely)
            // To do this cleanly without drifting, we should track "basePosition" separately, 
            // but for simplicity we can just nudge the lerped result.
            // A better way: camera.position is the "current actual". We want it to go to targetWaypoint.pos + parallax.
            
            const finalTargetX = targetWaypoint.pos.x + parallaxX;
            const finalTargetY = targetWaypoint.pos.y + parallaxY;
            const finalTargetZ = targetWaypoint.pos.z;

            // Soften the arrival
            camera.position.x += (finalTargetX - camera.position.x) * 0.05;
            camera.position.y += (finalTargetY - camera.position.y) * 0.05;
            // Z is handled primarily by the lerp above, but we can refine:
            camera.position.z += (finalTargetZ - camera.position.z) * 0.03;

            // Look target interpolation
            cameraLookTarget.lerp(targetWaypoint.look, 0.04);
            
            // Add subtle mouse influence to look target
            const mouseLookOffset = new THREE.Vector3(mouse.x * 2, mouse.y * 2, 0);
            const finalLookTarget = cameraLookTarget.clone().add(mouseLookOffset);
            
            camera.lookAt(finalLookTarget);
            
            // Interactive lighting (removed spotLight target since spotLight is gone)
            raycaster.setFromCamera(mouse, camera);
            
            composer.render();
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            container.removeChild(renderer.domElement);
            renderer.dispose();
            // Optional: cleanup geometries/materials if needed
        };
    }, []);

    const showLoader = isActive && (!minDelayDone || loading);
    const [connectionProgress, setConnectionProgress] = useState(0);
    const [dataStreamIds] = useState(() => 
        Array.from({length: 4}, () => Math.random().toString(16).slice(2,8).toUpperCase())
    );

    // Update connection progress when submitting
    useEffect(() => {
        if (!isSubmitting) {
            setConnectionProgress(0);
            return;
        }
        
        const interval = setInterval(() => {
            setConnectionProgress((prev) => {
                if (prev >= 100) return 100;
                return Math.min(prev + Math.random() * 20, 100);
            });
        }, 150);

        return () => clearInterval(interval);
    }, [isSubmitting]);

    // Add CSS animations for cyberpunk loader
    useEffect(() => {
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
            @keyframes progress-scan {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes spin {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .clip-text {
                clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
        `;
        document.head.appendChild(style);
        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    return (
        <div className="absolute inset-0 z-50 bg-[#050510] text-white font-mono">
            {showLoader && <Loader warningText="CAUTION, DO NOT TURN OFF." />}
            
            <div ref={containerRef} className="absolute inset-0 z-0" />

            {/* Cyberpunk Supabase Connection Loader */}
            {isSubmitting && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050510]/95 backdrop-blur-sm overflow-hidden">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ 
                            backgroundImage: "linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)", 
                            backgroundSize: "50px 50px" 
                        }}
                    />
                    
                    {/* Scanning Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent absolute top-1/3 animate-[scan_3s_linear_infinite] opacity-30"></div>
                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent absolute top-2/3 animate-[scan_3s_linear_infinite] opacity-30" style={{ animationDelay: '1.5s' }}></div>
                    </div>

                    {/* Main Loading Container */}
                    <div className="relative z-10 w-full max-w-xl mx-auto px-8">
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-12 h-[2px] bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
                        <div className="absolute top-0 left-0 w-[2px] h-12 bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
                        <div className="absolute top-0 right-0 w-12 h-[2px] bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
                        <div className="absolute top-0 right-0 w-[2px] h-12 bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-[2px] bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
                        <div className="absolute bottom-0 left-0 w-[2px] h-12 bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-[2px] bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
                        <div className="absolute bottom-0 right-0 w-[2px] h-12 bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>

                        {/* Title */}
                        <div className="text-center mb-8">
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter font-['Orbitron'] drop-shadow-[0_0_30px_rgba(34,211,238,0.5)] mb-3">
                                <span className="relative inline-block">
                                    <span className="relative z-10">UPLINKING</span>
                                    <span className="absolute top-0 left-0 -z-10 w-full h-full text-cyan-500 opacity-70 animate-[glitch-1_2.5s_infinite_linear_alternate-reverse] clip-text">UPLINKING</span>
                                    <span className="absolute top-0 left-0 -z-10 w-full h-full text-pink-500 opacity-70 animate-[glitch-2_3s_infinite_linear_alternate-reverse] clip-text">UPLINKING</span>
                                </span>
                            </h2>
                            <p className="text-cyan-400 font-mono text-sm md:text-base tracking-[0.3em] font-bold">
                                SYNCING WITH SUPABASE CORE...
                            </p>
                        </div>

                        {/* Progress Container */}
                        <div className="bg-black/40 backdrop-blur-sm p-6 border border-cyan-500/30 border-l-4 border-l-cyan-500 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-cyan-500 font-mono text-xs font-bold tracking-widest">CONNECTION_STATUS</span>
                                <span className="text-cyan-400/60 font-mono text-xs">
                                    {Math.floor(connectionProgress)}%
                                </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="h-2 bg-cyan-900/30 overflow-hidden border border-cyan-500/30 relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500"
                                    style={{ 
                                        width: `${connectionProgress}%`,
                                        backgroundSize: '200% 100%',
                                        animation: 'progress-scan 2s ease-in-out infinite',
                                        transition: 'width 0.3s ease-out'
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[scan_3s_linear_infinite]"></div>
                            </div>
                        </div>

                        {/* Data Stream */}
                        <div className="bg-black/40 backdrop-blur-sm p-4 border border-cyan-500/20 border-l-4 border-l-cyan-500 mb-6">
                            <div className="text-cyan-500 font-bold text-xs mb-3 tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></div>
                                AUTH_STREAM_INCOMING
                            </div>
                            <div className="space-y-1 font-mono text-[10px] text-cyan-400/60">
                                {dataStreamIds.map((id, i) => {
                                    const completed = Math.floor((connectionProgress / 100) * 4);
                                    const status = i < completed ? 'OK' : i === completed ? 'SYNCING' : 'PENDING';
                                    const statusColor = status === 'OK' ? 'text-green-400' : status === 'SYNCING' ? 'text-cyan-400' : 'text-cyan-400/40';
                                    return (
                                        <div key={i} className={`truncate ${statusColor}`}>
                                            {`> 0x${id}_AUTH_${String(i).padStart(2, '0')} [${status}]`}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/30 backdrop-blur-sm p-3 border border-cyan-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
                                    <span className="text-[9px] text-cyan-400 font-mono tracking-wider">DATABASE</span>
                                </div>
                                <span className="text-cyan-300 font-mono text-xs font-bold">
                                    {connectionProgress > 30 ? 'CONNECTED' : 'CONNECTING'}
                                </span>
                            </div>
                            <div className="bg-black/30 backdrop-blur-sm p-3 border border-pink-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-pink-400 animate-pulse shadow-[0_0_8px_#ec4899]"></div>
                                    <span className="text-[9px] text-pink-400 font-mono tracking-wider">AUTH</span>
                                </div>
                                <span className="text-pink-300 font-mono text-xs font-bold">
                                    {connectionProgress > 60 ? 'AUTHENTICATED' : 'AUTHENTICATING'}
                                </span>
                            </div>
                            <div className="bg-black/30 backdrop-blur-sm p-3 border border-cyan-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
                                    <span className="text-[9px] text-cyan-400 font-mono tracking-wider">PROFILE</span>
                                </div>
                                <span className="text-cyan-300 font-mono text-xs font-bold">
                                    {connectionProgress > 80 ? 'SYNCED' : 'SYNCING'}
                                </span>
                            </div>
                            <div className="bg-black/30 backdrop-blur-sm p-3 border border-pink-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-pink-400 animate-pulse shadow-[0_0_8px_#ec4899]"></div>
                                    <span className="text-[9px] text-pink-400 font-mono tracking-wider">STATUS</span>
                                </div>
                                <span className="text-pink-300 font-mono text-xs font-bold">
                                    {connectionProgress >= 100 ? 'READY' : 'PROCESSING'}
                                </span>
                            </div>
                        </div>

                        {/* Rotating Ring Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none -z-10">
                            <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#0ff]"></div>
                            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Only render UI when active to prevent blocking interactions in SolarSystem */}
            <div className={`absolute inset-0 z-10 pointer-events-none ${isActive && !showLoader ? '' : 'hidden'}`}>
                 {/* Back Button */}
                 <div className="absolute bottom-10 left-10 pointer-events-auto">
                     {onBack && (
                        <button 
                          suppressHydrationWarning
                          onClick={onBack} 
                          className="hover:scale-110 transition-transform cursor-pointer p-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:border-cyan-500/50"
                        >
                            <ArrowLeft size={24} />
                        </button>
                     )}
                 </div>

                 {/* Cyberpunk Form Overlay */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full max-w-md pointer-events-auto">
                        <AnimatePresence mode="wait">
                            {currentStep < FORM_STEPS.length ? (
                                <motion.div
                                    key={FORM_STEPS[currentStep].id}
                                    initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="bg-[#0a0a0f]/60 backdrop-blur-xl p-8 relative overflow-visible w-full max-w-lg mx-auto"
                                >
                                    <div className="absolute inset-0 pointer-events-none z-0">
                                         <svg className="w-full h-full overflow-visible">
                                            <rect
                                                x="0" y="0" width="100%" height="100%"
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
                                    
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-white tracking-[0.2em] glitch-text" data-text="IASTROMATCH"> 
                                                 IASTROMATCH
                                            </h2>
                                            <p className="text-[10px] text-cyan-500/70 font-mono mt-1 tracking-wider">
                                                INITIALIZING LOVE PROTOCOLS
                                            </p>
                                        </div>
                                        <div className="text-right">
                                             <span className="text-2xl font-bold text-white/90 font-mono">
                                                {String(currentStep + 1).padStart(2, "0")}
                                            </span>
                                            <span className="text-white/30 text-xs font-mono ml-1">
                                                / {String(FORM_STEPS.length).padStart(2, "0")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Input Area */}
                                    <div className="mb-2">
                                        <label className="block text-cyan-400 font-mono text-sm tracking-[0.2em] font-bold mb-2">
                                            {FORM_STEPS[currentStep].label}
                                        </label>
                                        
                                        <div className="relative group mb-6">
                                            {FORM_STEPS[currentStep].type === 'image-select' ? (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {FORM_STEPS[currentStep].options?.map((imgSrc, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => {
                                                                setInputValue(imgSrc);
                                                                if (error) setError(null);
                                                            }}
                                                            className={`relative group/img overflow-hidden border-2 transition-all duration-300 ${
                                                                inputValue === imgSrc 
                                                                    ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-105' 
                                                                    : 'border-white/10 hover:border-white/50 hover:scale-105'
                                                            }`}
                                                        >
                                                            <div className="aspect-square relative">
                                                                <img 
                                                                    src={imgSrc} 
                                                                    alt={`Avatar ${idx + 1}`}
                                                                    className="w-full h-full object-cover" 
                                                                />
                                                                {/* Overlay Effect */}
                                                                <div className={`absolute inset-0 bg-cyan-500/20 mix-blend-overlay transition-opacity ${inputValue === imgSrc ? 'opacity-100' : 'opacity-0 group-hover/img:opacity-100'}`} />
                                                                
                                                                {/* Selection Check */}
                                                                {inputValue === imgSrc && (
                                                                    <div className="absolute top-2 right-2 bg-cyan-500 rounded-full p-1">
                                                                        <Check size={12} className="text-black" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : FORM_STEPS[currentStep].type === "select" ? (
                                                <div className="relative group">
                                                    <select
                                                        value={inputValue}
                                                        onChange={(e) => {
                                                            setInputValue(e.target.value);
                                                            if (error) setError(null);
                                                        }}
                                                        className={`w-full appearance-none bg-gradient-to-r from-[#0b0f1e] via-[#0f1428] to-[#0b0f1e] border ${error ? 'border-red-500/50' : 'border-white/15'} text-white font-mono text-base py-4 px-4 pr-12 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_25px_rgba(34,211,238,0.25)] transition-all uppercase tracking-[0.18em] rounded`}
                                                    >
                                                        <option value="" disabled className="text-white/40">
                                                            {FORM_STEPS[currentStep].placeholder}
                                                        </option>
                                                        {FORM_STEPS[currentStep].options?.map((opt, idx) => (
                                                            <option key={idx} value={opt} className="bg-[#0b0f1e] text-white uppercase">
                                                                {opt}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-200 text-xs font-black tracking-[0.2em] group-focus-within:border-cyan-300 group-focus-within:text-cyan-100">
                                                            ▼
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : FORM_STEPS[currentStep].type === "multi-select" ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {FORM_STEPS[currentStep].options?.map((opt, idx) => {
                                                        const selected = multiValue.includes(opt);
                                                        return (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => {
                                                                    setMultiValue((prev) =>
                                                                        prev.includes(opt)
                                                                            ? prev.filter((x) => x !== opt)
                                                                            : [...prev, opt]
                                                                    );
                                                                    if (error) setError(null);
                                                                }}
                                                                className={`border px-3 py-3 text-left font-mono text-xs tracking-widest transition-all ${
                                                                    selected
                                                                        ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_18px_rgba(6,182,212,0.35)]"
                                                                        : "border-white/10 bg-black/40 hover:border-white/40"
                                                                }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : FORM_STEPS[currentStep].type === "textarea" ? (
                                                <textarea
                                                    value={inputValue}
                                                    onChange={(e) => {
                                                        // keep cyber uppercase look for non-email/password; short bio can be uppercase too
                                                        setInputValue(e.target.value.toUpperCase());
                                                        if (error) setError(null);
                                                    }}
                                                    placeholder={FORM_STEPS[currentStep].placeholder}
                                                    rows={4}
                                                    className={`w-full bg-black/50 border ${error ? 'border-red-500/50' : 'border-white/10'} text-white font-mono text-sm py-4 px-4 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/10 transition-all placeholder:text-white/10 uppercase resize-none`}
                                                />
                                            ) : (
                                                <>
                                                    <input
                                                        type={FORM_STEPS[currentStep].type}
                                                        value={inputValue}
                                                        onChange={(e) => {
                                                            const t = FORM_STEPS[currentStep].type;
                                                            // Email must be uppercase. Password stays as typed.
                                                            const shouldUppercase = t !== "password";
                                                            setInputValue(shouldUppercase ? e.target.value.toUpperCase() : e.target.value);
                                                            if (error) setError(null);
                                                        }}
                                                        onKeyDown={handleKeyDown}
                                                        placeholder={FORM_STEPS[currentStep].placeholder}
                                                        // Ensure email/password are never forced to uppercase visually.
                                                        className={`w-full bg-black/50 border ${error ? 'border-red-500/50' : 'border-white/10'} text-white font-mono text-xl py-4 px-4 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/10 transition-all placeholder:text-white/10 ${FORM_STEPS[currentStep].type === "password" ? "normal-case" : "uppercase"}`}
                                                        autoCapitalize={FORM_STEPS[currentStep].type === "email" || FORM_STEPS[currentStep].type === "password" ? "none" : undefined}
                                                        autoCorrect={FORM_STEPS[currentStep].type === "email" || FORM_STEPS[currentStep].type === "password" ? "off" : undefined}
                                                        spellCheck={FORM_STEPS[currentStep].type === "email" || FORM_STEPS[currentStep].type === "password" ? false : undefined}
                                                        autoFocus
                                                    />
                                                    
                                                    {/* Corner accents on input */}
                                                    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${error ? 'border-red-500' : 'border-white/30 group-focus-within:border-cyan-500'} transition-colors`} />
                                                    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${error ? 'border-red-500' : 'border-white/30 group-focus-within:border-cyan-500'} transition-colors`} />
                                                </>
                                            )}

                                            {/* Error Message */}
                                            <AnimatePresence>
                                                {error && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, x: 20 }}
                                                        animate={{ opacity: 1, y: 0, x: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute -bottom-6 right-0 text-red-500 text-[10px] font-mono font-bold tracking-wider flex items-center gap-2"
                                                    >
                                                        <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-sm animate-pulse shadow-[0_0_10px_#ef4444]" />
                                                        {error}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        
                                        <p className="mt-2 text-xs text-white/40 font-mono flex items-center gap-2">
                                            <span className="inline-block w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                                            {FORM_STEPS[currentStep].hint}
                                        </p>
                                    </div>

                                    {/* Footer / Button */}
                                    <div className="mt-8">
                                        <IconButton 
                                            text="ENGAGE_" 
                                            onClick={handleNext} 
                                            disabled={
                                                isSubmitting ||
                                                (() => {
                                                    const t = FORM_STEPS[currentStep].type;
                                                    if (t === "multi-select") return (multiValue?.length ?? 0) === 0;
                                                    return !inputValue;
                                                })()
                                            }
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center w-full"
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-green-500 text-green-500 mb-6 bg-green-500/10 backdrop-blur-sm shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                        <Check size={40} />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white font-mono tracking-widest mb-8">MATCH PROTOCOL ACTIVE</h2>
                                    
                                    <IconButton 
                                        text="WELCOME TO THE GALAXY_" 
                                        onClick={() => router.push("/profiles/swipe")}
                                        className="cursor-pointer"
                                        disabled={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                 </div>
            </div>
        </div>
    );
}
