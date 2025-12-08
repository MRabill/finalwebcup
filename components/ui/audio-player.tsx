"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
  loop?: boolean
  volume?: number
  className?: string
  onEnded?: () => void
  hidden?: boolean
  showTitle?: boolean
  title?: string
  artist?: string
}

export default function AudioPlayer({
  src,
  autoPlay = false,
  loop = true,
  volume: initialVolume = 0.5,
  className,
  onEnded,
  hidden = false,
  showTitle = false,
  title = "",
  artist = "",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(initialVolume)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const audio = new Audio(src)
    audioRef.current = audio

    audio.volume = initialVolume
    audio.loop = loop

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoaded(true)
      setIsError(false)
      if (autoPlay) {
        audio.play().catch((err) => {
          console.error("Failed to autoplay:", err)
          setIsPlaying(false)
        })
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      if (!loop) {
        setIsPlaying(false)
        if (onEnded) onEnded()
      }
    }

    const handleError = () => {
      setIsError(true)
      setIsLoaded(false)
      setIsPlaying(false)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("", handleError)

    return () => {
      audio.pause()
      audio.src = ""
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("", handleError)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [src, autoPlay, loop, initialVolume, onEnded])

  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        setIsPlaying(false)
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // Update audio when src changes
  useEffect(() => {
    if (!audioRef.current) return

    audioRef.current.src = src
    audioRef.current.load()
    setIsLoaded(false)
    setIsError(false)

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        setIsPlaying(false)
      })
    }
  }, [src, isPlaying])

  // Auto-hide player after 5 seconds of inactivity
  useEffect(() => {
    if (hidden) return

    setIsVisible(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [hidden, isPlaying, volume, isMuted, currentTime])

  const togglePlay = () => setIsPlaying(!isPlaying)
  const toggleMute = () => setIsMuted(!isMuted)

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  if (hidden) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "flex items-center space-x-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg",
            className,
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
            }
            setIsVisible(true)
          }}
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(() => {
              setIsVisible(false)
            }, 5000)
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={togglePlay}
            disabled={!isLoaded || isError}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>

          {showTitle && title && (
            <div className="hidden sm:block max-w-[120px] overflow-hidden">
              <p className="text-xs font-medium truncate text-white">{title}</p>
              {artist && <p className="text-xs text-white/70 truncate">{artist}</p>}
            </div>
          )}

          <div className="hidden sm:flex items-center space-x-2 min-w-[100px]">
            <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
          </div>

          {/* <div className="text-xs text-white/70">
            {isError ? "" : isLoaded ? formatTime(currentTime) : ""}
          </div> */}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
