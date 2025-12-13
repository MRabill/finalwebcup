"use client"

import { useEffect, useMemo, useRef, useState } from "react"

// MediaPipe Tasks Vision is loaded dynamically at runtime (optional dependency).

export type HandGesture = "none" | "open" | "fist" | "peace" | "unknown"

type UseHandGesturesOptions = {
  enabled: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** stable frames required before emitting a gesture */
  stableFrames?: number
  /** max FPS for detection */
  maxFps?: number
  /** mirror X axis so it matches selfie-view expectations */
  mirrorX?: boolean
  /** smoothing for handX (0..1). Higher = smoother but laggier */
  handXSmoothing?: number
}

type HandGesturesState = {
  hasHand: boolean
  gesture: HandGesture
  /** true only when a new stable peace sign is detected (edge trigger) */
  peaceJustDetected: boolean
  /** normalized hand center x position (-1..1, left=-1 right=+1) for motion control */
  handX: number
  error: string | null
}

function dist(a: { x: number; y: number; z?: number }, b: { x: number; y: number; z?: number }) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = (a.z ?? 0) - (b.z ?? 0)
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

// Indices from MediaPipe Hands
const LM = {
  wrist: 0,
  thumb_tip: 4,
  index_mcp: 5,
  index_tip: 8,
  middle_mcp: 9,
  middle_tip: 12,
  ring_mcp: 13,
  ring_tip: 16,
  pinky_mcp: 17,
  pinky_tip: 20,
} as const

export function useHandGestures(opts: UseHandGesturesOptions): HandGesturesState {
  const options = useMemo(
    () => ({
      stableFrames: opts.stableFrames ?? 8,
      maxFps: opts.maxFps ?? 24,
      mirrorX: opts.mirrorX ?? true,
      handXSmoothing: opts.handXSmoothing ?? 0.55,
    }),
    [opts.maxFps, opts.stableFrames, opts.mirrorX, opts.handXSmoothing],
  )

  const landmarkerRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number>(0)

  const lastGestureRef = useRef<HandGesture>("none")
  const stableCountRef = useRef<number>(0)
  const peaceEdgeRef = useRef<boolean>(false)
  const smoothedHandXRef = useRef<number>(0)

  const [state, setState] = useState<HandGesturesState>({
    hasHand: false,
    gesture: "none",
    peaceJustDetected: false,
    handX: 0,
    error: null,
  })

  useEffect(() => {
    async function ensureLandmarker() {
      if (landmarkerRef.current) return

      let FilesetResolver: any
      let HandLandmarker: any
      try {
        ;({ FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision"))
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Missing optional dependency: @mediapipe/tasks-vision"
        setState({
          hasHand: false,
          gesture: "none",
          peaceJustDetected: false,
          handX: 0,
          error: msg,
        })
        throw e
      }

      // Use CDN-hosted wasm + model (no need to commit binaries)
      const wasmBase =
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
      const modelUrl =
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

      try {
        const vision = await FilesetResolver.forVisionTasks(wasmBase)
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: modelUrl },
          runningMode: "VIDEO",
          numHands: 1,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to init hand model"
        setState({
          hasHand: false,
          gesture: "none",
          peaceJustDetected: false,
          handX: 0,
          error: msg,
        })
        throw e
      }
    }

    function classify(landmarks: Array<{ x: number; y: number; z?: number }>): HandGesture {
      const wrist = landmarks[LM.wrist]
      const midMcp = landmarks[LM.middle_mcp]
      const palmScale = dist(wrist, midMcp) + 1e-6

      // Palm center proxy
      const palmCenter = {
        x: (landmarks[LM.index_mcp].x + landmarks[LM.pinky_mcp].x + wrist.x) / 3,
        y: (landmarks[LM.index_mcp].y + landmarks[LM.pinky_mcp].y + wrist.y) / 3,
        z: ((landmarks[LM.index_mcp].z ?? 0) + (landmarks[LM.pinky_mcp].z ?? 0) + (wrist.z ?? 0)) / 3,
      }

      const tipToPalm = (tipIdx: number) => dist(landmarks[tipIdx], palmCenter) / palmScale

      const dIndex = tipToPalm(LM.index_tip)
      const dMiddle = tipToPalm(LM.middle_tip)
      const dRing = tipToPalm(LM.ring_tip)
      const dPinky = tipToPalm(LM.pinky_tip)
      const dThumb = dist(landmarks[LM.thumb_tip], palmCenter) / palmScale
      const thumbToIndexMcp = dist(landmarks[LM.thumb_tip], landmarks[LM.index_mcp]) / palmScale

      // Peace sign: index + middle extended, ring + pinky folded, thumb not extended
      // (slightly relaxed thresholds to be usable in real lighting/cameras)
      const peace =
        dIndex > 1.45 &&
        dMiddle > 1.45 &&
        dRing < 1.28 &&
        dPinky < 1.22 &&
        dThumb < 1.45

      // Fist: all fingertips close to palm center (orientation-robust)
      const fist =
        dIndex < 1.08 &&
        dMiddle < 1.08 &&
        dRing < 1.06 &&
        dPinky < 1.05 &&
        dThumb < 1.18 &&
        thumbToIndexMcp < 1.05

      // Open: fingertips far from palm center
      const open =
        dIndex > 1.55 &&
        dMiddle > 1.55 &&
        dRing > 1.45 &&
        dPinky > 1.35

      if (peace) return "peace"
      if (fist) return "fist"
      if (open) return "open"
      return "unknown"
    }

    async function startLoop() {
      try {
        await ensureLandmarker()
      } catch {
        return
      }

      const loop = (ts: number) => {
        const minDt = 1000 / options.maxFps
        if (ts - lastTsRef.current < minDt) {
          rafRef.current = requestAnimationFrame(loop)
          return
        }
        lastTsRef.current = ts

        const lm = landmarkerRef.current
        const video = opts.videoRef.current
        if (!lm || !video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(loop)
          return
        }

        const res = lm.detectForVideo(video, ts)
        const hand = res.landmarks?.[0]

        let gesture: HandGesture = "none"
        let hasHand = false

        if (hand && hand.length >= 21) {
          hasHand = true
          gesture = classify(hand as any)
          // Compute hand center X position (mirrored, so right hand = right side)
          const wrist = hand[LM.wrist]
          const indexMcp = hand[LM.index_mcp]
          const pinkyMcp = hand[LM.pinky_mcp]
          const centerX = (wrist.x + indexMcp.x + pinkyMcp.x) / 3
          // Normalize to -1..1, left=-1 right=+1 (video is mirrored)
          let rawHandX = centerX * 2 - 1
          // Mirror so moving your hand to the right feels like "right" control in selfie mode.
          if (options.mirrorX) rawHandX = -rawHandX
          // Apply exponential smoothing to reduce jitter
          const s = Math.min(0.95, Math.max(0, options.handXSmoothing))
          smoothedHandXRef.current = smoothedHandXRef.current * s + rawHandX * (1 - s)
        } else {
          // When hand is lost, gradually decay toward center (0)
          smoothedHandXRef.current *= 0.92
        }

        // Stability filter for gesture
        if (gesture === lastGestureRef.current) stableCountRef.current += 1
        else {
          stableCountRef.current = 1
          lastGestureRef.current = gesture
        }

        let peaceJustDetected = false
        if (
          hasHand &&
          gesture === "peace" &&
          stableCountRef.current === options.stableFrames &&
          !peaceEdgeRef.current
        ) {
          peaceEdgeRef.current = true
          peaceJustDetected = true
        }
        if (gesture !== "peace") peaceEdgeRef.current = false

        setState({
          hasHand,
          gesture,
          peaceJustDetected,
          handX: smoothedHandXRef.current,
          error: null,
        })
        rafRef.current = requestAnimationFrame(loop)
      }

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }

    if (!opts.enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      smoothedHandXRef.current = 0
      setState({
        hasHand: false,
        gesture: "none",
        peaceJustDetected: false,
        handX: 0,
        error: null,
      })
      return
    }

    startLoop()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      setState({
        hasHand: false,
        gesture: "none",
        peaceJustDetected: false,
        handX: 0,
        error: null,
      })
    }
  }, [opts.enabled, opts.videoRef, options])

  return state
}


