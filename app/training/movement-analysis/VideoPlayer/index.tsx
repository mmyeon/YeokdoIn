import { useEffect, useRef, useState, MouseEvent, ReactNode } from "react";
import PoseAnalyzer from "../PoseAnalyzer";
import VideoController from "./VideoController";

const VideoPlayer = ({
  videoUrl,
  children,
}: {
  videoUrl: string;
  children: ReactNode;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) video.play();
      else video.pause();
    }
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleMuteToggle = () => {
    if (videoRef.current) videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    const { width, left } = e.currentTarget.getBoundingClientRect();
    const { clientX } = e;

    const relativeX = clientX - left;
    const newTime = (relativeX / width) * duration;

    const clampedTime = Math.max(0, Math.min(newTime, duration));

    if (videoRef.current) {
      videoRef.current.currentTime = clampedTime;
      handleVideoTimeUpdate();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleMetadataLoad = () => {
        if (canvasRef.current) {
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
        }
      };

      video.addEventListener("loadedmetadata", handleMetadataLoad);

      return () => {
        video.removeEventListener("loadedmetadata", handleMetadataLoad);
      };
    }
  }, []);

  return (
    <div className=" bg-black relative rounded-lg overflow-hidden w-full pb-[177.78%] md:pb-[56.25%] h-0 md:w-1/2 mx-auto">
      <video
        playsInline
        ref={videoRef}
        src={videoUrl}
        className="cursor-pointer absolute object-contain top-0 left-0 w-full h-full"
        onTimeUpdate={handleVideoTimeUpdate}
        onLoadedMetadata={handleVideoLoadedMetadata}
        muted={isMuted}
        onClick={togglePlayPause}
        onPause={handleVideoPause}
        onPlay={handleVideoPlay}
        onEnded={handleVideoEnded}
      />

      <PoseAnalyzer
        videoRef={videoRef}
        canvasRef={canvasRef}
        isPlaying={isPlaying}
      />

      <VideoController
        currentTime={currentTime}
        duration={duration}
        isMuted={isMuted}
        handleMuteToggle={handleMuteToggle}
        togglePlayPause={togglePlayPause}
        isPlaying={isPlaying}
        handleProgressClick={handleProgressClick}
      />

      {children}
    </div>
  );
};

export default VideoPlayer;
