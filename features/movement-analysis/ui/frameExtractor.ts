/**
 * 비디오 Blob에서 지정 구간의 프레임을 canvas로 추출한다.
 * video/canvas 등 브라우저 DOM I/O에 의존하므로 model(순수 로직)이 아닌
 * ui 레이어에 위치한다.
 */

/** 단일 프레임 seek 최대 대기 시간(ms). 초과 시 영구 대기 대신 reject 한다. */
const SEEK_TIMEOUT_MS = 10_000;

interface ExtractOptions {
  startSec: number;
  endSec: number;
  fps: number;
  onProgress?: (p: number) => void;
}

export async function extractFrames(
  blob: Blob,
  { startSec, endSec, fps, onProgress }: ExtractOptions
): Promise<HTMLCanvasElement[]> {
  if (fps <= 0) throw new Error("fps는 0보다 커야 합니다");
  if (startSec >= endSec) throw new Error("startSec은 endSec보다 작아야 합니다");

  const url = URL.createObjectURL(blob);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;

  try {
    await new Promise<void>((resolve, reject) => {
      video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      video.addEventListener("error", () => reject(new Error("비디오 로드 실패")), {
        once: true,
      });
    });

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error("비디오 크기를 읽을 수 없습니다");
    }

    const interval = 1 / fps;
    const times: number[] = [];
    for (let t = startSec; t <= endSec + 0.001; t += interval) {
      times.push(Math.min(t, endSec));
    }

    const canvases: HTMLCanvasElement[] = [];

    for (let i = 0; i < times.length; i++) {
      video.currentTime = times[i];
      await waitForSeek(video);

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context 생성 실패");
      ctx.drawImage(video, 0, 0);
      canvases.push(canvas);

      onProgress?.((i + 1) / times.length);
    }

    return canvases;
  } finally {
    // 정상·예외 경로 모두에서 objectURL을 해제해 메모리 누수를 막는다.
    URL.revokeObjectURL(url);
  }
}

/** seek 완료(`seeked`)를 기다리되, 오류·타임아웃 시 reject 해 영구 대기를 방지한다. */
function waitForSeek(video: HTMLVideoElement): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("프레임 seek 실패"));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("프레임 seek 시간 초과"));
    }, SEEK_TIMEOUT_MS);
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}
