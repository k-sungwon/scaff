/**
 * @file entities/step/api/get-steps.ts
 * @description Step API 호출 함수
 */

import type { CompiledStep, StepListResponse } from "../model/step.types";

export async function getSteps(problemId: string): Promise<CompiledStep[]> {
  const response = await fetch(`/api/problems/${problemId}/steps`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 600,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[API] 풀이 단계 로딩 실패 (${response.status}): ${errorText}`);
  }

  const data: StepListResponse = await response.json();

  if (!data.steps || !Array.isArray(data.steps)) {
    throw new Error("[API] 잘못된 응답 형식: steps 배열 없음");
  }

  return data.steps;
}

export function getStepApiUrl(problemId: string): string {
  return `/api/problems/${problemId}/steps`;
}
