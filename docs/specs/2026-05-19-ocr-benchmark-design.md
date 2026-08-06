# OCR Benchmark — Design Spec

**Date**: 2026-05-19  
**Branch**: perf/ocr-benchmark  
**Goal**: OCR 파이프라인 각 단계의 실제 소요 시간을 측정해 병목이 개선 가능한지 판단한다.

---

## Problem

현재 OCR 파이프라인은 순차 실행이다:

```
이미지 선택 → compression → POST /api/ocr-parse → 결과
```

네트워크 패널에서 compression 중 API 요청이 pending 상태임이 확인됐다.  
어느 단계가 얼마를 차지하는지 분리해서 봐야 "개선 가능 여부"를 판단할 수 있다.

---

## Measurement Points

| 단계 | 측정 위치 | 방법 |
|------|-----------|------|
| Compression | 클라이언트 | `performance.now()` 전후 |
| 네트워크 + 서버 합계 | 클라이언트 | fetch 전후 `performance.now()` |
| Supabase 쿼리 | 서버 | `Server-Timing` 응답 헤더 |
| Gemini API 호출 | 서버 | `Server-Timing` 응답 헤더 |

**총 시간** = Compression + (네트워크 업로드 + Supabase + Gemini + 네트워크 다운로드)

---

## Architecture

### 변경 파일

1. **`app/api/ocr-parse/route.ts`** — `Server-Timing` 헤더 추가
2. **`app/test/ocr-benchmark/page.tsx`** — 벤치마크 전용 페이지 (신규)

### Server-Timing 헤더 형식

```
Server-Timing: supabase;dur=45, gemini;dur=3200
```

응답 헤더에 포함해서 클라이언트가 `PerformanceServerTiming` API 또는 헤더 직접 파싱으로 읽는다.  
(CORS 이슈 없이 same-origin fetch 응답 헤더에서 직접 접근 가능)

### 벤치마크 페이지 UI

```
[ 이미지 선택 (카메라 / 갤러리) ]
[ 측정 시작 버튼 ]

결과:
  Compression        : 1,240 ms
  ─ API 전체          : 5,830 ms
    └ Supabase 쿼리  :    42 ms
    └ Gemini API     : 4,910 ms
    └ 네트워크       :   878 ms  (= API전체 - Supabase - Gemini)
  ─────────────────────────────
  총 시간             : 7,070 ms
```

---

## Implementation Plan

### Phase 1 — API 라우트 수정 (`ocr-parse/route.ts`)

Supabase 쿼리와 Gemini API 호출 각각 `Date.now()` 로 시간 측정 후  
응답에 `Server-Timing` 헤더 추가.

```ts
// 응답 시 헤더 추가 예시
response.headers.set(
  'Server-Timing',
  `supabase;dur=${supabaseMs}, gemini;dur=${geminiMs}`
);
```

### Phase 2 — 벤치마크 페이지 구현

`app/test/ocr-benchmark/page.tsx`

- `useRef` + `performance.now()`로 compression / API 타이밍 측정
- fetch 완료 후 응답 헤더에서 `Server-Timing` 파싱
- 결과를 테이블로 렌더링

### Phase 3 — 모바일에서 실제 측정

로컬 dev 서버 또는 Vercel preview 배포 후 실 기기에서 측정.  
Wi-Fi vs 모바일 데이터 각각 확인.

---

## Success Criteria

- 각 단계 시간이 분리 측정되어 화면에 표시된다
- Gemini API 시간이 전체의 몇 %인지 명확히 보인다
- 측정 결과로 "compression 최적화 vs Gemini 모델 변경 vs 구조 개선" 중 우선순위를 결정할 수 있다

---

## Out of Scope

- 멀티런 / 평균·분산 측정 (추후 필요 시 추가)
- 프로덕션 성능 모니터링 (이 페이지는 개발/진단용)
