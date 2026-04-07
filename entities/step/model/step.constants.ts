/**
 * @file entities/step/model/step.constants.ts
 * @description Step 관련 상수
 */

import type { StepType } from "./step.types";

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  setup: "준비",
  transformation: "변환",
  analysis: "분석",
  calculation: "계산",
  verification: "검증",
} as const;

export const STEP_TYPE_COLORS: Record<StepType, string> = {
  setup: "bg-slate-100 text-slate-700 border-slate-200",
  transformation: "bg-indigo-100 text-indigo-700 border-indigo-200",
  analysis: "bg-emerald-100 text-emerald-700 border-emerald-200",
  calculation: "bg-amber-100 text-amber-700 border-amber-200",
  verification: "bg-rose-100 text-rose-700 border-rose-200",
} as const;

export const STEP_TYPE_ICONS: Record<StepType, string> = {
  setup: "📋",
  transformation: "🔄",
  analysis: "🔬",
  calculation: "🧮",
  verification: "✅",
} as const;

export const STEP_STORAGE_KEYS = {
  STEP_PROGRESS: "scaff:v1:step-progress",
} as const;

export const STEP_MESSAGES = {
  NO_STEPS: "풀이 단계가 없습니다",
  LOADING: "풀이를 불러오는 중...",
  LOAD_ERROR: "풀이를 불러올 수 없습니다",
  ALL_COMPLETED: "모든 단계를 완료했습니다",
  NEXT_STEP: "다음 단계",
  PREV_STEP: "이전 단계",
} as const;
