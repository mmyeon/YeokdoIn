import { useEffect, useRef, useState, ReactNode } from "react";
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
  const trajectoryCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

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
      if (
        canvasRef.current &&
        trajectoryCanvasRef.current &&
        maskCanvasRef.current
      ) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        trajectoryCanvasRef.current.width = video.videoWidth;
        trajectoryCanvasRef.current.height = video.videoHeight;
        maskCanvasRef.current.width = video.videoWidth;
        maskCanvasRef.current.height = video.videoHeight;
      }
    };

    video.addEventListener("loadedmetadata", handleMetadataLoad);

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadataLoad);
    };
  }, []);

  return (
    <div className=" bg-black relative rounded-lg overflow-hidden w-full pb-[177.78%] md:pb-[56.25%] h-0 md:w-1/2 mx-auto">
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
        trajectoryCanvasRef={trajectoryCanvasRef}
        maskCanvasRef={maskCanvasRef}
        isPlaying={isPlaying}
      />

      <VideoController videoRef={videoRef} isPlaying={isPlaying} />

      {children}
    </div>
  );
};

export default VideoPlayer;
