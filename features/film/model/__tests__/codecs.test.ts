import { pickVideoMimeType } from "../codecs";

describe("pickVideoMimeType", () => {
  const orig = (globalThis as any).MediaRecorder;
  afterEach(() => {
    (globalThis as any).MediaRecorder = orig;
  });

  it("브라우저가 지원하는 첫 번째 후보를 반환한다", () => {
    (globalThis as any).MediaRecorder = {
      isTypeSupported: (t: string) => t === "video/mp4;codecs=h264",
    };
    expect(pickVideoMimeType()).toBe("video/mp4;codecs=h264");
  });

  it("어떤 후보도 지원하지 않으면 빈 문자열을 반환한다", () => {
    (globalThis as any).MediaRecorder = { isTypeSupported: () => false };
    expect(pickVideoMimeType()).toBe("");
  });

  it("MediaRecorder가 없는 환경에서 빈 문자열을 반환한다", () => {
    delete (globalThis as any).MediaRecorder;
    expect(pickVideoMimeType()).toBe("");
  });
});
