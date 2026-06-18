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
  const analysisAbortRef = useRef<AbortController | null>(null);

  const { analyze, status, progress, result, error } = useKeyFrameAnalysis();

  const handleFileSelect = (file: File) => {
    setVideoFile(file);
    setStep("trim");
  };

  const handleBack = () => {
    analysisAbortRef.current?.abort();
    setVideoFile(null);
    setVideoUrl(null);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async (startSec: number, endSec: number) => {
    if (!videoFile) return;
    // 이전 실행이 남아 있으면 중단해 상태 경합을 막는다.
    analysisAbortRef.current?.abort();
    const controller = new AbortController();
    analysisAbortRef.current = controller;
    setTrimRange([startSec, endSec]);
    setStep("analyzing");
    await analyze(videoFile, startSec, endSec, controller.signal);
  };

  const handleCancelAnalysis = () => {
    analysisAbortRef.current?.abort();
    setStep("trim");
  };

  // 분석 화면에 머무는 동안에만 status 변화로 화면을 전환한다.
  // 취소 후 뒤늦게 끝난 stale 실행이 화면을 가로채지 못하게 한다.
  useEffect(() => {
    if (step !== "analyzing") return;
    if (status === "done") setStep("done");
    if (status === "error") setStep("trim");
  }, [status, step]);

  // 언마운트 시 진행 중인 분석 정리.
  useEffect(() => () => analysisAbortRef.current?.abort(), []);

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
