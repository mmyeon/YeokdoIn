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
  const url = URL.createObjectURL(blob);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;

  await new Promise<void>((resolve, reject) => {
    video.addEventListener("loadedmetadata", () => resolve(), { once: true });
    video.addEventListener("error", () => reject(new Error("비디오 로드 실패")), { once: true });
  });

  const interval = 1 / fps;
  const times: number[] = [];
  for (let t = startSec; t <= endSec + 0.001; t += interval) {
    times.push(Math.min(t, endSec));
  }

  const canvases: HTMLCanvasElement[] = [];

  for (let i = 0; i < times.length; i++) {
    video.currentTime = times[i];
    await new Promise<void>((resolve) => {
      video.addEventListener("seeked", () => resolve(), { once: true });
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context 생성 실패");
    ctx.drawImage(video, 0, 0);
    canvases.push(canvas);

    onProgress?.((i + 1) / times.length);
  }

  URL.revokeObjectURL(url);
  return canvases;
}
