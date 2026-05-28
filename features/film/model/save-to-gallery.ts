type VideoExtension = "mp4" | "webm";

function buildFileName(ext: VideoExtension): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  return `yeokdo-${ts}.${ext}`;
}

function canUseShareApi(file: File): boolean {
  return (
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

async function shareFile(file: File): Promise<void> {
  try {
    await navigator.share({ files: [file] });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") return;
    throw err;
  }
}

function downloadFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function saveToGallery(
  blob: Blob,
  ext: VideoExtension
): Promise<void> {
  const fileName = buildFileName(ext);
  const file = new File([blob], fileName, { type: blob.type });

  if (canUseShareApi(file)) {
    await shareFile(file);
  } else {
    downloadFile(blob, fileName);
  }
}
