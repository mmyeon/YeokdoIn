import { atom } from "jotai";

/** 동작 분석 플로우의 단계. */
export type AnalysisStep = "upload" | "trim" | "analyzing" | "done";

/** 현재 플로우 단계. */
export const stepAtom = atom<AnalysisStep>("upload");

/** 사용자가 선택한 원본 영상 파일. */
export const videoFileAtom = atom<File | null>(null);

/** videoFile로부터 생성한 objectURL(재생용). */
export const videoUrlAtom = atom<string | null>(null);

/** 분석에 사용할 [시작초, 종료초] 구간. */
export const trimRangeAtom = atom<[number, number]>([0, 0]);
