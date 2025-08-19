import useMediaPipe from "@/hooks/useMediaPipe";
import { RefObject, useEffect } from "react";

const PoseAnalyzer = ({
  isPlaying,
  videoRef,
  canvasRef,
}: {
  isPlaying: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) => {
  const { detectPoseInVideo } = useMediaPipe({
    videoRef,
    canvasRef,
  });

  useEffect(() => {
    if (isPlaying) detectPoseInVideo();
  }, [isPlaying, detectPoseInVideo]);

  return (
    <canvas
      className="absolute w-full h-full object-contain pointer-events-none"
      ref={canvasRef}
    />
  );
};

export default PoseAnalyzer;
