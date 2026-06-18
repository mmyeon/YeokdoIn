"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { useKeyFrameAnalysis } from "@/features/movement-analysis/ui/useKeyFrameAnalysis";
import {
  stepAtom,
  videoFileAtom,
  videoUrlAtom,
  trimRangeAtom,
} from "@/features/movement-analysis/model/atoms";
import VideoUpload from "./VideoUpload";
import TrimScreen from "./TrimScreen";
import AnalyzingScreen from "./AnalyzingScreen";
import ResultsScreen from "./ResultsScreen";

const MovementAnalysisPage = () => {
  const [step, setStep] = useAtom(stepAtom);
  const [videoFile, setVideoFile] = useAtom(videoFileAtom);
  const [videoUrl, setVideoUrl] = useAtom(videoUrlAtom);
  const [trimRange, setTrimRange] = useAtom(trimRangeAtom);
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
  }, [status, step, setStep]);

  // 언마운트 시 진행 중인 분석을 정리하고 플로우 상태를 초기화한다.
  // 전역 atom이라 초기화하지 않으면 재방문 시 stale 단계(예: result가
  // 사라진 "done")로 빈 화면이 렌더될 수 있다.
  useEffect(() => {
    return () => {
      analysisAbortRef.current?.abort();
      setStep("upload");
      setVideoFile(null);
      setVideoUrl(null);
      setTrimRange([0, 0]);
    };
  }, [setStep, setVideoFile, setVideoUrl, setTrimRange]);

  useEffect(() => {
    if (!videoFile) {
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile, setVideoUrl]);

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
