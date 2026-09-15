import {
  groupExercisesByCategory,
  type Categorizable,
} from "../group-exercises";

/** DB `exercises` 테이블의 현행 17종목 (2026-09-02 기준). */
const ALL: Categorizable[] = [
  { id: 1, name: "Power Snatch" },
  { id: 2, name: "Power Clean" },
  { id: 3, name: "Split Jerk" },
  { id: 4, name: "Push Jerk" },
  { id: 5, name: "Snatch Pull" },
  { id: 6, name: "Clean Pull" },
  { id: 7, name: "Snatch Balance" },
  { id: 8, name: "Overhead Squat" },
  { id: 9, name: "Back Press" },
  { id: 10, name: "Snatch" },
  { id: 11, name: "Clean" },
  { id: 12, name: "Jerk" },
  { id: 13, name: "Clean and Jerk" },
  { id: 14, name: "Front Squat" },
  { id: 15, name: "Back Squat" },
  { id: 16, name: "Deadlift" },
  { id: 17, name: "Push Press" },
];

function namesIn(
  groups: ReturnType<typeof groupExercisesByCategory>,
  label: string
): string[] {
  return groups.find((g) => g.label === label)?.exercises.map((e) => e.name) ?? [];
}

describe("groupExercisesByCategory", () => {
  it("현행 카탈로그를 스내치/클린/저크/스쿼트/프레스/기타로 나눈다", () => {
    const groups = groupExercisesByCategory(ALL);

    expect(groups.map((g) => g.label)).toEqual([
      "스내치",
      "클린",
      "저크",
      "스쿼트",
      "프레스",
      "기타",
    ]);
    expect(namesIn(groups, "스내치")).toEqual([
      "Power Snatch",
      "Snatch Pull",
      "Snatch Balance",
      "Snatch",
    ]);
    expect(namesIn(groups, "클린")).toEqual([
      "Power Clean",
      "Clean Pull",
      "Clean",
      "Clean and Jerk",
    ]);
    expect(namesIn(groups, "저크")).toEqual(["Split Jerk", "Push Jerk", "Jerk"]);
    expect(namesIn(groups, "스쿼트")).toEqual([
      "Overhead Squat",
      "Front Squat",
      "Back Squat",
    ]);
    expect(namesIn(groups, "프레스")).toEqual(["Back Press", "Push Press"]);
    expect(namesIn(groups, "기타")).toEqual(["Deadlift"]);
  });

  it("모든 종목이 정확히 한 그룹에만 들어간다", () => {
    const grouped = groupExercisesByCategory(ALL).flatMap((g) => g.exercises);

    expect(grouped).toHaveLength(ALL.length);
    expect(new Set(grouped.map((e) => e.id)).size).toBe(ALL.length);
  });

  it("Clean and Jerk는 저크가 아니라 클린으로 분류한다", () => {
    const groups = groupExercisesByCategory([
      { id: 13, name: "Clean and Jerk" },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("클린");
  });

  it("빈 그룹은 반환하지 않는다", () => {
    const groups = groupExercisesByCategory([{ id: 16, name: "Deadlift" }]);

    expect(groups.map((g) => g.label)).toEqual(["기타"]);
  });

  it("종목이 없으면 빈 배열을 반환한다", () => {
    expect(groupExercisesByCategory([])).toEqual([]);
  });

  it("대소문자가 달라도 같은 그룹으로 분류한다", () => {
    const groups = groupExercisesByCategory([{ id: 99, name: "power snatch" }]);

    expect(groups[0].label).toBe("스내치");
  });

  it("알 수 없는 종목은 기타로 보낸다", () => {
    const groups = groupExercisesByCategory([{ id: 99, name: "Sled Push" }]);

    expect(groups[0].label).toBe("기타");
  });

  it("그룹 안의 순서는 입력 순서를 유지한다", () => {
    const groups = groupExercisesByCategory([
      { id: 15, name: "Back Squat" },
      { id: 14, name: "Front Squat" },
    ]);

    expect(namesIn(groups, "스쿼트")).toEqual(["Back Squat", "Front Squat"]);
  });
});
