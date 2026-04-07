/**
 * @file entities/step/model/step.types.ts
 * @description Step (풀이 단계) 엔티티 타입 정의
 *
 * 역할: Clue와 유사하지만 풀이 단계에 특화
 */

import type { MDXRemoteSerializeResult } from "next-mdx-remote";

// ============================================================================
// Step 타입
// ============================================================================

/**
 * 풀이 단계 타입
 */
export type StepType =
  | "setup" // 준비 (부호 확정, 식 정리)
  | "transformation" // 변환 (역함수 뒤집기, 치환)
  | "analysis" // 분석 (교점 개수, 구간 판단)
  | "calculation" // 계산
  | "verification"; // 검증

// ============================================================================
// Step 데이터 구조
// ============================================================================

export interface StepBase {
  id: string; // "step-1", "step-3-1"
  type: StepType;
  title: string;
  concepts: string[]; // concept ID 배열
}

export interface Step extends StepBase {
  content: string; // MDX 원본
}

export interface CompiledStep extends StepBase {
  compiled: MDXRemoteSerializeResult;
}

// ============================================================================
// Step 진행 상태
// ============================================================================

export interface StepProgress {
  problemId: string;
  completedSteps: string[]; // 완료한 step ID 배열
  currentStep: string | null; // 현재 보고 있는 step
  totalSteps: number;
  lastUpdated: string;
}

// ============================================================================
// Step 리스트 응답
// ============================================================================

export interface StepListResponse {
  steps: CompiledStep[];
  total: number;
  problemId: string;
}
