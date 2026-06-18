/**
 * 동작 분석 파이프라인에 들어가기 전 영상 입력을 검증하는 순수 로직.
 * I/O·React 의존성이 없어 model 레이어에 위치한다.
 */

/** 업로드 허용 최대 용량 (200MB). VideoUpload 안내 칩과 동일 기준. */
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

/** 분석 가능한 최소 구간 길이(초). 이보다 짧으면 키프레임 검출이 불안정하다. */
export const MIN_CLIP_SEC = 1;

export type VideoFileValidation =
  | { ok: true }
  | { ok: false; reason: string };

/** File에서 검증에 필요한 최소 속성만 추려 테스트 가능하게 한다. */
type ValidatableFile = Pick<File, "type" | "size">;

export function validateVideoFile(file: ValidatableFile): VideoFileValidation {
  if (!file.type.startsWith("video/")) {
    return { ok: false, reason: "Please upload a video file." };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { ok: false, reason: "Video must be 200 MB or smaller." };
  }
  return { ok: true };
}

/** 선택 구간이 분석 가능한 최소 길이를 충족하는지 여부. */
export function isClipLongEnough(durationSec: number): boolean {
  return durationSec >= MIN_CLIP_SEC;
}
