"use client";

import { useEffect, useRef, useState } from "react";
import { X, FlipHorizontal2, Circle, Square } from "lucide-react";

import type { RecordingHandle } from "../model/use-camera";
import { startRecording } from "../model/use-camera";
import { extensionFor } from "../model/codecs";
import { saveToGallery } from "../model/save-to-gallery";

interface CameraPaneProps {
  stream: MediaStream | null;
  mimeType: string;
  recording: boolean;
  onRecordingChange: (recording: boolean) => void;
  onFlip: () => void;
  onClose: () => void;
  onSaveError?: (err: unknown) => void;
  children?: React.ReactNode;
}

export function CameraPane({
  stream,
  mimeType,
  recording,
  onRecordingChange,
  onFlip,
  onClose,
  onSaveError,
  children,
}: CameraPaneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [closePending, setClosePending] = useState(false);
  // handleRef: recording 중 ref로 관리해 상태와 분리 — race condition 방지
  const handleRef = useRef<RecordingHandle | null>(null);
  // 이중 탭 방지: toggle 처리 중 flag
  const togglingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!stream) {
      video.pause();
      video.srcObject = null;
      return;
    }
    video.srcObject = stream;
    video.play().catch(() => {});
  }, [stream]);

  // 페이지 이탈 시 녹화 중 경고
  useEffect(() => {
    if (!recording) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [recording]);

  // unmount 시 active MediaRecorder 정리
  useEffect(() => {
    return () => {
      handleRef.current?.stop().catch(() => {});
      handleRef.current = null;
    };
  }, []);

  async function handleToggleRecording() {
    if (togglingRef.current) return;
    togglingRef.current = true;

    try {
      if (!handleRef.current) {
        if (!stream) return;
        handleRef.current = startRecording(stream, mimeType);
        onRecordingChange(true);
        return;
      }

      const handle = handleRef.current;
      handleRef.current = null;
      onRecordingChange(false);
      try {
        const blob = await handle.stop();
        await saveToGallery(blob, extensionFor(mimeType));
      } catch (err) {
        onSaveError?.(err);
      }
    } finally {
      togglingRef.current = false;
    }
  }

  function handleCloseRequest() {
    if (recording) {
      setClosePending(true);
    } else {
      onClose();
    }
  }

  async function handleConfirmClose() {
    setClosePending(false);
    const handle = handleRef.current;
    handleRef.current = null;
    onRecordingChange(false);
    // stop()을 await해 MediaRecorder가 flush할 시간을 준 뒤 닫기
    if (handle) await handle.stop().catch(() => {});
    onClose();
  }

  function handleCancelClose() {
    setClosePending(false);
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        playsInline
        muted
        aria-label="카메라 프리뷰"
      />

      {/* 상단 버튼 영역 */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
        <button
          type="button"
          onClick={onFlip}
          disabled={recording}
          aria-label="카메라 전환"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30"
        >
          <FlipHorizontal2 className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleCloseRequest}
          aria-label="촬영 종료"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ProgramOverlay 슬롯 */}
      {children}

      {/* REC 버튼 — 하단 ProgramOverlay 띠와 겹치지 않도록 위로 띄움 */}
      <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        {recording ? (
          <span className="text-xs font-bold tracking-widest text-red-500">
            ● REC
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleToggleRecording}
          aria-label={recording ? "녹화 중지" : "녹화 시작"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg active:scale-95"
        >
          {recording ? (
            <Square className="h-7 w-7 fill-red-600 text-red-600" />
          ) : (
            <Circle className="h-7 w-7 fill-red-500 text-red-500" />
          )}
        </button>
      </div>

      {/* 녹화 중 닫기 확인 다이얼로그 (window.confirm 대신 in-tree UI) */}
      {closePending ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="close-dialog-title"
          className="absolute inset-0 flex items-center justify-center bg-black/70 p-6"
        >
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl">
            <p
              id="close-dialog-title"
              className="mb-1 text-base font-semibold text-gray-900"
            >
              녹화를 종료할까요?
            </p>
            <p className="mb-6 text-sm text-gray-500">
              현재 녹화가 취소되고 저장되지 않습니다.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelClose}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700"
              >
                계속 촬영
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white"
              >
                종료
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
