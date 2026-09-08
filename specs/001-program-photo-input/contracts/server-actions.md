# Contract: `features/programs/api/programs.ts` 서버 액션

`'use server'`. 모든 액션은 인증을 요구하고 RLS가 소유권을 강제한다(FR-030).
데이터 접근은 이 계층만 수행한다(헌법 IV).

---

## 신규

### `saveTextProgram(input): Promise<ProgramRow>`

```ts
interface SaveTextProgramInput {
  sourceText: string;   // 편집 이전 붙여넣기 원문 (FR-031)
  lines: string[];      // 사용자가 확정한 항목
  title?: string | null;
}
```

| 단계 | 동작 | 근거 |
| --- | --- | --- |
| 1 | 인증 확인, 없으면 오류 | FR-030 |
| 2 | Zod 검증 — `lines`는 문자열 배열, `sourceText`는 문자열 | 헌법 III |
| 3 | `sanitizeItems(lines)` 적용 | FR-028 |
| 4 | 결과가 비면 오류로 거부 | FR-032 |
| 5 | `lines`, `source_text`, `title`, `user_id`로 INSERT. `parsed_data`는 `NULL` | FR-027, FR-029 |

`title`이 없으면 `NULL`로 저장하고, 표시 시 `created_at`을 기본 이름으로 쓴다(FR-033).

**저장하지 않는 것**: 확정 이전의 중간 편집 상태, 사용자가 삭제한 항목, 의심 구간(FR-027).

### `updateTextProgram(input): Promise<ProgramRow>`

```ts
interface UpdateTextProgramInput {
  id: number;
  lines: string[];
  title?: string | null;
}
```

기존 행을 갱신한다. 새 행을 만들지 않는다(FR-021).
`source_text`는 갱신 대상이 아니다 — 정의가 「사용자 편집 이전」이므로 덮어쓰면
SC-006의 측정 근거가 사라진다(data-model.md).
검증·위생·빈 항목 거부는 `saveTextProgram`과 동일하다.
레거시 행(`lines IS NULL`)에 호출하면 오류다.

---

## 기존 — 변경 없음

| 액션 | FR |
| --- | --- |
| `listPrograms(): Promise<ProgramRow[]>` | FR-034. 이미 `created_at DESC` 정렬 |
| `getProgram(id): Promise<ProgramRow \| null>` | FR-021 열람 |
| `deleteProgram(id): Promise<void>` | FR-035 |

`ProgramRow`는 `types_db.ts` 생성 타입에서 파생된다. 마이그레이션 후 `lines`, `source_text`,
`updated_at`이 자동으로 포함되고 `parsed_data`가 nullable이 된다 — 두 형태를 구분하지 않는
기존 호출부는 컴파일 오류로 드러난다(헌법 II).

---

## 제거

### `saveProgram(input: { parsed: Program })`

폼 기반 입력 전용이었다. 입력 경로가 대체되므로 함께 제거한다(research.md R4).
레거시 행은 이 액션 없이도 조회·삭제된다.

---

## 오류 처리

모든 실패는 예외로 던지고 UI에서 사용자 메시지로 변환한다.
내부 구현 상세를 메시지에 노출하지 않는다(헌법 Security Requirements).
저장 실패 시 UI는 편집 상태를 유지한 채 재시도할 수 있어야 한다(FR-020, FR-036).
