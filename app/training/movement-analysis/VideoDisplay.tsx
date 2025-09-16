"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

const VideoDisplay = ({
  uploadedFile,
  handleRemoveFile,
}: {
  uploadedFile: File;
  handleRemoveFile: () => void;
}) => {
  return (
    <VideoPlayer videoUrl={URL.createObjectURL(uploadedFile)}>
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
