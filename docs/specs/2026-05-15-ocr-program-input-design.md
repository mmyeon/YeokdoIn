# OCR Program Input — Design Spec

**Date**: 2026-05-15  
**Status**: Approved  
**Scope**: v1 Minimal — validate Gemini Vision quality before adding advanced features

---

## Problem

Manually entering a 20-exercise weightlifting program into the form is tedious. Users should be able to photograph a whiteboard or screenshot and have the program parsed automatically.

## Goal

Add a "Scan" entry point on the existing program-input page. User takes a photo or uploads an image → Gemini Vision extracts and structures the program → user reviews/corrects in a bottom sheet → saves using existing logic.

---

## Architecture & Data Flow

```
[Program Input Page]
  ├── [Existing] Manual form (ProgramForm) — unchanged
  └── [NEW] "Scan" button
        ↓
[Client] image picked/captured
  → compressed client-side (WebP, max 1500px wide, browser-image-compression)
        ↓
[POST /api/ocr-parse] — Next.js API route (Gemini key stays server-side)
  → body: multipart/form-data with image file
        ↓
[Gemini 1.5 Flash] — multimodal call with JSON Mode (responseSchema enforced)
        ↓ returns OcrItem[] — always valid JSON, no parse errors
        ↓
[Client] OcrVerificationSheet (bottom sheet)
  → editable rows: exercise / % / sets / reps
  → null fields highlighted red, save blocked until all filled
  → user corrects errors
  → "Save Program" → mapOcrToProgram() → useSaveProgram()
```

### New Files

| File | Purpose |
|---|---|
| `app/api/ocr-parse/route.ts` | Next.js API route, calls Gemini with JSON Mode, returns `OcrItem[]` |
| `features/programs/model/ocr-mapper.ts` | `OcrItem[]` → `Program` type |
| `features/programs/ui/OcrScanButton.tsx` | Camera + file input trigger |
| `features/programs/ui/OcrVerificationSheet.tsx` | Editable confirmation bottom sheet |

### Dependencies to Install

```
browser-image-compression   — client-side image compression
@google/generative-ai       — Gemini SDK (server-side only)
```

### Unchanged

- `ProgramForm` — existing manual form, untouched
- `useSaveProgram` — existing save hook, reused as-is
- `features/notation/model/parser.ts` — existing text parser, not used in this flow

---

## OcrItem Type

```typescript
interface OcrItem {
  raw_text: string;       // exact text Gemini read from image (for debugging + user reference)
  exercise: string;       // normalized name; preserve full string for complexes (e.g. "1 PS + 1 HS + 2 OHS")
  percentage: number | null;
  sets: number | null;
  reps: string | null;    // "3", "3+2", "3+1+2"
  note: string | null;    // anything Gemini couldn't classify — shown in UI as warning
}
```

---

## Gemini Prompt Strategy

### JSON Mode (critical — eliminates parse errors)

```typescript
// In route.ts
const result = await model.generateContent({
  contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: ocrItemArraySchema, // Zod or Gemini schema
  },
});
```

With JSON Mode active, Gemini always returns valid JSON matching the schema — no markdown fences, no trailing commas, no syntax errors.

### Prompt Structure

```
Role: "You are an expert weightlifting coach and data engineer."

Domain rules:
- Complex reps: (3+2)×3 → reps: "3+2", sets: 3
- Multiple intensities on one line: "Snatch 80% 2×2, 85% 1×3"
  → create TWO separate OcrItem objects
- Abbreviations: SDL = Slow Deadlift, S.Pull = Snatch Pull
  (map if confident, set exercise to original if unsure)
- Sets×Reps ambiguity: default to sets×reps
- Complex movements: "1 PS + 1 HS + 2 OHS" → preserve full string in exercise field as-is
- raw_text: copy the exact source text for this item from the image

If a field is unclear, use null. Do not guess wrong values.
```

---

## Verification UI

**OcrVerificationSheet** — bottom sheet that slides up after Gemini responds.

### Layout

```
┌─────────────────────────────┐
│ Review Program              │
│ 12 exercises detected       │
├─────────────────────────────┤
│ Snatch           80%  3 × 3   │
│ ⚠ S.D.L          —   4 × 5   │  ← note shown as warning icon
│ 1PS+1HS+2OHS    75%  3×1+1+2 │  ← complex preserved as-is
│ ...                           │
├─────────────────────────────┤
│ [Save Program] (disabled if any null fields remain)
└─────────────────────────────┘
```

### Interaction

- **Tap a row** → inline edit (exercise name, %, sets, reps)
- **Swipe row left** → delete
- **"+" button** → add empty row
- **Warning icon** → tap to see `note` from Gemini ("couldn't determine percentage")
- **"Save Program"** → blocked until all required fields (exercise, sets, reps) are non-null
  → `mapOcrToProgram()` → `useSaveProgram()`

### Loading State

Spinner with a rotating weightlifting tip while Gemini processes (typically 2–5 seconds).

---

## Mapper: OcrItem[] → Program

```typescript
// features/programs/model/ocr-mapper.ts
function parseReps(reps: string | null): RepScheme {
  if (!reps) return { type: 'simple', reps: 1 };
  const parts = reps.split('+').map(Number).filter((n) => !isNaN(n));
  if (parts.length > 1) return { type: 'complex', reps: parts };
  return { type: 'simple', reps: parts[0] ?? 1 };
}

function mapOcrToProgram(items: OcrItem[]): Program {
  return {
    blocks: items.map((item) => ({
      movements: [{ name: item.exercise, modifiers: [] }],
      setEntries: [{
        percentage: item.percentage,
        sets: item.sets ?? 1,
        reps: parseReps(item.reps),
      }],
    })),
  };
}
```

---

## Error Handling

| Scenario | Response |
|---|---|
| Gemini returns empty array | "No exercises detected. Try a clearer photo or enter manually." |
| Gemini API error / timeout | "Scan failed. Try again or enter manually." |
| Image too large / wrong format | Client-side validation before upload, inline error |
| Null required fields remain at save | Save button disabled, null fields highlighted red |
| `note` field present | Warning icon on row, tap to read Gemini's explanation |

---

## API Route

```typescript
// app/api/ocr-parse/route.ts
// POST — multipart/form-data with 'image' file
// Returns { items: OcrItem[] } | { error: string }
// Uses GEMINI_API_KEY env var
// Uses Gemini JSON Mode with responseSchema to guarantee valid OcrItem[]
```

---

## Out of Scope (v1)

- UserAliasTable (learning abbreviation mappings across sessions)
- Multi-photo / multi-page programs
- Camera preview / crop UI
- Offline fallback (Tesseract.js)

---

## Success Criteria for v1

Test with 3–5 real whiteboard photos. If Gemini correctly extracts >80% of exercises without user correction, the architecture is validated. If not, revisit the prompt or add a two-step pipeline (Vision OCR → LLM cleaning).

---

## Environment Variables Required

```
GEMINI_API_KEY=...
```
