import { useEffect, useRef, useState } from "react";
import PoseAnalyzer from "../PoseAnalyzer";
import VideoController from "./VideoController";

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
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

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleMetadataLoad = () => {
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        const containerWidth = video.clientWidth;
        const containerHeight = video.clientHeight;

        let canvasWidth, canvasHeight;

        if (containerWidth / containerHeight > videoAspectRatio) {
          canvasHeight = containerHeight;
          canvasWidth = containerHeight * videoAspectRatio;
        } else {
          canvasWidth = containerWidth;
          canvasHeight = containerWidth / videoAspectRatio;
        }

        if (canvasRef.current) {
          canvasRef.current.width = canvasWidth;
          canvasRef.current.height = canvasHeight;
        }
      };

      video.addEventListener("loadedmetadata", handleMetadataLoad);

      return () => {
        video.removeEventListener("loadedmetadata", handleMetadataLoad);
      };
    }
  }, []);

  return (
    <div className=" bg-black relative rounded-lg overflow-hidden w-full pb-[56.25%] h-0">
      <video
        ref={videoRef}
        src={videoUrl}
        className="cursor-pointer absolute top-0 left-0 w-full h-full"
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
      />
    </div>
  );
};

export default VideoPlayer;
