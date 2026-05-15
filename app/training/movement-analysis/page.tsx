"use client";

import { useEffect, useRef, useState } from "react";
import { useKeyFrameAnalysis } from "@/features/movement-analysis/ui/useKeyFrameAnalysis";
import VideoUpload from "./VideoUpload";
import TrimScreen from "./TrimScreen";
import AnalyzingScreen from "./AnalyzingScreen";
import ResultsScreen from "./ResultsScreen";

type Step = "upload" | "trim" | "analyzing" | "done";

const MovementAnalysisPage = () => {
  const [step, setStep] = useState<Step>("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { analyze, status, progress, result, error } = useKeyFrameAnalysis();

  const handleFileSelect = (file: File) => {
    setVideoFile(file);
    setStep("trim");
  };

  const handleBack = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async (startSec: number, endSec: number) => {
    if (!videoFile) return;
    setTrimRange([startSec, endSec]);
    setStep("analyzing");
    await analyze(videoFile, startSec, endSec);
  };

  const handleCancelAnalysis = () => {
    setStep("trim");
  };

  useEffect(() => {
    if (status === "done") setStep("done");
    if (status === "error") setStep("trim");
  }, [status]);

  useEffect(() => {
    if (!videoFile) {
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  if (step === "upload") {
    return (
      <VideoUpload fileInputRef={fileInputRef} onFileSelect={handleFileSelect} />
    );
  }

  if (step === "trim" && videoUrl) {
    return (
      <TrimScreen
        videoUrl={videoUrl}
        onBack={handleBack}
        onAnalyze={handleAnalyze}
        error={status === "error" ? error : null}
      />
    );
  }

  if (step === "analyzing") {
    return (
      <AnalyzingScreen
        progress={progress}
        pipelineStatus={status as "extracting" | "detecting"}
        onCancel={handleCancelAnalysis}
      />
    );
  }

  if (step === "done" && result !== null && videoUrl !== null) {
    return (
      <ResultsScreen
        videoUrl={videoUrl}
        result={result}
        trimRange={trimRange}
        onBack={handleBack}
      />
    );
  }

  return null;
};

export default MovementAnalysisPage;
