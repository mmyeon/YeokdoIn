import { normalizeAlias, isValidAlias } from "../normalize";

describe("normalizeAlias", () => {
  it("앞뒤 공백을 제거하고 소문자로 변환한다", () => {
    expect(normalizeAlias("  Snatch  ")).toBe("snatch");
  });

  it("이미 소문자인 문자열은 공백만 제거한다", () => {
    expect(normalizeAlias("clean")).toBe("clean");
  });

  it("한글 별명은 그대로 유지한다", () => {
    expect(normalizeAlias("  인상 ")).toBe("인상");
  });

  it("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(normalizeAlias("   ")).toBe("");
  });

  it("NFD로 분해된 한글을 NFC로 합성해 동일 키로 정규화한다", () => {
    const composed = "가"; // '가' (NFC)
    const decomposed = "가"; // '가' (NFD: ᄀ + ᅡ)
    expect(normalizeAlias(composed)).toBe(normalizeAlias(decomposed));
  });
});

describe("isValidAlias", () => {
  it("일반 문자열은 유효하다", () => {
    expect(isValidAlias("snatch")).toBe(true);
  });

  it("공백만 있는 문자열은 유효하지 않다", () => {
    expect(isValidAlias("   ")).toBe(false);
  });

  it("50자를 초과하면 유효하지 않다", () => {
    expect(isValidAlias("a".repeat(51))).toBe(false);
  });

  it("정확히 50자는 유효하다", () => {
    expect(isValidAlias("a".repeat(50))).toBe(true);
  });
});
