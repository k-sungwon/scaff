/**
 * @file features/clue-reveal/hooks/use-steps.ts
 * @description 풀이 단계 데이터 훅
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getSteps } from "@/entities/step";

export function useSteps(problemId: string) {
  return useQuery({
    queryKey: ["steps", problemId],
    queryFn: () => getSteps(problemId),
    enabled: !!problemId,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}
