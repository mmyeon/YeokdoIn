import { saveToGallery } from "../save-to-gallery";

function makeBlob(type = "video/mp4"): Blob {
  return new Blob(["fake-video-data"], { type });
}

describe("saveToGallery", () => {
  const origShare = (globalThis as any).navigator?.share;
  const origCanShare = (globalThis as any).navigator?.canShare;
  const origCreateObjectURL = (globalThis as any).URL?.createObjectURL;
  const origRevokeObjectURL = (globalThis as any).URL?.revokeObjectURL;

  beforeEach(() => {
    if (!("URL" in globalThis)) {
      (globalThis as any).URL = {};
    }
    (globalThis as any).URL.createObjectURL = jest.fn(() => "blob:fake-url");
    (globalThis as any).URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    const nav = (globalThis as any).navigator ?? {};
    nav.share = origShare;
    nav.canShare = origCanShare;
    if (origCreateObjectURL !== undefined) {
      (globalThis as any).URL.createObjectURL = origCreateObjectURL;
    }
    if (origRevokeObjectURL !== undefined) {
      (globalThis as any).URL.revokeObjectURL = origRevokeObjectURL;
    }
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
      const blob = makeBlob("video/mp4");
      await saveToGallery(blob, "mp4");

      expect(shareMock).toHaveBeenCalledTimes(1);
      const callArg = shareMock.mock.calls[0][0];
      expect(callArg.files).toHaveLength(1);
      expect(callArg.files[0]).toBeInstanceOf(File);
      expect(callArg.files[0].name).toMatch(/\.mp4$/);
      expect(callArg.files[0].type).toBe("video/mp4");
    });

    it("webm Blob은 .webm 확장자 File로 변환한다", async () => {
      const blob = makeBlob("video/webm");
      await saveToGallery(blob, "webm");

      const callArg = shareMock.mock.calls[0][0];
      expect(callArg.files[0].name).toMatch(/\.webm$/);
    });
  });

  describe("Web Share API 미지원 환경 (폴백)", () => {
    let clickSpy: jest.Mock;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;
    let createElementSpy: jest.SpyInstance;

    beforeEach(() => {
      setNavigatorShare(undefined, undefined);

      clickSpy = jest.fn();
      const fakeAnchor = {
        click: clickSpy,
        href: "",
        download: "",
      };

      if (!(globalThis as any).document) {
        (globalThis as any).document = {
          createElement: jest.fn(() => fakeAnchor),
          body: {
            appendChild: jest.fn((n: unknown) => n),
            removeChild: jest.fn((n: unknown) => n),
          },
        };
      } else {
        createElementSpy = jest
          .spyOn(document, "createElement")
          .mockReturnValue(fakeAnchor as any);
        appendChildSpy = jest
          .spyOn(document.body, "appendChild")
          .mockImplementation((n) => n);
        removeChildSpy = jest
          .spyOn(document.body, "removeChild")
          .mockImplementation((n) => n);
      }
    });

    afterEach(() => {
      createElementSpy?.mockRestore();
      appendChildSpy?.mockRestore();
      removeChildSpy?.mockRestore();
    });

    it("다운로드 링크를 클릭해 파일을 저장한다", async () => {
      const blob = makeBlob("video/mp4");
      await saveToGallery(blob, "mp4");

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it("링크 클릭 후 object URL을 해제한다", async () => {
      const blob = makeBlob("video/mp4");
      await saveToGallery(blob, "mp4");

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
    });

    it("그 외 에러는 re-throw한다", async () => {
      const netError = new Error("network error");
      setNavigatorShare(
        jest.fn().mockRejectedValue(netError),
        jest.fn().mockReturnValue(true)
      );

      await expect(saveToGallery(makeBlob(), "mp4")).rejects.toThrow(
        "network error"
      );
    });
  });
});
