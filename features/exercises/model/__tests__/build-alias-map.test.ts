import { buildAliasMap } from "../build-alias-map";

describe("buildAliasMap", () => {
  it("빈 배열은 빈 객체를 반환한다", () => {
    expect(buildAliasMap([])).toEqual({});
  });

  it("name 을 trim + lowercase 한 키로 id 를 매핑한다", () => {
    const map = buildAliasMap([
      { id: 1, name: "  Back Squat  " },
      { id: 2, name: "스내치" },
    ]);
    expect(map).toEqual({ "back squat": 1, 스내치: 2 });
  });

  it("공백만 있는 이름은 무시한다", () => {
    const map = buildAliasMap([
      { id: 1, name: "   " },
      { id: 2, name: "Deadlift" },
    ]);
    expect(map).toEqual({ deadlift: 2 });
  });

  it("동일 키가 여러 행에 있으면 더 작은 id 가 이긴다", () => {
    const map = buildAliasMap([
      { id: 5, name: "Jerk" },
      { id: 2, name: "jerk" },
      { id: 7, name: " JERK " },
    ]);
    expect(map).toEqual({ jerk: 2 });
  });

  it("입력 배열을 변형하지 않는다", () => {
    const input = [{ id: 1, name: "Snatch" }];
    const snapshot = JSON.parse(JSON.stringify(input));
    buildAliasMap(input);
    expect(input).toEqual(snapshot);
  });
});
