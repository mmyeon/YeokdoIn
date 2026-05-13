"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Check } from "lucide-react";
import PoseAnalyzer from "../PoseAnalyzer";
import VideoController from "./VideoController";

interface VideoPlayerProps {
  videoUrl: string;
  children: ReactNode;
  onAnalyze: (startSec: number, endSec: number) => void;
  seekTarget: number | null;
}

const formatSec = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const VideoPlayer = ({
  videoUrl,
  children,
  onAnalyze,
  seekTarget,
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleRangeChange = (values: number[]) => {
    const [newStart, newEnd] = values as [number, number];
    const [prevStart] = range;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = newStart !== prevStart ? newStart : newEnd;
    }

    setRange([newStart, newEnd]);
  };

  const handleVideoPause = () => setIsPlaying(false);
  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoEnded = () => setIsPlaying(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadataLoad = () => {
      if (canvasRef.current) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }
      setDuration(video.duration);
      setRange([0, video.duration]);
    };

    video.addEventListener("loadedmetadata", handleMetadataLoad);
    return () => video.removeEventListener("loadedmetadata", handleMetadataLoad);
  }, []);

  useEffect(() => {
    if (seekTarget === null || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = seekTarget / 1000;
  }, [seekTarget]);

  return (
    <div className="bg-black relative w-full h-[calc(100dvh-var(--tab-bar-height))] overflow-hidden">
      <video
        playsInline
        ref={videoRef}
        src={videoUrl}
        className="absolute object-contain top-0 left-0 w-full h-full"
        onPause={handleVideoPause}
        onPlay={handleVideoPlay}
        onEnded={handleVideoEnded}
      />

      <PoseAnalyzer
        videoRef={videoRef}
        canvasRef={canvasRef}
        isPlaying={isPlaying}
      />

      {duration > 0 && (
        <div className="absolute bottom-[76px] left-0 right-0 px-4 z-10">
          <div className="flex items-center gap-3">
            <span className="text-white/80 text-xs w-9 text-right shrink-0 tabular-nums">
              {formatSec(range[0])}
            </span>
            <Slider
              min={0}
              max={duration}
              step={0.1}
              value={range}
              onValueChange={handleRangeChange}
              className="flex-1"
            />
            <span className="text-white/80 text-xs w-9 shrink-0 tabular-nums">
              {formatSec(range[1])}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => onAnalyze(range[0], range[1])}
              className="shrink-0 h-7 w-7 p-0 bg-white text-black hover:bg-white/90 rounded-full"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <VideoController videoRef={videoRef} isPlaying={isPlaying} />

      {children}
    </div>
  );
};

export default VideoPlayer;
