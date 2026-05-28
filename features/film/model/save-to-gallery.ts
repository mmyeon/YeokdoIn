type VideoExtension = "mp4" | "webm";

function buildFileName(ext: VideoExtension): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  return `yeokdo-${ts}.${ext}`;
}

function canUseShareApi(file: File): boolean {
  try {
    return (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    );
  } catch {
    return false;
  }
}

async function shareFile(file: File): Promise<void> {
  await navigator.share({ files: [file] });
}

function downloadFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export async function saveToGallery(
  blob: Blob,
  ext: VideoExtension
): Promise<void> {
  const fileName = buildFileName(ext);
  const file = new File([blob], fileName, { type: blob.type });

  if (canUseShareApi(file)) {
    try {
      await shareFile(file);
      return;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }
  downloadFile(blob, fileName);
}
