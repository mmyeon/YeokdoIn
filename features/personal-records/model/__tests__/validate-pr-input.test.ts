import { validatePRInput } from "../validate-pr-input";

const TODAY = "2026-08-31";

/** 검사 대상 필드 하나만 남기고 나머지는 유효한 값으로 채운다. */
const draft = (over: Partial<{ weight: number | null; prDate: string }> = {}) => ({
  weight: 100,
  prDate: "2026-08-20",
  ...over,
});

describe("validatePRInput — 정상 입력", () => {
  it("유효한 무게와 날짜면 위반이 없다", () => {
    expect(validatePRInput(draft(), TODAY)).toEqual([]);
  });

  it("오늘 날짜는 미래가 아니므로 허용한다", () => {
    expect(validatePRInput(draft({ prDate: TODAY }), TODAY)).toEqual([]);
  });

  it("상한 경계인 1000kg은 허용한다", () => {
    expect(validatePRInput(draft({ weight: 1000 }), TODAY)).toEqual([]);
  });

  it("하한 경계인 1kg은 허용한다", () => {
    expect(validatePRInput(draft({ weight: 1 }), TODAY)).toEqual([]);
  });
});

describe("validatePRInput — 무게 검증", () => {
  it("무게가 null이면 입력을 요구한다", () => {
    expect(validatePRInput(draft({ weight: null }), TODAY)).toEqual([
      { field: "weight", message: "무게를 입력해주세요." },
    ]);
  });

  it("무게가 NaN이면 입력을 요구한다", () => {
    expect(validatePRInput(draft({ weight: Number.NaN }), TODAY)).toEqual([
      { field: "weight", message: "무게를 입력해주세요." },
    ]);
  });

  it("무게가 0이면 거부한다", () => {
    expect(validatePRInput(draft({ weight: 0 }), TODAY)).toEqual([
      { field: "weight", message: "무게는 0보다 커야 합니다." },
    ]);
  });

  it("무게가 음수면 거부한다", () => {
    expect(validatePRInput(draft({ weight: -10 }), TODAY)).toEqual([
      { field: "weight", message: "무게는 0보다 커야 합니다." },
    ]);
  });

  it("소수점 무게는 거부한다", () => {
    expect(validatePRInput(draft({ weight: 52.5 }), TODAY)).toEqual([
      { field: "weight", message: "무게는 1kg 단위로 입력해주세요." },
    ]);
  });

  it("0.5kg 단위도 거부한다 — 정수만 허용한다", () => {
    expect(validatePRInput(draft({ weight: 100.5 }), TODAY)).toEqual([
      { field: "weight", message: "무게는 1kg 단위로 입력해주세요." },
    ]);
  });

  it("상한을 넘으면 거부한다", () => {
    expect(validatePRInput(draft({ weight: 1001 }), TODAY)).toEqual([
      { field: "weight", message: "무게가 너무 큽니다. 다시 확인해주세요." },
    ]);
  });
});

describe("validatePRInput — 날짜 검증", () => {
  it("날짜가 비어 있으면 입력을 요구한다", () => {
    expect(validatePRInput(draft({ prDate: "" }), TODAY)).toEqual([
      { field: "prDate", message: "날짜를 입력해주세요." },
    ]);
  });

  it("YYYY-MM-DD 형식이 아니면 입력을 요구한다", () => {
    expect(validatePRInput(draft({ prDate: "2026/08/20" }), TODAY)).toEqual([
      { field: "prDate", message: "날짜를 입력해주세요." },
    ]);
  });

  it("미래 날짜는 거부한다", () => {
    expect(validatePRInput(draft({ prDate: "2026-09-01" }), TODAY)).toEqual([
      { field: "prDate", message: "미래 날짜는 기록할 수 없습니다." },
    ]);
  });

  it("과거 날짜는 허용한다", () => {
    expect(validatePRInput(draft({ prDate: "2020-01-01" }), TODAY)).toEqual([]);
  });
});

describe("validatePRInput — 복합 위반", () => {
  it("무게와 날짜가 모두 잘못되면 둘 다 반환한다", () => {
    const errors = validatePRInput(
      { weight: 0, prDate: "2026-09-01" },
      TODAY
    );

    expect(errors).toHaveLength(2);
    expect(errors).toContainEqual({
      field: "weight",
      message: "무게는 0보다 커야 합니다.",
    });
    expect(errors).toContainEqual({
      field: "prDate",
      message: "미래 날짜는 기록할 수 없습니다.",
    });
  });

  it("무게 위반은 필드당 하나만 보고한다", () => {
    // 음수이면서 소수점 — 하한 위반 하나로 수렴해야 한다
    const errors = validatePRInput(draft({ weight: -0.5 }), TODAY);
    expect(errors.filter((e) => e.field === "weight")).toHaveLength(1);
  });
});

describe("validatePRInput — 순수성", () => {
  it("today 인자에만 의존하며 시스템 시계를 읽지 않는다", () => {
    // 실제 오늘과 무관하게 주입된 today 기준으로 판정해야 한다
    const future = validatePRInput(draft({ prDate: "2030-01-01" }), "2029-12-31");
    expect(future).toEqual([
      { field: "prDate", message: "미래 날짜는 기록할 수 없습니다." },
    ]);

    const past = validatePRInput(draft({ prDate: "2030-01-01" }), "2030-06-01");
    expect(past).toEqual([]);
  });

  it("입력 객체를 변경하지 않는다", () => {
    const input = { weight: 52.5, prDate: "2026-09-01" };
    const snapshot = { ...input };

    validatePRInput(input, TODAY);

    expect(input).toEqual(snapshot);
  });
});
