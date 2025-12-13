import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type MotionControlOptions = {
  /** Downscale factor for processing; higher = faster/less accurate */
  downscale?: number
  /** Pixel diff threshold (0-255). Higher = less sensitive */
  threshold?: number
  /** Exponential smoothing factor (0-1). Higher = smoother/slower */
  smoothing?: number
  /** Max FPS for processing loop */
  maxFps?: number
  /** Only analyze the lower part of the frame (helps ignore head/torso). 0..1 (0.45 = bottom 55%) */
  roiTopRatio?: number
  /** Ignore motion if too much of the ROI changes (often whole-head / camera shake) */
  maxMotionRatio?: number
}

type MotionControlState = {
  enabled: boolean
  error: string | null
  /** normalized -1..1, left=-1 right=+1 */
  x: number
  /** normalized -1..1, up=-1 down=+1 */
  y: number
  start: () => Promise<void>
  stop: () => void
  /** for optional debugging */
  videoRef: React.RefObject<HTMLVideoElement | null>
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function useCameraMotionControl(opts: MotionControlOptions = {}): MotionControlState {
  const options = useMemo(
    () => ({
      downscale: opts.downscale ?? 4,
      threshold: opts.threshold ?? 22,
      smoothing: opts.smoothing ?? 0.85,
      maxFps: opts.maxFps ?? 24,
      roiTopRatio: opts.roiTopRatio ?? 0.45,
      maxMotionRatio: opts.maxMotionRatio ?? 0.12,
    }),
    [opts.downscale, opts.threshold, opts.smoothing, opts.maxFps, opts.roiTopRatio, opts.maxMotionRatio],
  )

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const prevFrameRef = useRef<ImageData | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number>(0)

  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [xy, setXy] = useState({ x: 0, y: 0 })

  const stop = useCallback(() => {
    setEnabled(false)
    setError(null)
    prevFrameRef.current = null

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const stream = streamRef.current
    streamRef.current = null
    if (stream) {
      for (const t of stream.getTracks()) t.stop()
    }

    const v = videoRef.current
    if (v) v.srcObject = null
  }, [])

  const loop = useCallback(
    (ts: number) => {
      const minDt = 1000 / options.maxFps
      if (ts - lastTsRef.current < minDt) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      lastTsRef.current = ts

      const video = videoRef.current
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const w = Math.max(1, Math.floor(video.videoWidth / options.downscale))
      const h = Math.max(1, Math.floor(video.videoHeight / options.downscale))

      if (!canvasRef.current) canvasRef.current = document.createElement("canvas")
      const canvas = canvasRef.current
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      // Mirror video (selfie) so moving right feels like moving right.
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -w, 0, w, h)
      ctx.restore()

      const frame = ctx.getImageData(0, 0, w, h)
      const prev = prevFrameRef.current
      prevFrameRef.current = frame
      if (!prev) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const a = frame.data
      const b = prev.data
      let sumX = 0
      let sumY = 0
      let weightSum = 0
      let count = 0

      const yStart = Math.floor(h * options.roiTopRatio)
      const roiH = Math.max(1, h - yStart)
      const roiArea = w * roiH

      // Frame diff centroid (motion proxy for “hand movement”)
      for (let y = yStart; y < h; y++) {
        const row = y * w
        for (let x = 0; x < w; x++) {
          const i = (row + x) * 4
          const dr = Math.abs(a[i] - b[i])
          const dg = Math.abs(a[i + 1] - b[i + 1])
          const db = Math.abs(a[i + 2] - b[i + 2])
          const diff = (dr + dg + db) / 3
          if (diff > options.threshold) {
            // weight toward high-motion + lower pixels (hands) to reduce head influence
            const yNorm = (y - yStart) / roiH // 0..1 within ROI
            const wgt = diff * diff * (0.35 + 0.65 * yNorm * yNorm)
            sumX += x * wgt
            sumY += y * wgt
            weightSum += wgt
            count++
          }
        }
      }

      // If too much of the ROI is changing, it's usually global motion (head/camera shake) -> ignore
      if (count / roiArea > options.maxMotionRatio) {
        setXy((prevXy) => ({
          x: prevXy.x * 0.9,
          y: prevXy.y * 0.9,
        }))
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      if (weightSum > 0 && count > roiArea / 250) {
        const cx = sumX / weightSum
        const cy = sumY / weightSum
        const nx = clamp((cx / w) * 2 - 1, -1, 1)
        const ny = clamp((cy / h) * 2 - 1, -1, 1)

        setXy((prevXy) => ({
          x: prevXy.x * options.smoothing + nx * (1 - options.smoothing),
          y: prevXy.y * options.smoothing + ny * (1 - options.smoothing),
        }))
      } else {
        // No motion -> ease back toward center
        setXy((prevXy) => ({
          x: prevXy.x * 0.92,
          y: prevXy.y * 0.92,
        }))
      }

      rafRef.current = requestAnimationFrame(loop)
    },
    [options.downscale, options.maxFps, options.smoothing, options.threshold],
  )

  const start = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error("Video element not mounted")

      video.srcObject = stream
      await video.play()

      setEnabled(true)
      prevFrameRef.current = null
      lastTsRef.current = 0
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(loop)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to start camera"
      setError(message)
      stop()
    }
  }, [loop, stop])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return {
    enabled,
    error,
    x: xy.x,
    y: xy.y,
    start,
    stop,
    videoRef,
  }
}


