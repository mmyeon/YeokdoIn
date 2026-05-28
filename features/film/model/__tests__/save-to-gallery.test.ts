import { saveToGallery } from "../save-to-gallery";

function makeBlob(type = "video/mp4"): Blob {
  return new Blob(["fake-video-data"], { type });
}

function makeClickSpy() {
  return jest.fn();
}

describe("saveToGallery", () => {
  let clickSpy: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();

    if (!("URL" in globalThis)) {
      (globalThis as any).URL = {};
    }
    (globalThis as any).URL.createObjectURL = jest.fn(() => "blob:fake-url");
    (globalThis as any).URL.revokeObjectURL = jest.fn();

    clickSpy = makeClickSpy();
    const fakeAnchor = { click: clickSpy, href: "", download: "" };
    if (!(globalThis as any).document) {
      (globalThis as any).document = {
        createElement: () => fakeAnchor,
        body: {
          appendChild: jest.fn((n: unknown) => n),
          removeChild: jest.fn((n: unknown) => n),
        },
      };
    } else {
      jest.spyOn(document, "createElement").mockReturnValue(fakeAnchor as any);
      jest.spyOn(document.body, "appendChild").mockImplementation((n) => n);
      jest.spyOn(document.body, "removeChild").mockImplementation((n) => n);
    }
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function setNavigatorShare(
    shareFn: jest.Mock | undefined,
    canShareFn: jest.Mock | undefined
  ) {
    if (!(globalThis as any).navigator) {
      Object.defineProperty(globalThis, "navigator", {
        value: {},
        configurable: true,
        writable: true,
      });
    }
    Object.defineProperty((globalThis as any).navigator, "share", {
      value: shareFn,
      configurable: true,
      writable: true,
    });
    Object.defineProperty((globalThis as any).navigator, "canShare", {
      value: canShareFn,
      configurable: true,
      writable: true,
    });
  }

  describe("Web Share API 사용 가능한 환경", () => {
    let shareMock: jest.Mock;

    beforeEach(() => {
      shareMock = jest.fn().mockResolvedValue(undefined);
      setNavigatorShare(shareMock, jest.fn().mockReturnValue(true));
    });

    it("mp4 Blob을 File로 변환해 navigator.share를 호출한다", async () => {
      await saveToGallery(makeBlob("video/mp4"), "mp4");

      expect(shareMock).toHaveBeenCalledTimes(1);
      const { files } = shareMock.mock.calls[0][0];
      expect(files).toHaveLength(1);
      expect(files[0]).toBeInstanceOf(File);
      expect(files[0].name).toMatch(/\.mp4$/);
      expect(files[0].type).toBe("video/mp4");
    });

    it("webm Blob은 .webm 확장자 File로 변환한다", async () => {
      await saveToGallery(makeBlob("video/webm"), "webm");

      const { files } = shareMock.mock.calls[0][0];
      expect(files[0].name).toMatch(/\.webm$/);
    });
  });

  describe("Web Share API 미지원 환경 (폴백)", () => {
    beforeEach(() => {
      setNavigatorShare(undefined, undefined);
    });

    it("다운로드 링크를 클릭해 파일을 저장한다", async () => {
      await saveToGallery(makeBlob("video/mp4"), "mp4");

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it("링크 클릭 후 타이머 실행 시 object URL을 해제한다", async () => {
      await saveToGallery(makeBlob("video/mp4"), "mp4");
      jest.runAllTimers();

      expect((globalThis as any).URL.revokeObjectURL).toHaveBeenCalledWith(
        "blob:fake-url"
      );
    });
  });

  describe("navigator.share가 실패하는 경우", () => {
    it("AbortError는 조용히 무시한다 (사용자가 공유 취소)", async () => {
      const abortError = Object.assign(new Error("share aborted"), {
        name: "AbortError",
      });
      setNavigatorShare(
        jest.fn().mockRejectedValue(abortError),
        jest.fn().mockReturnValue(true)
      );

      await expect(saveToGallery(makeBlob(), "mp4")).resolves.toBeUndefined();
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it("AbortError 외 에러(NotAllowedError 등)는 downloadFile 폴백으로 전환한다", async () => {
      const notAllowedError = Object.assign(new Error("not allowed"), {
        name: "NotAllowedError",
      });
      setNavigatorShare(
        jest.fn().mockRejectedValue(notAllowedError),
        jest.fn().mockReturnValue(true)
      );

      await expect(saveToGallery(makeBlob(), "mp4")).resolves.toBeUndefined();
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it("canShare가 throw하면 downloadFile 폴백으로 전환한다", async () => {
      setNavigatorShare(
        jest.fn(),
        jest.fn().mockImplementation(() => {
          throw new TypeError("canShare error");
        })
      );

      await expect(saveToGallery(makeBlob(), "mp4")).resolves.toBeUndefined();
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });
});
