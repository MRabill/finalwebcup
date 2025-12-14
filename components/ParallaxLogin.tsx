"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Check } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { motion, AnimatePresence } from "framer-motion";

const CONFIG = {
    bgColor: 0x000000, // Pitch black
    gridColor: 0xff00ff,
    camStart: { x: 0, y: 3.2, z: 14 }
};

const FORM_STEPS = [
    { id: 'codename', label: 'CODENAME', type: 'text', placeholder: 'ENTER ALIAS' },
    { id: 'access_key', label: 'ACCESS_KEY', type: 'password', placeholder: '••••••••' },
    { id: 'neural_link', label: 'NEURAL_LINK', type: 'email', placeholder: 'USER@NET.IO' },
    { id: 'sector', label: 'SECTOR_ID', type: 'text', placeholder: 'SEC-09' },
    { id: 'origin', label: 'ORIGIN', type: 'text', placeholder: 'SYSTEM_ROOT' }
];

const CAMERA_WAYPOINTS = [
    { pos: new THREE.Vector3(0, 3.2, 14), look: new THREE.Vector3(0, 2, 0) },    // Start
    { pos: new THREE.Vector3(0, 2, 8), look: new THREE.Vector3(0, 1, -5) },      // Step 1: Approach
    { pos: new THREE.Vector3(-4, 1.5, 2), look: new THREE.Vector3(2, 1, -10) },  // Step 2: Left Alley
    { pos: new THREE.Vector3(4, 3, -6), look: new THREE.Vector3(-2, 0, -15) },   // Step 3: Right High
    { pos: new THREE.Vector3(0, 6, -2), look: new THREE.Vector3(0, 2, -20) },    // Step 4: Inside City (Safe Mid-Level)
    { pos: new THREE.Vector3(20, 25, 10), look: new THREE.Vector3(0, -5, -10) },  // Step 5: Isometric View
];

export default function ParallaxLogin({ onBack, isActive = true }: { onBack?: () => void, isActive?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const activeRef = useRef(isActive);
    
    // Form State
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [inputValue, setInputValue] = useState("");
    const stepRef = useRef(0); // Sync for Three.js loop

    // Keep activeRef in sync with prop for use inside the animation loop
    useEffect(() => {
        activeRef.current = isActive;
    }, [isActive]);

    const handleNext = () => {
        if (!inputValue) return; // Basic validation
        
        setFormData(prev => ({ ...prev, [FORM_STEPS[currentStep].id]: inputValue }));
        setInputValue("");
        
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        stepRef.current = nextStep;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleNext();
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

    return (
        <div className="absolute inset-0 z-50 bg-[#050510] text-white font-mono">
            {loading && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-pulse text-black">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                 </div>
            )}
            
            <div ref={containerRef} className="absolute inset-0 z-0" />

            {/* Only render UI when active to prevent blocking interactions in SolarSystem */}
            <div className={`absolute inset-0 z-10 pointer-events-none ${isActive ? '' : 'hidden'}`}>
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
                                    className="bg-black/60 backdrop-blur-md border border-white/10 p-8 relative overflow-hidden"
                                    style={{
                                        clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)"
                                    }}
                                >
                                    {/* Corner Accents */}
                                    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-pink-500"></div>
                                    
                                    <div className="mb-2 flex justify-between items-end">
                                        <label className="text-cyan-400 font-mono text-sm tracking-[0.2em] font-bold">
                                            {FORM_STEPS[currentStep].label}
                                        </label>
                                        <span className="text-white/30 text-xs font-mono">
                                            {currentStep + 1} / {FORM_STEPS.length}
                                        </span>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type={FORM_STEPS[currentStep].type}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={FORM_STEPS[currentStep].placeholder}
                                            className="w-full bg-black/50 border-b-2 border-white/20 text-white font-mono text-xl py-3 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-white/20"
                                            autoFocus
                                        />
                                        {/* Input Scanline */}
                                        <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-500 w-0 group-focus-within:w-full transition-all duration-500"></div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={!inputValue}
                                        className="mt-8 w-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 text-white font-mono text-sm py-3 flex items-center justify-center gap-2 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>PROCEED</span>
                                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-green-500 text-green-500 mb-6 bg-green-500/10 backdrop-blur-sm shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                        <Check size={40} />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white font-mono tracking-widest mb-2">ACCESS GRANTED</h2>
                                    <p className="text-green-400 font-mono text-sm">WELCOME TO THE CITY</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                 </div>
            </div>
        </div>
    );
}

