"use client";

import { useEffect, useRef, useState } from "react";
import { KeyFrameResults } from "@/features/movement-analysis/ui/KeyFrameResults";
import type { KeyFrameResult } from "@/features/movement-analysis/model/types";

const SPEEDS = [0.5, 1, 1.5, 2] as const;

function formatSec(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface ResultsScreenProps {
  videoUrl: string;
  result: KeyFrameResult;
  trimRange: [number, number];
  onBack: () => void;
}

type FrameId = "A" | "B" | "C";

interface FrameMarker {
  id: FrameId;
  timeMs: number;
}

const ResultsScreen = ({
  videoUrl,
  result,
  trimRange,
  onBack,
}: ResultsScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [activeFrameId, setActiveFrameId] = useState<FrameId | null>(null);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);

  const speed = SPEEDS[speedIndex];
  const [trimStart, trimEnd] = trimRange;
  const trimDuration = trimEnd - trimStart;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", handleTime);
    return () => video.removeEventListener("timeupdate", handleTime);
  }, []);

  useEffect(() => {
    if (videoRef.current && trimStart > 0) {
      videoRef.current.currentTime = trimStart;
    }
  }, [trimStart]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  const selectSpeed = (index: number) => {
    setSpeedIndex(index);
    setShowSpeedPicker(false);
  };

  const handleSeek = (timeMs: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timeMs / 1000;
    videoRef.current.pause();
  };

  const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || trimDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = trimStart + ratio * trimDuration;
  };

  // Collect frame markers from result
  const markers: FrameMarker[] = [];
  if (result.frameA) markers.push({ id: "A", timeMs: result.frameA.timeMs });
  if (result.frameB) markers.push({ id: "B", timeMs: result.frameB.timeMs });
  if (result.frameC) markers.push({ id: "C", timeMs: result.frameC.timeMs });

  // Set first available frame as default active
  useEffect(() => {
    if (activeFrameId === null && markers.length > 0) {
      setActiveFrameId(markers[0].id);
    }
  }, [markers.length]);

  const scrubPosition =
    trimDuration > 0
      ? Math.max(0, Math.min(1, (currentTime - trimStart) / trimDuration))
      : 0;

  const getMarkerPos = (timeMs: number) =>
    trimDuration > 0
      ? Math.max(0, Math.min(1, (timeMs / 1000 - trimStart) / trimDuration))
      : 0;

  // Find active frame label for badge
  const activeMarker = markers.find((m) => m.id === activeFrameId);
  const activeFrameMs = activeMarker?.timeMs ?? null;

  function formatMs(ms: number): string {
    const totalSec = ms / 1000;
    const m = Math.floor(totalSec / 60);
    const s = (totalSec % 60).toFixed(1);
    return `${m}:${s.padStart(4, "0")}`;
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-var(--tab-bar-height))] max-w-md mx-auto overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground text-2xl leading-none"
        >
          ‹
        </button>
        <span className="text-[13px] font-semibold">Video Analysis</span>
        <div className="w-6" />
      </div>

      {/* Letterboxed vertical video */}
      <div
        className="w-full bg-black relative flex items-center justify-center shrink-0"
        style={{ height: 300 }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          playsInline
          className="h-full"
          style={{ aspectRatio: "9/16", objectFit: "cover" }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Frame badge */}
        {activeFrameId !== null && activeFrameMs !== null && (
          <div className="absolute top-2.5 left-3 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-primary text-primary-foreground font-semibold">
              Frame {activeFrameId} · {formatMs(activeFrameMs)}
            </span>
          </div>
        )}

        {/* Play overlay */}
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {!isPlaying && (
            <div className="w-12 h-12 rounded-full bg-black/55 border border-white/50 flex items-center justify-center">
              <span className="text-white text-lg ml-0.5">▶</span>
            </div>
          )}
        </button>

        {/* Speed picker */}
        <div className="absolute bottom-2.5 right-3">
          {showSpeedPicker && (
            <div className="absolute bottom-full right-0 mb-1.5 flex flex-col items-end gap-0.5">
              {SPEEDS.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => selectSpeed(i)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
                  style={{
                    background: s === speed ? "hsl(var(--primary))" : "rgba(0,0,0,0.6)",
                    color: s === speed ? "hsl(var(--primary-foreground))" : "white",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowSpeedPicker((v) => !v)}
            className="px-2 py-0.5 rounded-full border border-white/30 bg-black/50 text-white text-[11px]"
          >
            {speed}×
          </button>
        </div>
      </div>

      {/* Scrub bar with frame markers */}
      <div className="px-4 pt-5 pb-2 shrink-0">
        <div
          className="relative h-5 flex items-center cursor-pointer"
          onClick={handleScrubClick}
        >
          {/* Track */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded bg-muted border border-border" />
          {/* Progress fill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1 bg-primary rounded"
            style={{ left: 0, width: `${scrubPosition * 100}%` }}
          />
          {/* Scrub handle */}
          <div
            className="absolute w-3 h-3 rounded-full bg-primary border-2 border-background shadow pointer-events-none"
            style={{
              left: `calc(${scrubPosition * 100}% - 6px)`,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          {/* Frame markers */}
          {markers.map((m) => {
            const pos = getMarkerPos(m.timeMs);
            const isActive = m.id === activeFrameId;
            return (
              <div
                key={m.id}
                className="absolute flex flex-col items-center pointer-events-none"
                style={{
                  left: `calc(${pos * 100}% - 9px)`,
                  top: -14,
                }}
              >
                <div
                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-extrabold"
                  style={{
                    background: isActive
                      ? "hsl(var(--primary))"
                      : "hsl(var(--background))",
                    color: isActive
                      ? "hsl(var(--primary-foreground))"
                      : "hsl(var(--primary))",
                    border: `1.5px solid hsl(var(--primary))`,
                  }}
                >
                  {m.id}
                </div>
                <div
                  className="w-px h-1.5 bg-primary"
                  style={{ opacity: isActive ? 1 : 0.5 }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatSec(trimStart)}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatSec(trimEnd)}
          </span>
        </div>
      </div>

      {/* Key Frames header */}
      <div className="px-5 pb-2 flex justify-between items-baseline shrink-0">
        <span className="text-[15px] font-bold">Key Frames</span>
        <span className="text-[10px] text-muted-foreground">Tap to seek →</span>
      </div>

      {/* Cards */}
      <div className="px-4 flex-1 overflow-y-auto pb-4">
        <KeyFrameResults
          result={result}
          activeFrameId={activeFrameId}
          onSeek={handleSeek}
          onFrameSelect={setActiveFrameId}
        />
      </div>
    </div>
  );
};

export default ResultsScreen;
