/**
 * @file features/clue-reveal/hooks/use-clues.ts
 * @description 단서 데이터 훅 (TanStack Query)
 *
 * 플로우:
 * 1. API 호출 (/api/problems/[id]/clues)
 * 2. 캐싱 (10분)
 * 3. 로딩/에러 상태 관리
 * 4. 자동 재시도
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getClues } from "@/entities/clue";
import type { CompiledClue } from "@/entities/clue";

export function useClues(problemId: string) {
  return useQuery({
    queryKey: ["clues", problemId],
    queryFn: () => getClues(problemId),
    enabled: !!problemId,
    staleTime: 1000 * 60 * 10, // 10분
    retry: 2,
  });
}
