"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

const VideoDisplay = ({
  videoUrl,
  handleRemoveFile,
}: {
  videoUrl: string;
  handleRemoveFile: () => void;
}) => {
  return (
    <VideoPlayer videoUrl={videoUrl}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemoveFile}
        className="text-destructive hover:text-destructive p-2 absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
      >
        <X className="h-4 w-4" />
      </Button>
    </VideoPlayer>
  );
};

export default VideoDisplay;
