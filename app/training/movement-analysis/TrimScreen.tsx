"use client";

import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  isClipLongEnough,
  MIN_CLIP_SEC,
} from "@/features/movement-analysis/model/videoValidation";

interface TrimScreenProps {
  videoUrl: string;
  onBack: () => void;
  onAnalyze: (startSec: number, endSec: number) => void;
  error: string | null;
}

function formatSec(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatDuration(s: number): string {
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

const TrimScreen = ({ videoUrl, onBack, onAnalyze, error }: TrimScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleMetadata = () => {
      setDuration(video.duration);
      setRange([0, video.duration]);
    };
    video.addEventListener("loadedmetadata", handleMetadata);
    return () => video.removeEventListener("loadedmetadata", handleMetadata);
  }, []);

  const handleRangeChange = (values: number[]) => {
    const [newStart, newEnd] = values as [number, number];
    const [prevStart] = range;
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime = newStart !== prevStart ? newStart : newEnd;
    }
    setRange([newStart, newEnd]);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  const selectedDuration = range[1] - range[0];
  const clipTooShort = duration > 0 && !isClipLongEnough(selectedDuration);
  const startPct = duration > 0 ? (range[0] / duration) * 100 : 0;
  const endPct = duration > 0 ? (range[1] / duration) * 100 : 100;

  return (
    <div className="flex flex-col h-[calc(100dvh-var(--tab-bar-height))] max-w-md mx-auto">
      {/* Step header */}
      <div className="px-5 py-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground text-2xl leading-none w-6 text-left"
        >
          ‹
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground uppercase tracking-[1.4px]">
            1 / 2
          </span>
          <span className="text-[13px] font-semibold">Select range</span>
        </div>
        <div className="w-6" />
      </div>

      {/* Video viewport */}
      <div className="px-4 pb-2.5 flex-1 min-h-0">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            playsInline
            className="w-full h-full rounded-xl object-contain bg-black"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {!isPlaying && (
              <div className="w-[54px] h-[54px] rounded-full bg-black/55 border border-white/50 flex items-center justify-center">
                <span className="text-white text-xl ml-0.5">▶</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Filmstrip + range slider */}
      {duration > 0 && (
        <div className="px-4 pb-1">
          {/* Filmstrip visual */}
          <div className="relative h-12">
            <div className="flex gap-0.5 h-full bg-muted rounded-lg p-0.5 border border-border overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => {
                const segStart = (i / 10) * duration;
                const segEnd = ((i + 1) / 10) * duration;
                const inRange = segEnd > range[0] && segStart < range[1];
                return (
                  <div
                    key={i}
                    className="flex-1 rounded"
                    style={{
                      background: `repeating-linear-gradient(${135 + i * 5}deg, hsl(var(--border)) 0 3px, hsl(var(--muted)) 3px 7px)`,
                      opacity: inRange ? 1 : 0.32,
                    }}
                  />
                );
              })}
            </div>
            {/* Range highlight */}
            <div
              className="absolute top-0 bottom-0 border-2 border-primary rounded-md pointer-events-none bg-primary/5"
              style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
            />
          </div>

          {/* Slider for interaction */}
          <Slider
            min={0}
            max={duration}
            step={0.1}
            value={range}
            onValueChange={handleRangeChange}
            className="mt-2"
          />

          {/* Time labels */}
          <div className="flex justify-between items-end mt-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.8px]">
                Start
              </span>
              <span className="text-[15px] font-bold tabular-nums">
                {formatSec(range[0])}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
                {formatDuration(selectedDuration)}
              </span>
              <span className="text-[9px] text-muted-foreground">selected</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.8px]">
                End
              </span>
              <span className="text-[15px] font-bold tabular-nums">
                {formatSec(range[1])}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="px-5 pt-3">
        <div className="bg-muted rounded-[10px] px-3 py-2.5 flex items-start gap-2.5">
          <span className="text-sm shrink-0">💡</span>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Trim to a single lift. Shorter = sharper analysis (≤ 15s).
          </p>
        </div>
      </div>

      {clipTooShort && (
        <div className="px-5 pt-2">
          <p className="text-sm text-muted-foreground">
            Select at least {MIN_CLIP_SEC}s to analyze.
          </p>
        </div>
      )}

      {error && (
        <div className="px-5 pt-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Analyze CTA */}
      <div className="px-4 pb-[18px]">
        <button
          type="button"
          onClick={() => onAnalyze(range[0], range[1])}
          disabled={duration === 0 || clipTooShort}
          className="w-full h-[52px] rounded-[14px] bg-primary text-primary-foreground font-bold text-[15px] flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          <span>✓</span>
          <span>Analyze</span>
        </button>
      </div>
    </div>
  );
};

export default TrimScreen;
