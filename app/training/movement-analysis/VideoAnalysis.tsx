"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import VideoPlayer from "./VideoPlayer";
import VideoUpload from "./VideoUpload";

const VideoAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveFile = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    setSelectedFile(null);
    setVideoUrl(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = useCallback((file: File) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  }, []);

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4")}>
      {!selectedFile ? (
        <VideoUpload
          handleFileSelect={handleFileSelect}
          fileInputRef={fileInputRef}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium">선택된 파일:</span>
              <span className="text-sm text-muted-foreground">
                {selectedFile.name} ({getFileSize(selectedFile.size)})
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <VideoPlayer videoUrl={videoUrl} />
        </div>
      )}
    </div>
  );
};

export default VideoAnalysis;
