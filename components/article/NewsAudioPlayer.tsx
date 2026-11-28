"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Headphones,
  Sparkles,
  Loader2,
  GripHorizontal,
  Minus,
  Maximize2,
  X,
  RotateCcw,
} from "lucide-react";

interface NewsAudioPlayerProps {
  slug: string;
  articleId?: string;
  title?: string;
  audioUrl?: string;
}

// Convert English numbers to Bengali digits
function toBengaliDigits(num: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "০০:০০";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const mStr = String(mins).padStart(2, "0");
  const sStr = String(secs).padStart(2, "0");
  return `${toBengaliDigits(mStr)}:${toBengaliDigits(sStr)}`;
}

export default function NewsAudioPlayer({
  slug,
  articleId,
  title = "সংবাদটি শুনুন",
  audioUrl,
}: NewsAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [hasError, setHasError] = useState<boolean>(false);

  // Floating & Dragging States
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isClosed, setIsClosed] = useState<boolean>(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  // Dynamic audio URL resolver that works seamlessly in local dev, VPS, and production
  const streamSrc = React.useMemo(() => {
    let raw = (audioUrl && String(audioUrl).trim()) || "";
    if (!raw) {
      if (articleId) {
        raw = `/api/v1/news/${encodeURIComponent(articleId)}/audio`;
      } else if (slug) {
        raw = `/api/v1/news/slug/${encodeURIComponent(slug)}/audio`;
      }
    }

    if (!raw) return "";

    // If full absolute URL
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    // Relative path e.g. /api/v1/news/...
    const cleanPath = raw.startsWith("/") ? raw : `/${raw}`;

    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host.includes("banglaralonews.com")) {
        return `https://api.banglaralonews.com${cleanPath}`;
      }
    }

    const envBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5009/api/v1";
    const origin = envBase.replace(/\/api\/v1\/?$/, "");
    return `${origin}${cleanPath}`;
  }, [audioUrl, articleId, slug]);

  // Initialize position to bottom right of viewport
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateInitialPosition = () => {
      const playerWidth = 320;
      const playerHeight = 160;
      const defaultX = Math.max(16, window.innerWidth - playerWidth - 24);
      const defaultY = Math.max(16, window.innerHeight - playerHeight - 24);
      setPosition((prev) => (prev === null ? { x: defaultX, y: defaultY } : prev));
    };

    updateInitialPosition();
    window.addEventListener("resize", updateInitialPosition);
    return () => window.removeEventListener("resize", updateInitialPosition);
  }, []);

  // Reset audio when slug changes
  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setIsClosed(false);
  }, [slug]);

  // Handle Dragging via Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent drag when clicking inputs, buttons or sliders
    if ((e.target as HTMLElement).closest("button, input, a")) return;

    if (!position) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;
      const newX = dragStartRef.current.initialX + deltaX;
      const newY = dragStartRef.current.initialY + deltaY;

      const playerWidth = isMinimized ? 120 : 320;
      const playerHeight = isMinimized ? 50 : 160;
      const maxX = Math.max(10, window.innerWidth - playerWidth - 10);
      const maxY = Math.max(10, window.innerHeight - playerHeight - 10);

      setPosition({
        x: Math.max(10, Math.min(maxX, newX)),
        y: Math.max(10, Math.min(maxY, newY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Handle Dragging via Touch for Smartphones
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button, input, a")) return;
    if (!position || e.touches.length === 0) return;

    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y,
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      moveEvent.preventDefault(); // Prevent screen scroll while dragging player
      const touchMove = moveEvent.touches[0];
      const deltaX = touchMove.clientX - dragStartRef.current.startX;
      const deltaY = touchMove.clientY - dragStartRef.current.startY;
      const newX = dragStartRef.current.initialX + deltaX;
      const newY = dragStartRef.current.initialY + deltaY;

      const playerWidth = isMinimized ? 120 : 310;
      const playerHeight = isMinimized ? 50 : 160;
      const maxX = Math.max(10, window.innerWidth - playerWidth - 10);
      const maxY = Math.max(10, window.innerHeight - playerHeight - 10);

      setPosition({
        x: Math.max(10, Math.min(maxX, newX)),
        y: Math.max(10, Math.min(maxY, newY)),
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
  };

  const togglePlay = async () => {
    if (!audioRef.current || !streamSrc) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true);
        setHasError(false);
        if (audioRef.current.readyState === 0) {
          audioRef.current.load();
        }
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Audio playback error:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      audioRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!streamSrc || isClosed) {
    return null;
  }

  return (
    <>
      {/* Hidden Audio Stream Element */}
      <audio
        ref={audioRef}
        src={streamSrc}
        crossOrigin="anonymous"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setHasError(true);
        }}
      />

      {/* FLOATING & DRAGGABLE COMPACT AUDIO PLAYER */}
      <div
        ref={playerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          position: "fixed",
          left: position ? `${position.x}px` : "auto",
          top: position ? `${position.y}px` : "auto",
          bottom: position ? "auto" : "20px",
          right: position ? "auto" : "20px",
          zIndex: 9999,
          touchAction: "none",
        }}
        className={`select-none transition-shadow duration-200 ${
          isDragging ? "cursor-grabbing shadow-2xl scale-102" : "cursor-grab shadow-xl"
        }`}
      >
        {isMinimized ? (
          /* MINIMIZED MINI PILL */
          <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#0B2545]/95 backdrop-blur-md border border-white/20 text-white shadow-2xl animate-in zoom-in-90">
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <span className="text-[11.5px] font-bold text-white whitespace-nowrap">
              {isPlaying ? "অডিও চলছে..." : "সংবাদ অডিও"}
            </span>

            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-full hover:bg-white/15 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="বড় করুন"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* EXPANDED FULL COMPACT AUDIO PLAYER */
          <div className="w-[310px] sm:w-[335px] rounded-2xl bg-[#071324]/95 backdrop-blur-md text-white border border-white/15 p-3.5 shadow-2xl animate-in fade-in-50">
            {/* Top Draggable Header Bar */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <GripHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-[12px] font-bold text-white truncate">
                  সংবাদটি শুনুন
                </span>
                <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Voice
                </span>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="ছোট করুন"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsClosed(true)}
                  className="p-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Headline Text */}
            <p className="text-[11.5px] font-semibold text-gray-200 line-clamp-1 mb-2.5">
              {title}
            </p>

            {/* Main Player Row: Play/Pause + Waveform/Time */}
            <div className="flex items-center gap-2.5">
              {/* Play / Pause Circular Button */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading && !isPlaying}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4.5 h-4.5 fill-current" />
                ) : (
                  <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                )}
              </button>

              {/* Progress Slider & Time */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/20 accent-[#10B981] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #10B981 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                  }}
                />

                <div className="flex items-center justify-between text-[10px] text-gray-300 font-medium px-0.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration > 0 ? formatTime(duration) : isPlaying ? "লাইভ" : "০০:০০"}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row: Speed, Equalizer & Mute */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              {/* Animated Equalizer Sound Bars */}
              <div className="flex items-center gap-1 text-emerald-400">
                <div
                  className={`w-1 bg-emerald-400 rounded-full transition-all ${
                    isPlaying ? "h-3 animate-pulse" : "h-1.5 opacity-50"
                  }`}
                />
                <div
                  className={`w-1 bg-emerald-400 rounded-full transition-all ${
                    isPlaying ? "h-4 animate-bounce" : "h-1.5 opacity-50"
                  }`}
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className={`w-1 bg-emerald-400 rounded-full transition-all ${
                    isPlaying ? "h-2.5 animate-pulse" : "h-1.5 opacity-50"
                  }`}
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-[10px] font-semibold text-gray-300 ml-1">
                  {isPlaying ? "প্লে হচ্ছে" : "পজ করা"}
                </span>
              </div>

              {/* Speed & Volume Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 transition-colors cursor-pointer"
                  title="স্পিড পরিবর্তন করুন"
                >
                  {playbackRate}x
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 rounded text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? "আনমিউট করুন" : "মিউট করুন"}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {hasError && (
              <div className="mt-2 text-[10px] text-red-300 bg-red-900/40 border border-red-500/30 rounded px-2 py-1">
                অডিও প্লে করতে সমস্যা হয়েছে। সংযোগ চেক করুন।
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
