/**
 * @file entities/clue/api/get-clues.ts
 * @description Clue API 호출 함수
 *
 * 플로우:
 * 1. 클라이언트에서 API 호출
 * 2. 서버에서 MDX 컴파일된 단서 반환
 * 3. CompiledClue[] 반환
 *
 * 역할:
 * - API 호출 로직 캡슐화
 * - 에러 처리
 * - 타입 안정성
 *
 * 패턴: API Client Pattern
 * - fetch를 감싸서 타입 안정성 보장
 * - 에러를 throw하여 상위에서 처리
 *
 * 함수형 vs 객체지향:
 * - 순수 함수로 작성
 * - Side Effect: API 호출 (불가피)
 */

import type { CompiledClue, ClueListResponse } from "../model/clue.types";

// ============================================================================
// API 호출 함수
// ============================================================================

/**
 * 단서 목록 조회
 *
 * @param problemId - 문제 ID
 * @returns CompiledClue 배열 (MDX 컴파일 완료)
 * @throws Error - API 호출 실패 시
 *
 * 플로우:
 * 1. GET /api/problems/{problemId}/clues 호출
 * 2. 응답 JSON 파싱
 * 3. 타입 검증 (런타임)
 * 4. CompiledClue[] 반환
 *
 * 에러 처리:
 * - 네트워크 에러 → throw
 * - 404 (문제 없음) → throw
 * - 500 (서버 에러) → throw
 * - 상위(Hook)에서 catch하여 UI 표시
 *
 * 사용 예시:
 * ```typescript
 * try {
 *   const clues = await getClues('2025-math-calculus-regular-30');
 *   console.log(clues[0].title);  // "절댓값 벗기기"
 * } catch (error) {
 *   console.error('단서 로딩 실패:', error);
 * }
 * ```
 *
 * 왜 throw?
 * - TanStack Query가 에러를 catch하여 상태 관리
 * - 일관된 에러 처리 패턴
 */
export async function getClues(problemId: string): Promise<CompiledClue[]> {
  // 1. API 호출
  const response = await fetch(`/api/problems/${problemId}/clues`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // Next.js 캐싱 설정
    next: {
      // 10분 동안 캐시 (같은 문제 재방문 시 빠름)
      revalidate: 600,
    },
  });

  // 2. 에러 처리
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `[API] 단서 로딩 실패 (${response.status}): ${errorText}`
    );
  }

  // 3. JSON 파싱
  const data: ClueListResponse = await response.json();

  // 4. 타입 검증 (런타임)
  if (!data.clues || !Array.isArray(data.clues)) {
    throw new Error("[API] 잘못된 응답 형식: clues 배열 없음");
  }

  // 5. 반환
  return data.clues;
}

// ============================================================================
// 단일 단서 조회 (추후 확장용)
// ============================================================================

/**
 * 단일 단서 조회
 *
 * @param problemId - 문제 ID
 * @param clueId - 단서 ID (예: "clue-1")
 * @returns CompiledClue
 * @throws Error - API 호출 실패 시
 *
 * 플로우:
 * 1. GET /api/problems/{problemId}/clues/{clueId} 호출
 * 2. 단일 단서 반환
 *
 * 사용 케이스:
 * - 단서 1개만 필요한 경우 (성능 최적화)
 * - 추후 확장 (현재 미사용)
 */
export async function getClue(
  problemId: string,
  clueId: string
): Promise<CompiledClue> {
  const response = await fetch(
    `/api/problems/${problemId}/clues/${clueId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 600,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `[API] 단서 로딩 실패 (${response.status}): ${errorText}`
    );
  }

  const clue: CompiledClue = await response.json();

  return clue;
}

// ============================================================================
// API 헬퍼 함수
// ============================================================================

/**
 * API 기본 URL 생성
 *
 * @param problemId - 문제 ID
 * @returns API 기본 경로
 *
 * 역할:
 * - API 경로 중앙 관리
 * - 변경 시 한 곳만 수정
 *
 * 사용 예시:
 * ```typescript
 * const baseUrl = getClueApiUrl('2025-math-calculus-regular-30');
 * // → "/api/problems/2025-math-calculus-regular-30/clues"
 * ```
 */
export function getClueApiUrl(problemId: string): string {
  return `/api/problems/${problemId}/clues`;
}

/**
 * API 호출 옵션 생성
 *
 * @param options - 추가 옵션
 * @returns RequestInit
 *
 * 역할:
 * - 공통 fetch 옵션 중앙 관리
 * - 헤더, 캐싱 설정 일관성
 *
 * 사용 예시:
 * ```typescript
 * const options = createFetchOptions({ revalidate: 300 });
 * const response = await fetch(url, options);
 * ```
 */
export function createFetchOptions(options?: {
  revalidate?: number;
}): RequestInit {
  return {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: options?.revalidate ?? 600,
    },
  };
}
