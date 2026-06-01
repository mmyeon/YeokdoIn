const CANDIDATES: readonly string[] = [
  "video/mp4;codecs=h264",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

export function pickVideoMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const type of CANDIDATES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function extensionFor(mime: string): "mp4" | "webm" {
  return mime.includes("mp4") ? "mp4" : "webm";
}
