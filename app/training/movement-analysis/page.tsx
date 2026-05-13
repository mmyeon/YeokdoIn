"use client";

import { useEffect, useRef, useState } from "react";
import { useKeyFrameAnalysis } from "@/features/movement-analysis/ui/useKeyFrameAnalysis";
import { KeyFrameResults } from "@/features/movement-analysis/ui/KeyFrameResults";
import VideoDisplay from "./VideoDisplay";
import VideoUpload from "./VideoUpload";

const STATUS_LABEL: Record<"extracting" | "detecting", string> = {
  extracting: "Extracting frames…",
  detecting: "Detecting poses…",
};

const MovementAnalysisPage = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { analyze, status, progress, result, error } = useKeyFrameAnalysis();

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setVideoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async (startSec: number, endSec: number) => {
    if (!uploadedFile) return;
    await analyze(uploadedFile, startSec, endSec);
  };

  const handleSeek = (timeMs: number) => {
    setSeekTarget(timeMs);
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
    <div className="max-w-md mx-auto overflow-y-auto flex flex-col">
      {!videoUrl ? (
        <div className="px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Movement Analysis</h1>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <VideoUpload
              handleFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
            />
          </div>
        </div>
      ) : (
        <>
          <VideoDisplay
            videoUrl={videoUrl}
            handleRemoveFile={handleRemoveFile}
            onAnalyze={handleAnalyze}
            seekTarget={seekTarget}
          />

          {(status === "extracting" || status === "detecting") && (
            <div className="px-4 py-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                {STATUS_LABEL[status]}
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {Math.round(progress * 100)}%
              </p>
            </div>
          )}

          {status === "error" && error !== null && (
            <div className="px-4 py-4 border-t">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {status === "done" && result !== null && (
            <div className="px-4 py-4 border-t">
              <KeyFrameResults result={result} onSeek={handleSeek} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MovementAnalysisPage;
