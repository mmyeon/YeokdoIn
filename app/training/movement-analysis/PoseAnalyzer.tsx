import useMediaPipe from "@/hooks/useMediaPipe";
import { RefObject, useEffect } from "react";

const PoseAnalyzer = ({
  isPlaying,
  videoRef,
  canvasRef,
  trajectoryCanvasRef,
}: {
  isPlaying: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  trajectoryCanvasRef: RefObject<HTMLCanvasElement | null>;
}) => {
  const { detectPoseInVideo } = useMediaPipe({
    videoRef,
    canvasRef,
    trajectoryCanvasRef,
  });

  useEffect(() => {
    if (isPlaying) detectPoseInVideo();
  }, [isPlaying, detectPoseInVideo]);

  return (
    <>
      <canvas
        className="absolute w-full h-full object-contain top-0 left-0 pointer-events-none"
        ref={canvasRef}
      />

      <canvas
        className="absolute w-full h-full object-contain top-0 left-0 pointer-events-none"
        ref={trajectoryCanvasRef}
      />
    </>
  );
};

export default PoseAnalyzer;
