"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import styles from "./cyberpunk-banner.module.css"
import { useCameraMotionControl } from "@/hooks/use-camera-motion-control"
import { useHandGestures } from "@/hooks/use-hand-gestures"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy } from "lucide-react"

type SliderItem = {
  id: number
  src: string
  alt: string
  character: string
  planet: string
}

const sliderItems: SliderItem[] = [
  { id: 1, src: "/illustration-rain-futuristic-city.jpg", alt: "Zephyr", character: "Zephyr", planet: "Nebula-7" },
  { id: 2, src: "/illustration-rain-futuristic-city.jpg", alt: "Vortex", character: "Vortex", planet: "Quantum Star" },
  { id: 3, src: "/illustration-rain-futuristic-city.jpg", alt: "Nova", character: "Nova", planet: "Ice World" },
  { id: 4, src: "/illustration-rain-futuristic-city.jpg", alt: "Eclipse", character: "Eclipse", planet: "Dark Matter" },
  { id: 5, src: "/illustration-rain-futuristic-city.jpg", alt: "Plasma", character: "Plasma", planet: "Void" },
  { id: 6, src: "/illustration-rain-futuristic-city.jpg", alt: "Photon", character: "Photon", planet: "Sun Core" },
  { id: 7, src: "/illustration-rain-futuristic-city.jpg", alt: "Inferno", character: "Inferno", planet: "Fire Realm" },
  { id: 8, src: "/illustration-rain-futuristic-city.jpg", alt: "Titan", character: "Titan", planet: "Saturn" },
  { id: 9, src: "/illustration-rain-futuristic-city.jpg", alt: "Aurora", character: "Aurora", planet: "Nexus Prime" },
  { id: 10, src: "/illustration-rain-futuristic-city.jpg", alt: "Spectra", character: "Spectra", planet: "Neon District" },
]

function hashStringToSeed(input: string): number {
  // FNV-1a 32-bit
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  // Deterministic PRNG: returns [0,1)
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function CyberpunkBanner() {
  // Used to seed deterministic visuals so SSR === client hydration.
  const reactId = useId()
  const prngSeed = useMemo(() => hashStringToSeed(reactId), [reactId])

  const [sensitivity, setSensitivity] = useState(22)
  const cam = useCameraMotionControl({
    threshold: sensitivity,
    // extra smooth tracking
    smoothing: 0.93,
    downscale: 4,
    maxFps: 24,
    // prioritize hands (lower half) and ignore large/global motion bursts (like head)
    roiTopRatio: 0.48,
    maxMotionRatio: 0.1,
  })

  const hand = useHandGestures({
    enabled: cam.enabled,
    videoRef: cam.videoRef,
    stableFrames: 6,
    maxFps: 24,
    mirrorX: true,
    handXSmoothing: 0.55,
  })

  const rain = useMemo(() => {
    // Deterministic so SSR markup matches client hydration.
    const rand = mulberry32(prngSeed ^ 0xa1b2c3d4)
    return Array.from({ length: 80 }).map((_, i) => {
      const left = rand() * 100
      const height = 80 + rand() * 220
      const duration = 0.45 + rand() * 0.85
      const delay = rand() * 2
      const opacity = 0.15 + rand() * 0.35
      return { key: i, left, height, duration, delay, opacity }
    })
  }, [prngSeed])

  // Randomly select 3-4 cards to glitch
  const glitchCards = useMemo(() => {
    // Deterministic so SSR markup matches client hydration.
    const rand = mulberry32(prngSeed ^ 0x1f2e3d4c)
    const numGlitch = 3 + Math.floor(rand() * 2) // 3 or 4 cards
    const indices = Array.from({ length: sliderItems.length }, (_, i) => i)
    // Shuffle and take first numGlitch
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return new Set(indices.slice(0, numGlitch).map(i => sliderItems[i].id))
  }, [prngSeed])

  const sliderRef = useRef<HTMLDivElement | null>(null)
  const handXRef = useRef(0)
  const yawRef = useRef(0)
  const modalOpenRef = useRef(false)
  const lastModalTsRef = useRef(0)
  const handGestureRef = useRef(hand.gesture)
  const handHasRef = useRef(hand.hasHand)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<SliderItem | null>(null)

  useEffect(() => {
    modalOpenRef.current = modalOpen
  }, [modalOpen])

  useEffect(() => {
    handGestureRef.current = hand.gesture
    handHasRef.current = hand.hasHand
  }, [hand.gesture, hand.hasHand])

  // Keep latest hand.handX available to the animation loop without restarting it.
  useEffect(() => {
    handXRef.current = hand.handX
  }, [hand.handX])

  // Hand movement (dx) -> velocity -> yaw angle (momentum-based steering)
  // Uses MediaPipe hand landmarks, so only responds to hand movement (not head/body)
  useEffect(() => {
    if (!cam.enabled) {
      const el = sliderRef.current
      if (el) el.style.setProperty("--yaw", "0deg")
      return
    }

    let raf = 0
    let lastTs = performance.now()
    let yaw = yawRef.current ?? 0
    // Persistent angular velocity (inertia). This is what makes the carousel
    // "keep spinning the way you set it" until you push it the other way.
    let angularVelocity = 18 // deg/sec; + = clockwise, - = anticlockwise
    let lastHandX = handXRef.current

    const moveDeadzone = 0.02 // ignore tiny landmark jitter in movement (dx)
    // Use swipe speed (dx/dt) as an impulse that accelerates the spin.
    // Larger = more responsive "push".
    const accelGain = 260 // (deg/sec) per (normalized handX / sec)
    const vxSmoothing = 0.78 // smooth swipe velocity to reduce jitter
    const maxAngularVel = 140 // clamp so it can't run away
    const idleFriction = 0.9996 // when you stop moving, keep spinning (very slow decay)
    const noHandFriction = 0.9975 // slightly more damping if the hand disappears
    let smoothedVx = 0

    const tick = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000)
      lastTs = ts

      // If modal is open, freeze rotation
      if (modalOpenRef.current) {
        const el = sliderRef.current
        if (el) el.style.setProperty("--yaw", `${yaw.toFixed(2)}deg`)
        raf = requestAnimationFrame(tick)
        return
      }

      const handX = handXRef.current
      const hasHandNow = handHasRef.current
      const dx = hasHandNow ? handX - lastHandX : 0
      lastHandX = handX

      // Direction mapping (as requested):
      // - right -> left movement (dx < 0) => anticlockwise (negative velocity)
      // - left -> right movement (dx > 0) => clockwise (positive velocity)
      if (hasHandNow && Math.abs(dx) > moveDeadzone) {
        const vx = dx / Math.max(dt, 0.016) // ~units/sec in normalized handX space
        smoothedVx = smoothedVx * vxSmoothing + vx * (1 - vxSmoothing)

        // Convert swipe velocity into angular acceleration and integrate.
        angularVelocity += smoothedVx * accelGain * dt
        if (angularVelocity > maxAngularVel) angularVelocity = maxAngularVel
        if (angularVelocity < -maxAngularVel) angularVelocity = -maxAngularVel
      } else {
        // No swipe input: keep your chosen spin direction/speed (inertia).
        angularVelocity *= hasHandNow ? idleFriction : noHandFriction
      }

      yaw += angularVelocity * dt

      // Keep yaw bounded
      if (yaw > 360) yaw -= 360
      if (yaw < -360) yaw += 360
      yawRef.current = yaw

      const el = sliderRef.current
      if (el) el.style.setProperty("--yaw", `${yaw.toFixed(2)}deg`)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [cam.enabled])

  // Hold a peace sign gesture => open modal for front-facing card and pause rotation
  useEffect(() => {
    if (!cam.enabled) return
    if (modalOpenRef.current) return
    // Start only once the gesture is stable (edge trigger from the hook)
    if (!hand.peaceJustDetected) return

    const holdMs = 450
    const timeout = window.setTimeout(() => {
      if (modalOpenRef.current) return
      if (!handHasRef.current) return
      if (handGestureRef.current !== "peace") return

      // Cooldown to prevent false-positive spam
      const now = performance.now()
      if (now - lastModalTsRef.current < 1600) return
      lastModalTsRef.current = now

      const step = 360 / sliderItems.length
      const yaw = ((yawRef.current % 360) + 360) % 360
      const frontAngle = (360 - yaw) % 360
      const idx = Math.round(frontAngle / step) % sliderItems.length
      const card = sliderItems[idx]
      setSelected(card)
      setModalOpen(true)
    }, holdMs)

    return () => window.clearTimeout(timeout)
  }, [cam.enabled, hand.peaceJustDetected])

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        {/* Hidden video source for camera motion tracking */}
        <video ref={cam.videoRef} className={styles.cameraVideo} playsInline muted />

        <div className={styles.cornerOverlay}>
          <div className={`${styles.cornerTag} ${styles.cornerTL}`}>
            <div className={styles.cornerKicker}>MATCH PROTOCOL</div>
            <div className={styles.cornerTitle}>SELECT MATCH</div>
            <div className={styles.cornerSub}>NEON GRID • READY</div>
          </div>

          <div className={`${styles.cornerTag} ${styles.cornerTR}`}>
            <div className={styles.cornerKicker}>SYSTEM</div>
            <div className={`${styles.cornerTitle} ${styles.cornerGlitch} ${styles.glitchText}`} data-text="GLITCH MODE">
              GLITCH MODE
            </div>
            <div className={styles.cornerSub}>SIGNAL: STABLE</div>
          </div>

          <div className={styles.matchScore}>
            <div className={styles.matchScoreIcon}>
              <Trophy size={24} strokeWidth={2.5} />
            </div>
            <div className={styles.matchScoreContent}>
              <div className={styles.matchScoreLabel}>MATCH SCORE</div>
              <div className={styles.matchScoreValue}>0</div>
            </div>
          </div>
        </div>

        <div className={styles.rain} aria-hidden="true">
          {rain.map((d) => (
            <div
              key={d.key}
              className={styles.rainDrop}
              style={{
                left: `${d.left}%`,
                height: `${d.height}px`,
                animationDuration: `${d.duration}s`,
                animationDelay: `${d.delay}s`,
                opacity: d.opacity,
              }}
            />
          ))}
        </div>

        <div className={styles.stage}>
          <div
            className={`${styles.slider} ${cam.enabled ? styles.sliderControlled : ""}`}
            ref={sliderRef}
            style={{
              ["--quantity" as never]: sliderItems.length,
            }}
          >
            {sliderItems.map((item) => {
              const isGlitching = glitchCards.has(item.id)
              return (
              <div 
                key={item.id} 
                className={`${styles.item} ${isGlitching ? styles.glitchCard : ''}`} 
                style={{ ["--position" as never]: item.id }}
                onClick={() => {
                  setSelected(item)
                  setModalOpen(true)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelected(item)
                    setModalOpen(true)
                  }
                }}
              >
                <div className={styles.cardFace}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    style={{
                      objectPosition: `${10 + (item.id - 1) * 8}% ${35 + ((item.id - 1) % 5) * 10}%`,
                    }}
                  />
                  <div className={styles.cardLabel}>
                    <div className={`${styles.labelText} ${isGlitching ? styles.glitchText : ''}`} data-text={item.character}>
                      {item.character}
                    </div>
                    <div className={styles.labelMirror}>{item.character}</div>
                  </div>
                  <div className={styles.cardPlanet}>
                    <div className={`${styles.planetText} ${isGlitching ? styles.glitchText : ''}`} data-text={item.planet}>
                      {item.planet}
                    </div>
                    <div className={styles.planetMirror}>{item.planet}</div>
                  </div>
                </div>
                <div className={styles.cardFaceBack}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    style={{
                      objectPosition: `${10 + (item.id - 1) * 8}% ${35 + ((item.id - 1) % 5) * 10}%`,
                    }}
                  />
                  <div className={styles.cardLabel}>
                    <div className={`${styles.labelText} ${isGlitching ? styles.glitchText : ''}`} data-text={item.character}>
                      {item.character}
                    </div>
                    <div className={styles.labelMirror}>{item.character}</div>
                  </div>
                  <div className={styles.cardPlanet}>
                    <div className={`${styles.planetText} ${isGlitching ? styles.glitchText : ''}`} data-text={item.planet}>
                      {item.planet}
                    </div>
                    <div className={styles.planetMirror}>{item.planet}</div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>

        <div className={styles.hud}>
          {!cam.enabled ? (
            <button className={styles.hudButton} onClick={cam.start}>
              Enable Camera Control
            </button>
          ) : (
            <button className={styles.hudButton} onClick={cam.stop}>
              Disable Camera
            </button>
          )}

          <label className={styles.hudLabel}>
            Sensitivity
            <input
              className={styles.hudRange}
              type="range"
              min={10}
              max={60}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              disabled={!cam.enabled}
            />
          </label>

          {cam.error ? <div className={styles.hudError}>{cam.error}</div> : null}
          {cam.enabled ? (
            <div className={styles.hudHint}>Move hand left/right • Peace sign ✌️ to open</div>
          ) : null}
          {cam.enabled ? <div className={styles.hudHint}>Hand: {hand.gesture}</div> : null}
          {cam.enabled && hand.error ? <div className={styles.hudError}>{hand.error}</div> : null}
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className={styles.modalContent}>
            <DialogHeader>
              <DialogTitle className={styles.modalTitle}>{selected?.character ?? "Unknown"}</DialogTitle>
              <DialogDescription className={styles.modalDesc}>
                {selected?.planet ? `Origin: ${selected.planet}` : ""}
              </DialogDescription>
            </DialogHeader>
            {selected ? (
              <div className={styles.modalBody}>
                <div className={styles.modalImageWrap} key={selected.id}>
                  {/* Mount-on-open SVG filter to animate a “sphere distortion” effect */}
                  <svg className={styles.modalSvgFx} aria-hidden="true" focusable="false">
                    <filter id="modalSphereFx" x="-20%" y="-20%" width="140%" height="140%">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.015 0.08"
                        numOctaves="2"
                        seed="7"
                        result="noise"
                      >
                        <animate
                          attributeName="baseFrequency"
                          dur="700ms"
                          values="0.03 0.18; 0.015 0.08"
                          keyTimes="0;1"
                          fill="freeze"
                        />
                      </feTurbulence>
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="42" xChannelSelector="R" yChannelSelector="G">
                        <animate
                          attributeName="scale"
                          dur="700ms"
                          values="42; 0"
                          keyTimes="0;1"
                          fill="freeze"
                        />
                      </feDisplacementMap>
                    </filter>
                  </svg>

                  <img className={styles.modalImage} src={selected.src} alt={selected.alt} />
                </div>
                <div className={styles.modalMeta}>
                  <div className={styles.modalMetaRow}>
                    <span className={styles.modalMetaKey}>Character</span>
                    <span className={styles.modalMetaVal}>{selected.character}</span>
                  </div>
                  <div className={styles.modalMetaRow}>
                    <span className={styles.modalMetaKey}>Planet</span>
                    <span className={styles.modalMetaVal}>{selected.planet}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


