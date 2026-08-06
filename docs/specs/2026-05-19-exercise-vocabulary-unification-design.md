# Exercise Vocabulary Unification Design

**Date**: 2026-05-19  
**Branch**: feat/ocr-program-input  
**Status**: Approved — pending implementation

---

## Problem

Two input paths for saving programs produce incompatible exercise name vocabularies:

| Path | Data Source | Example Output |
|---|---|---|
| Manual (MovementCombobox) | `exercises` table (Greg Everett / Catalyst) | `"2-Position Power Snatch"` |
| OCR (Gemini Vision) | Prompt-based "common sense" normalization | `"Power Snatch"`, `"PS"` as-is |

PR tracking relies on `buildAliasMap(exercises[])` matching `workout_sets.movement_name` → `exercises.id`. OCR-produced movement names that don't exactly match Catalyst names silently fail (result: 0 kg PR lookup).

---

## Decision

### Canonical exercise vocabulary → `base_exercises` table

Replace `exercises` (Catalyst) as the PR anchor with `base_exercises` — a simpler, gym-vocabulary-aligned master table.

- `base_exercises`: canonical exercise master with parent_id hierarchy (root/variant)
- `gym_exercises`: abbreviation dictionary mapping `raw_text → base_exercise_id`
- `exercises` (Catalyst): kept as enrichment data only (descriptions, YouTube URLs, page refs) — no longer used for PR tracking

### PR history → references `base_exercises.id`

`pr_history.exercise_id` changes from `exercises.id` to `base_exercises.id`.  
Existing `pr_history` rows: **drop and start fresh** (v1 dev environment, no real data loss).

---

## Chosen Approach: A — gym_exercises as Explicit Dictionary

```
OCR image
  → Gemini Vision → OcrItem[].exercise (free text, Gemini's best guess)
  → gym_exercises lookup (raw_text ILIKE match)
      ├─ match found   → replace exercise field with base_exercises.name (resolved)
      └─ no match      → flag as unresolved in OcrVerificationSheet
                          user picks from base_exercises dropdown
  → Program { movements[].name = base_exercises.name }
  → buildAliasMap(base_exercises) → base_exercise_id → PR tracking
```

Manual input also switches: `MovementCombobox` data source changes from `exercises` → `base_exercises`.

**Why A over alternatives**:
- B (lazy runtime resolution): abbreviations persist in DB, PR linkage is delayed, same movement stored under multiple names
- C (inject base_exercises list into Gemini prompt): token cost, prompt must be updated when exercises change, Gemini output not guaranteed canonical

---

## Implementation Scope

### 1. Database migration (new file)

- Create `base_exercises` table (already drafted in `20260518000000_create_gym_exercises.sql`)
- Create `gym_exercises` as abbreviation dictionary with `base_exercise_id FK` (already in same file)
- Alter `pr_history`: drop FK to `exercises`, add FK to `base_exercises`
- Drop existing `pr_history` rows (dev reset)

### 2. Exercise API

- Add `listBaseExercises()` server action (analogous to current `listExercises()`)
- `listBaseExercisesGrouped()` — group by parent (root categories) instead of `exercise_sections`
- Add `lookupGymExercise(rawText: string): base_exercise_id | null` — used during OCR normalization

### 3. buildAliasMap

- Change input type from `exercises` rows to `base_exercises` rows
- Logic unchanged (lowercase name → id map)

### 4. MovementCombobox / useExerciseGroups

- Switch data source from `listExercisesGrouped()` → `listBaseExercisesGrouped()`
- Groups become parent exercise names (Snatch, Clean, Jerk, Press, Squat, Deadlift)

### 5. OCR normalization in OcrVerificationSheet

- After Gemini returns `OcrItem[]`, client calls `lookupGymExercise(item.exercise)` for each item
- Resolved items: exercise field replaced with `base_exercises.name`
- Unresolved items: shown with a warning indicator + base_exercises dropdown to resolve manually
- Save button disabled until all items resolved

### 6. OcrItem type (optional)

Consider adding `base_exercise_id: number | null` to `OcrItem` to carry the resolved ID through to `mapOcrToProgram`.

---

## Out of Scope

- Migrating `exercises` (Catalyst) enrichment data linkage to `base_exercises` (Phase 2+)
- Multi-gym support via `gym_id` on `base_exercises` (Phase 2+ — migration comment notes this)
- User-defined custom gym exercises (Phase 2+)

---

## Files Affected

| File | Change |
|---|---|
| `supabase/migrations/20260518000000_create_gym_exercises.sql` | Already updated with new schema |
| `supabase/migrations/NEW_drop_pr_history_exercises_fk.sql` | Drop + recreate pr_history FK |
| `features/exercises/api/exercises.ts` | Add base_exercises queries |
| `features/exercises/model/build-alias-map.ts` | Switch input type |
| `features/exercises/ui/useExerciseGroups.ts` | Switch data source |
| `features/programs/ui/MovementCombobox.tsx` | Switch to base_exercises |
| `features/programs/ui/OcrVerificationSheet.tsx` | Add gym_exercises lookup + unresolved UI |
| `features/programs/model/ocr-types.ts` | Optionally add base_exercise_id field |
