"use client";

import { useEffect, useRef, useState } from "react";
import VideoDisplay from "./VideoDisplay";
import VideoUpload from "./VideoUpload";

const MovementAnalysisPage = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setVideoUrl(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!uploadedFile) {
      setVideoUrl(null);
      return;
    }

    const url = URL.createObjectURL(uploadedFile);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [uploadedFile]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">동작 분석</h1>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          {!videoUrl ? (
            <VideoUpload
              handleFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
            />
          ) : (
            <VideoDisplay
              videoUrl={videoUrl}
              handleRemoveFile={handleRemoveFile}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MovementAnalysisPage;
