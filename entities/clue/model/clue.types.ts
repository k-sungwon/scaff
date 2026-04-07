/**
 * @file entities/clue/model/clue.types.ts
 * @description Clue 엔티티 타입 정의
 *
 * 플로우:
 * 1. Clue 관련 모든 타입 정의
 * 2. 다른 모듈에서 import하여 사용
 *
 * 역할:
 * - Clue 엔티티의 타입 중앙 관리
 * - 단서 공개 모드 정의
 * - 진행 상태 타입
 *
 * 패턴: Domain-Driven Design
 * - Clue = 엔티티
 * - ClueProgress = 값 객체 (Value Object)
 */

import type { MDXRemoteSerializeResult } from "next-mdx-remote";

// ============================================================================
// Clue 타입
// ============================================================================

/**
 * 단서 타입
 *
 * 역할: 단서를 분류하여 VectorDB 검색에 활용
 *
 * - approach: 문제 접근법
 *   - "어떻게 시작할지"
 *   - 예: "절댓값을 먼저 정리하세요"
 *
 * - pattern: 패턴 인식
 *   - "무엇을 찾을지"
 *   - 예: "증가함수의 역함수도 증가함수입니다"
 *
 * - trigger: 트리거 조건
 *   - "언제 이 방법을 사용할지"
 *   - 예: "절댓값이 나오면 증가/감소 확인"
 *
 * - technique: 구체적 기술
 *   - "계산 방법"
 *   - 예: "x = -2를 대입하면..."
 */
export type ClueType = "approach" | "pattern" | "trigger" | "technique";

// ============================================================================
// Clue 데이터 구조
// ============================================================================

/**
 * 단서 기본 정보 (메타데이터)
 *
 * 역할:
 * - 단서 식별 및 분류
 * - 검색용 키워드 제공
 */
export interface ClueBase {
  /** 단서 ID (예: "clue-1") */
  id: string;

  /** 단서 타입 */
  type: ClueType;

  /** 단서 제목 (예: "절댓값 벗기기") */
  title: string;

  /** 검색용 키워드 (예: ["절댓값", "증가함수"]) */
  keywords: string[];
}

/**
 * 단서 (MDX 원본 포함)
 *
 * 역할:
 * - Repository에서 반환하는 데이터
 * - 서버에서 MDX 컴파일 전 단계
 *
 * 데이터 소스: content/problems/.../clues/1.mdx
 */
export interface Clue extends ClueBase {
  /** MDX 원본 콘텐츠 */
  content: string;
}

/**
 * 컴파일된 단서 (렌더링 가능)
 *
 * 역할:
 * - API 응답으로 클라이언트에 전달
 * - MDXRemote로 즉시 렌더링 가능
 *
 * 플로우:
 * 1. Repository가 Clue 반환 (MDX 원본)
 * 2. 서버에서 MDX 컴파일
 * 3. CompiledClue로 변환
 * 4. API 응답으로 전달
 * 5. 클라이언트에서 <MDXRemote {...compiled} />
 */
export interface CompiledClue extends ClueBase {
  /** 컴파일된 MDX (즉시 렌더링 가능) */
  compiled: MDXRemoteSerializeResult;
}

// ============================================================================
// 단서 공개 모드
// ============================================================================

/**
 * 단서 공개 모드
 *
 * - none: 단서 전체 숨김 (초기 상태)
 * - step: 단계별 공개 (사용자가 1개씩 요청)
 * - all: 전체 공개 (모든 단서 한 번에)
 *
 * 플로우:
 * 1. 초기: none (사용자가 직접 풀어보도록)
 * 2. "단서 보기" 클릭 → step 모드
 * 3. "다음 단서" 클릭 → cluesRevealed++
 * 4. "전체 보기" 클릭 → all 모드
 */
export type RevealMode = "none" | "step" | "all";

// ============================================================================
// 단서 진행 상태
// ============================================================================

/**
 * 단서 진행 상태
 *
 * 역할:
 * - 사용자가 어디까지 단서를 봤는지 추적
 * - LocalStorage 저장용
 * - 다음 방문 시 복원
 *
 * 예시:
 * ```typescript
 * const progress: ClueProgress = {
 *   problemId: "2025-math-calculus-regular-30",
 *   revealMode: "step",
 *   revealedCount: 3,     // 3개 단서 공개됨
 *   totalCount: 5,        // 총 5개
 *   lastUpdated: "2026-04-07T10:30:00Z"
 * };
 * ```
 */
export interface ClueProgress {
  /** 문제 ID */
  problemId: string;

  /** 현재 공개 모드 */
  revealMode: RevealMode;

  /** 공개된 단서 개수 (0~totalCount) */
  revealedCount: number;

  /** 총 단서 개수 */
  totalCount: number;

  /** 마지막 업데이트 시각 (ISO 8601) */
  lastUpdated: string;
}

// ============================================================================
// 단서 리스트용 타입
// ============================================================================

/**
 * 단서 목록 응답
 *
 * 역할:
 * - API 응답 타입
 * - GET /api/problems/[id]/clues
 */
export interface ClueListResponse {
  /** 컴파일된 단서 배열 */
  clues: CompiledClue[];

  /** 총 개수 */
  total: number;

  /** 문제 ID */
  problemId: string;
}

// ============================================================================
// 단서 필터 (추후 확장용)
// ============================================================================

/**
 * 단서 필터 조건
 *
 * 역할:
 * - 단서 검색/필터링
 * - VectorDB 검색 시 사용
 *
 * 추후 확장:
 * - 유사한 단서 찾기
 * - 타입별 필터링
 */
export interface ClueFilter {
  /** 단서 타입 필터 */
  type?: ClueType;

  /** 키워드 검색 */
  keywords?: string[];

  /** 유사도 임계값 (VectorDB) */
  similarityThreshold?: number;
}
