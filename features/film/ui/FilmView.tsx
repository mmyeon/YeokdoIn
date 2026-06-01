"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Video } from "lucide-react";

import type { ExercisePosition } from "@/features/program-runner/model/types";
import type { FacingMode } from "../model/use-camera";
import { startStream, stopStream } from "../model/use-camera";
import { pickVideoMimeType } from "../model/codecs";
import {
  canPrev,
  canNext,
  stepPrev,
  stepNext,
} from "../model/film-navigator";
import type { FilmNavigatorState } from "../model/film-navigator";
import { CameraPane } from "./CameraPane";
import { ProgramOverlay } from "./ProgramOverlay";

interface FilmViewProps {
  positions: ExercisePosition[];
  posIdx: number;
  setIdx: number;
  onNavigate: (posIdx: number, setIdx: number) => void;
}

export function FilmView({ positions, posIdx, setIdx, onNavigate }: FilmViewProps) {
  const [filmMode, setFilmMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mimeType] = useState(() => pickVideoMimeType());
  const [facing, setFacing] = useState<FacingMode>("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // 언마운트 cleanup에서 최신 stream에 접근하기 위한 ref
  const streamRef = useRef<MediaStream | null>(null);
  streamRef.current = stream;
  // handleFlip 진행 중 이중 호출 방지
  const flippingRef = useRef(false);

  const openCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const s = await startStream(facing);
      setStream(s);
      setFilmMode(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraError("카메라를 찾을 수 없습니다. 디바이스에 카메라가 연결되어 있는지 확인해 주세요.");
      } else if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
        setCameraError("카메라 설정을 지원하지 않습니다. 다른 카메라를 시도해 주세요.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCameraError("카메라를 사용할 수 없습니다. 다른 앱에서 카메라를 사용 중인지 확인해 주세요.");
      } else {
        setCameraError("카메라 권한이 필요합니다. 설정에서 카메라 접근을 허용해 주세요.");
      }
    }
  }, [facing]);

  const closeCamera = useCallback(() => {
    if (stream) stopStream(stream);
    setStream(null);
    setFilmMode(false);
  }, [stream]);

  const handleFlip = useCallback(async () => {
    if (flippingRef.current) return;
    flippingRef.current = true;

    const prevFacing = facing;
    const nextFacing: FacingMode = facing === "environment" ? "user" : "environment";
    if (stream) stopStream(stream);
    setFacing(nextFacing);
    try {
      const s = await startStream(nextFacing);
      setStream(s);
    } catch {
      setStream(null);
      setFilmMode(false);
      setFacing(prevFacing);
      setCameraError("카메라를 전환할 수 없습니다.");
    } finally {
      flippingRef.current = false;
    }
  }, [facing, stream]);

  // 언마운트 시 스트림 정리 — setState 없이 ref를 통해 직접 해제
  useEffect(() => {
    return () => {
      if (streamRef.current) stopStream(streamRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nav: FilmNavigatorState = { positionIdx: posIdx, setIdx };
  const currentPosition = positions[posIdx];

  if (filmMode && currentPosition) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <CameraPane
          stream={stream}
          mimeType={mimeType}
          onFlip={handleFlip}
          onClose={closeCamera}
          onSaveError={(err) =>
            setCameraError(
              err instanceof Error ? err.message : "영상 저장에 실패했습니다."
            )
          }
        >
          <ProgramOverlay
            position={currentPosition}
            setIdx={setIdx}
            canPrev={canPrev(nav)}
            canNext={canNext(nav, positions)}
            onPrev={() => {
              const next = stepPrev(nav, positions);
              onNavigate(next.positionIdx, next.setIdx);
            }}
            onNext={() => {
              const next = stepNext(nav, positions);
              onNavigate(next.positionIdx, next.setIdx);
            }}
          />
        </CameraPane>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {cameraError ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {cameraError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {positions.map((pos, posItemIdx) => (
          <div
            key={posItemIdx}
            className={[
              "rounded-xl border px-4 py-3 text-sm",
              posItemIdx === posIdx
                ? "border-blue-400 bg-blue-50 font-semibold text-blue-900"
                : "border-gray-200 bg-white text-gray-700",
            ].join(" ")}
          >
            <span className="block font-medium">{pos.movement.name}</span>
            <span className="text-xs text-gray-500">
              {pos.sets.length}세트
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={openCamera}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-base font-semibold text-white active:scale-95"
      >
        <Video className="h-5 w-5" />
        촬영하기
      </button>
    </div>
  );
}
