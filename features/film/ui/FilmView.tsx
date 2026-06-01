"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  ExercisePosition,
  SetRecord,
} from "@/features/program-runner/model/types";
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
  records: SetRecord[][];
  /** 카메라를 열 때 시작할 위치 — 이후 탐색은 로컬 상태로 운동 로깅과 분리된다 */
  initialPosIdx: number;
  initialSetIdx: number;
  onClose: () => void;
}

function cameraErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "카메라를 찾을 수 없습니다. 디바이스에 카메라가 연결되어 있는지 확인해 주세요.";
  }
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return "카메라 설정을 지원하지 않습니다. 다른 카메라를 시도해 주세요.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "카메라를 사용할 수 없습니다. 다른 앱에서 카메라를 사용 중인지 확인해 주세요.";
  }
  return "카메라 권한이 필요합니다. 설정에서 카메라 접근을 허용해 주세요.";
}

export function FilmView({
  positions,
  records,
  initialPosIdx,
  initialSetIdx,
  onClose,
}: FilmViewProps) {
  // 촬영 탐색은 로컬 상태 — 운동 로깅(Standard/Focus의 현재 세트)과 분리된다
  const [nav, setNav] = useState<FilmNavigatorState>({
    positionIdx: initialPosIdx,
    setIdx: initialSetIdx,
  });
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mimeType] = useState(() => pickVideoMimeType());
  const [facing, setFacing] = useState<FacingMode>("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // 언마운트 cleanup에서 최신 stream에 접근하기 위한 ref
  const streamRef = useRef<MediaStream | null>(null);
  streamRef.current = stream;
  // handleFlip 진행 중 이중 호출 방지
  const flippingRef = useRef(false);

  // 마운트 시 카메라를 즉시 연다 — 중간 단계 없이 1탭 진입
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await startStream("environment");
        if (cancelled) {
          stopStream(s);
          return;
        }
        setStream(s);
      } catch (err) {
        if (!cancelled) setCameraError(cameraErrorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) stopStream(streamRef.current);
    };
  }, []);

  // 에러 화면으로 전환되면 카메라를 즉시 해제 — 프리뷰가 사라진 채 카메라가 켜져 있지 않도록
  useEffect(() => {
    if (cameraError && streamRef.current) {
      stopStream(streamRef.current);
      setStream(null);
    }
  }, [cameraError]);

  const handleFlip = useCallback(async () => {
    if (flippingRef.current) return;
    flippingRef.current = true;

    const prevFacing = facing;
    const nextFacing: FacingMode =
      facing === "environment" ? "user" : "environment";
    if (stream) stopStream(stream);
    setFacing(nextFacing);
    try {
      const s = await startStream(nextFacing);
      setStream(s);
    } catch {
      // 전환 실패 — 촬영을 유지하기 위해 이전 카메라로 복구 시도
      setFacing(prevFacing);
      try {
        const s = await startStream(prevFacing);
        setStream(s);
      } catch {
        setStream(null);
        setCameraError("카메라를 전환할 수 없습니다.");
      }
    } finally {
      flippingRef.current = false;
    }
  }, [facing, stream]);

  const currentPosition = positions[nav.positionIdx];

  if (cameraError || !currentPosition) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black p-6 text-center">
        <p role="alert" className="text-sm text-red-300">
          {cameraError ?? "촬영할 동작을 찾을 수 없습니다."}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-900"
        >
          닫기
        </button>
      </div>
    );
  }

  const kg = records[nav.positionIdx]?.[nav.setIdx]?.kg ?? null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <CameraPane
        stream={stream}
        mimeType={mimeType}
        recording={recording}
        onRecordingChange={setRecording}
        onFlip={handleFlip}
        onClose={onClose}
        onSaveError={(err) =>
          setCameraError(
            err instanceof Error ? err.message : "영상 저장에 실패했습니다."
          )
        }
      >
        <ProgramOverlay
          position={currentPosition}
          setIdx={nav.setIdx}
          kg={kg}
          canPrev={canPrev(nav)}
          canNext={canNext(nav, positions)}
          locked={recording}
          onPrev={() => setNav((s) => stepPrev(s, positions))}
          onNext={() => setNav((s) => stepNext(s, positions))}
        />
      </CameraPane>
    </div>
  );
}
