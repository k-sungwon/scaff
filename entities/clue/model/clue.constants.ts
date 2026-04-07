/**
 * @file entities/clue/model/clue.constants.ts
 * @description Clue 관련 상수 정의
 *
 * 플로우:
 * 1. Clue 관련 매직 넘버/문자열 제거
 * 2. 중앙 집중 관리
 * 3. 타입 안정성 보장
 *
 * 역할:
 * - UI 레이블 정의
 * - 색상 정의 (Tailwind)
 * - LocalStorage 키
 *
 * 패턴: Constants Pattern
 * - 하드코딩된 값을 상수로 추출
 * - 변경 시 한 곳만 수정
 */

import type { ClueType, RevealMode } from "./clue.types";

// ============================================================================
// 단서 타입 레이블
// ============================================================================

/**
 * 단서 타입 한글 레이블
 *
 * 역할: UI에서 표시할 텍스트
 *
 * 사용 예시:
 * ```tsx
 * <Badge>{CLUE_TYPE_LABELS[clue.type]}</Badge>
 * // → "접근법", "패턴 인식" 등
 * ```
 */
export const CLUE_TYPE_LABELS: Record<ClueType, string> = {
  approach: "접근법",
  pattern: "패턴 인식",
  trigger: "트리거 조건",
  technique: "계산 기술",
} as const;

// ============================================================================
// 단서 타입 색상 (Tailwind CSS)
// ============================================================================

/**
 * 단서 타입별 Tailwind CSS 클래스
 *
 * 역할: 단서 타입을 시각적으로 구분
 *
 * 색상 선택 이유:
 * - approach (파란색): 시작 단계 → 차분한 색
 * - pattern (초록색): 패턴 발견 → 긍정적 색
 * - trigger (노란색): 주의 필요 → 경고 색
 * - technique (보라색): 전문 기술 → 고급스러운 색
 *
 * 사용 예시:
 * ```tsx
 * <Badge className={CLUE_TYPE_COLORS[clue.type]}>
 *   {CLUE_TYPE_LABELS[clue.type]}
 * </Badge>
 * ```
 */
export const CLUE_TYPE_COLORS: Record<ClueType, string> = {
  approach: "bg-blue-100 text-blue-700 border-blue-200",
  pattern: "bg-green-100 text-green-700 border-green-200",
  trigger: "bg-yellow-100 text-yellow-700 border-yellow-200",
  technique: "bg-purple-100 text-purple-700 border-purple-200",
} as const;

/**
 * 단서 타입별 아이콘 (추후 확장용)
 *
 * 역할: 시각적 식별 강화
 */
export const CLUE_TYPE_ICONS: Record<ClueType, string> = {
  approach: "🎯", // 목표
  pattern: "🔍", // 돋보기
  trigger: "⚡", // 번개
  technique: "🛠️", // 도구
} as const;

// ============================================================================
// 공개 모드 레이블
// ============================================================================

/**
 * 공개 모드 한글 레이블
 *
 * 사용 예시:
 * ```tsx
 * <p>현재 모드: {REVEAL_MODE_LABELS[revealMode]}</p>
 * ```
 */
export const REVEAL_MODE_LABELS: Record<RevealMode, string> = {
  none: "전체 숨김",
  step: "단계별 보기",
  all: "전체 보기",
} as const;

// ============================================================================
// LocalStorage 키
// ============================================================================

/**
 * LocalStorage 키 네임스페이스
 *
 * 역할:
 * - 다른 앱과 키 충돌 방지
 * - 버전 관리 (v1)
 *
 * 네이밍 규칙:
 * - `scaff:v1:{feature}:{id}`
 * - 예: "scaff:v1:clue-progress:2025-math-calculus-regular-30"
 *
 * 왜 v1?
 * - 데이터 구조 변경 시 v2로 마이그레이션
 * - 이전 버전 데이터 무시 가능
 */
export const STORAGE_KEYS = {
  /** 단서 진행도 저장 키 */
  CLUE_PROGRESS: "scaff:v1:clue-progress",

  /** 전체 단서 진행도 목록 */
  CLUE_PROGRESS_LIST: "scaff:v1:clue-progress-list",
} as const;

// ============================================================================
// 기본값
// ============================================================================

/**
 * 단서 공개 기본 설정
 *
 * 역할:
 * - 초기 상태 정의
 * - 일관된 기본값 보장
 */
export const CLUE_DEFAULTS = {
  /** 초기 공개 모드 */
  INITIAL_REVEAL_MODE: "none" as RevealMode,

  /** 초기 공개 개수 */
  INITIAL_REVEALED_COUNT: 0,

  /** 단계별 공개 시 한 번에 공개할 개수 */
  REVEAL_STEP_SIZE: 1,

  /** 최대 단서 개수 (검증용) */
  MAX_CLUES: 10,
} as const;

// ============================================================================
// 애니메이션 설정
// ============================================================================

/**
 * 단서 공개 애니메이션 설정
 *
 * 역할:
 * - 일관된 애니메이션 속도
 * - 사용자 경험 향상
 *
 * 사용 예시:
 * ```tsx
 * <div
 *   className="animate-fadeIn"
 *   style={{ animationDuration: `${CLUE_ANIMATION.FADE_IN_DURATION}ms` }}
 * >
 *   {clue.title}
 * </div>
 * ```
 */
export const CLUE_ANIMATION = {
  /** 페이드 인 지속 시간 (ms) */
  FADE_IN_DURATION: 300,

  /** 슬라이드 다운 지속 시간 (ms) */
  SLIDE_DOWN_DURATION: 400,

  /** 딜레이 (연속 공개 시 간격, ms) */
  REVEAL_DELAY: 150,
} as const;

// ============================================================================
// 메시지
// ============================================================================

/**
 * 사용자 메시지 (UI 텍스트)
 *
 * 역할:
 * - UI 텍스트 중앙 관리
 * - 다국어 지원 준비 (추후)
 */
export const CLUE_MESSAGES = {
  /** 단서 없음 */
  NO_CLUES: "단서가 없습니다",

  /** 모든 단서 확인 완료 */
  ALL_REVEALED: "모든 단서를 확인했습니다",

  /** 단서 로딩 중 */
  LOADING: "단서를 불러오는 중...",

  /** 단서 로딩 실패 */
  LOAD_ERROR: "단서를 불러올 수 없습니다",

  /** 다음 단서 버튼 */
  REVEAL_NEXT: (current: number, total: number) =>
    `다음 단서 보기 (${current + 1}/${total})`,

  /** 전체 보기 버튼 */
  REVEAL_ALL: "전체 보기",

  /** 전체 접기 버튼 */
  HIDE_ALL: "전체 접기",

  /** 진행도 표시 */
  PROGRESS: (revealed: number, total: number) =>
    `${revealed}/${total} 단서 확인`,
} as const;
