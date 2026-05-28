import { startStream, stopStream, startRecording } from "../use-camera";

function createMockTrack() {
  return { stop: jest.fn(), enabled: true };
}

function createMockStream(
  ...tracks: ReturnType<typeof createMockTrack>[]
): MediaStream {
  return { getTracks: () => tracks } as unknown as MediaStream;
}

describe("startStream", () => {
  let getUserMediaMock: jest.Mock;

  beforeEach(() => {
    getUserMediaMock = jest.fn();
    Object.defineProperty(globalThis, "navigator", {
      value: { mediaDevices: { getUserMedia: getUserMediaMock } },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("기본값으로 후면 카메라 스트림을 요청한다", async () => {
    const mockStream = createMockStream(createMockTrack());
    getUserMediaMock.mockResolvedValue(mockStream);

    const result = await startStream();

    expect(getUserMediaMock).toHaveBeenCalledWith({
      video: { facingMode: "environment" },
    });
    expect(result).toBe(mockStream);
  });

  it("user facingMode을 지정하면 전면 카메라를 요청한다", async () => {
    const mockStream = createMockStream(createMockTrack());
    getUserMediaMock.mockResolvedValue(mockStream);

    await startStream("user");

    expect(getUserMediaMock).toHaveBeenCalledWith({
      video: { facingMode: "user" },
    });
  });

  it("권한이 거부되면 에러를 그대로 throw한다", async () => {
    const permissionError = Object.assign(new Error("permission denied"), {
      name: "NotAllowedError",
    });
    getUserMediaMock.mockRejectedValue(permissionError);

    await expect(startStream()).rejects.toMatchObject({
      name: "NotAllowedError",
    });
  });

  it("mediaDevices를 지원하지 않는 환경에서 에러를 throw한다", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      configurable: true,
      writable: true,
    });

    await expect(startStream()).rejects.toThrow();
  });
});

describe("stopStream", () => {
  it("스트림의 모든 트랙을 정지한다", () => {
    const track1 = createMockTrack();
    const track2 = createMockTrack();
    const stream = createMockStream(track1, track2);

    stopStream(stream);

    expect(track1.stop).toHaveBeenCalledTimes(1);
    expect(track2.stop).toHaveBeenCalledTimes(1);
  });

  it("트랙이 없는 스트림도 에러 없이 처리한다", () => {
    const stream = createMockStream();

    expect(() => stopStream(stream)).not.toThrow();
  });
});

describe("startRecording", () => {
  let MockMediaRecorder: jest.Mock;
  let mockRecorderInstance: {
    start: jest.Mock;
    stop: jest.Mock;
    ondataavailable: ((e: { data: Blob }) => void) | null;
    onstop: (() => void) | null;
    onerror: ((e: Event) => void) | null;
    state: string;
    mimeType: string;
  };

  beforeEach(() => {
    mockRecorderInstance = {
      start: jest.fn(),
      stop: jest.fn(),
      ondataavailable: null,
      onstop: null,
      onerror: null,
      state: "recording",
      mimeType: "video/mp4",
    };
    MockMediaRecorder = jest.fn().mockImplementation(() => mockRecorderInstance);
    (globalThis as unknown as Record<string, unknown>).MediaRecorder =
      MockMediaRecorder;
  });

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>).MediaRecorder;
  });

  it("지정된 mimeType으로 MediaRecorder를 생성하고 녹화를 시작한다", () => {
    const stream = {} as MediaStream;

    startRecording(stream, "video/mp4");

    expect(MockMediaRecorder).toHaveBeenCalledWith(stream, {
      mimeType: "video/mp4",
    });
    expect(mockRecorderInstance.start).toHaveBeenCalledTimes(1);
  });

  it("mimeType이 빈 문자열이면 mimeType 옵션 없이 MediaRecorder를 생성한다", () => {
    const stream = {} as MediaStream;

    startRecording(stream, "");

    expect(MockMediaRecorder).toHaveBeenCalledWith(stream, {});
  });

  function triggerStop() {
    mockRecorderInstance.stop.mockImplementationOnce(() => {
      mockRecorderInstance.state = "inactive";
      mockRecorderInstance.onstop?.();
    });
  }

  it("stop() 호출 시 수집된 chunks를 Blob으로 반환한다", async () => {
    const stream = {} as MediaStream;
    const handle = startRecording(stream, "video/mp4");

    mockRecorderInstance.ondataavailable!({ data: new Blob(["chunk-data"]) });

    triggerStop();
    const blob = await handle.stop();

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("video/mp4");
  });

  it("size가 0인 빈 chunk는 무시하고 Blob을 반환한다", async () => {
    const stream = {} as MediaStream;
    const handle = startRecording(stream, "video/mp4");

    mockRecorderInstance.ondataavailable!({ data: new Blob([]) });

    triggerStop();
    const blob = await handle.stop();

    expect(blob.size).toBe(0);
  });

  it("stop() 이전에 수집된 모든 chunks가 하나의 Blob으로 합쳐진다", async () => {
    const stream = {} as MediaStream;
    const handle = startRecording(stream, "video/webm");

    mockRecorderInstance.ondataavailable!({ data: new Blob(["part1"]) });
    mockRecorderInstance.ondataavailable!({ data: new Blob(["part2"]) });

    triggerStop();
    const blob = await handle.stop();

    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe("video/webm");
  });

  it("recorder가 이미 inactive 상태이면 stop()은 즉시 빈 Blob을 반환한다", async () => {
    const stream = {} as MediaStream;
    const handle = startRecording(stream, "video/mp4");

    mockRecorderInstance.state = "inactive";

    const blob = await handle.stop();

    expect(blob).toBeInstanceOf(Blob);
    expect(mockRecorderInstance.stop).not.toHaveBeenCalledTimes(2);
  });

  it("onerror 발생 시 stop()이 reject된다", async () => {
    const stream = {} as MediaStream;
    const handle = startRecording(stream, "video/mp4");

    mockRecorderInstance.stop.mockImplementationOnce(() => {
      mockRecorderInstance.onerror!(new Event("error"));
    });

    await expect(handle.stop()).rejects.toThrow("MediaRecorder error");
  });
});
