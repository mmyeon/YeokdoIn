import { Button } from "@/components/ui/button";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, RefObject } from "react";

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const VideoController = ({
  videoRef,
  isPlaying,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const { width, left } = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - left;
    const newTime = (relativeX / width) * duration;
    videoRef.current.currentTime = newTime;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updateVolume = () => setIsMuted(video.muted);

    setDuration(video.duration || 0);
    setCurrentTime(video.currentTime || 0);
    setIsMuted(video.muted);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("volumechange", updateVolume);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("volumechange", updateVolume);
    };
  }, [videoRef]);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleMuteToggle}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div
        className="w-full bg-white/20 rounded-full h-1 mt-2 cursor-pointer"
        onClick={handleProgressClick}
      >
        <div
          className="bg-white h-1 rounded-full transition-all duration-300"
          style={{
            width: `${(currentTime / duration) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default VideoController;
