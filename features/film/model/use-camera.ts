export type FacingMode = "user" | "environment";

export type RecordingHandle = {
  stop: () => Promise<Blob>;
};

export async function startStream(
  facingMode: FacingMode = "environment"
): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ video: { facingMode } });
}

export function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

export function startRecording(
  stream: MediaStream,
  mimeType: string
): RecordingHandle {
  const chunks: Blob[] = [];
  const options = mimeType ? { mimeType } : {};
  const recorder = new MediaRecorder(stream, options);

  recorder.ondataavailable = (e: BlobEvent) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  return {
    stop: () =>
      new Promise((resolve, reject) => {
        if (recorder.state === "inactive") {
          resolve(new Blob(chunks, { type: mimeType }));
          return;
        }
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
        recorder.onerror = () => {
          reject(new Error("MediaRecorder error"));
        };
        recorder.stop();
      }),
  };
}
