"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import PoseAnalyzer from "../PoseAnalyzer";
import VideoController from "./VideoController";

interface VideoPlayerProps {
  videoUrl: string;
  children: ReactNode;
  onAnalyze: (startSec: number, endSec: number) => void;
  seekTarget: number | null;
}

const VideoPlayer = ({
  videoUrl,
  children,
  onAnalyze,
  seekTarget,
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleMetadataLoad = () => {
      if (canvasRef.current) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }
      setDuration(video.duration);
    };

    video.addEventListener("loadedmetadata", handleMetadataLoad);

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadataLoad);
    };
  }, []);

  useEffect(() => {
    if (seekTarget === null || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = seekTarget / 1000;
  }, [seekTarget]);

  return (
    <div className="bg-black relative w-full h-[calc(100dvh-var(--tab-bar-height))] overflow-hidden">
      <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
        <Button
          onClick={() => onAnalyze(0, duration)}
          disabled={duration === 0}
          className="bg-black/70 text-white border border-white/30 hover:bg-black/90 hover:border-white/60 font-semibold px-6 py-2 shadow-lg"
        >
          Analyze Lift
        </Button>
      </div>
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

      <VideoController videoRef={videoRef} isPlaying={isPlaying} />

      {children}
    </div>
  );
};

export default VideoPlayer;
