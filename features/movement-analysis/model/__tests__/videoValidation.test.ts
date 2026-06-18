import {
  validateVideoFile,
  isClipLongEnough,
  MAX_VIDEO_BYTES,
  MIN_CLIP_SEC,
} from "../videoValidation";

describe("validateVideoFile", () => {
  it("video 타입이고 용량 제한 이내면 통과한다", () => {
    const result = validateVideoFile({ type: "video/mp4", size: 1024 });
    expect(result.ok).toBe(true);
  });

  it("video 타입이 아니면 실패하고 사유를 반환한다", () => {
    const result = validateVideoFile({ type: "image/png", size: 1024 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/video/i);
  });

  it("타입이 비어 있으면 실패한다", () => {
    const result = validateVideoFile({ type: "", size: 1024 });
    expect(result.ok).toBe(false);
  });

  it("최대 용량과 같으면 통과한다", () => {
    const result = validateVideoFile({ type: "video/quicktime", size: MAX_VIDEO_BYTES });
    expect(result.ok).toBe(true);
  });

  it("최대 용량을 초과하면 실패하고 사유를 반환한다", () => {
    const result = validateVideoFile({ type: "video/mp4", size: MAX_VIDEO_BYTES + 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/MB/);
  });
});

describe("isClipLongEnough", () => {
  it("최소 길이와 같으면 true를 반환한다", () => {
    expect(isClipLongEnough(MIN_CLIP_SEC)).toBe(true);
  });

  it("최소 길이보다 길면 true를 반환한다", () => {
    expect(isClipLongEnough(MIN_CLIP_SEC + 0.5)).toBe(true);
  });

  it("최소 길이보다 짧으면 false를 반환한다", () => {
    expect(isClipLongEnough(MIN_CLIP_SEC - 0.1)).toBe(false);
  });

  it("0초면 false를 반환한다", () => {
    expect(isClipLongEnough(0)).toBe(false);
  });
});
