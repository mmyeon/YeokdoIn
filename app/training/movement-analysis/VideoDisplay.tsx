"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import VideoPlayer from "./VideoPlayer";
import FileInfoDisplay from "./FileInfoDisplay";

const VideoDisplay = ({
  uploadedFile,
  handleRemoveFile,
}: {
  uploadedFile: File;
  handleRemoveFile: () => void;
}) => {
  return (
    <div className={cn("space-y-4")}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FileInfoDisplay file={uploadedFile} />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <VideoPlayer videoUrl={URL.createObjectURL(uploadedFile)} />
      </div>
    </div>
  );
};

export default VideoDisplay;
