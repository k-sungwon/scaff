/**
 * @file entities/clue/ui/clue-badge.tsx
 * @description Clue 타입 배지 컴포넌트
 *
 * 플로우:
 * 1. ClueType 받음
 * 2. 타입에 맞는 색상/레이블 표시
 * 3. 재사용 가능한 작은 컴포넌트
 *
 * 역할:
 * - 단서 타입 시각화
 * - 일관된 스타일 보장
 * - 재사용성
 *
 * 패턴: Presentational Component
 * - Props만 받아서 렌더링
 * - 상태 없음 (Stateless)
 * - 순수 컴포넌트
 *
 * 함수형 vs 객체지향:
 * - 함수형 컴포넌트
 * - Props → JSX (순수 함수처럼)
 */

import type { ClueType } from "../model/clue.types";
import {
  CLUE_TYPE_LABELS,
  CLUE_TYPE_COLORS,
  CLUE_TYPE_ICONS,
} from "../model/clue.constants";

// ============================================================================
// Props 타입
// ============================================================================

interface ClueBadgeProps {
  /** 단서 타입 */
  type: ClueType;

  /** 아이콘 표시 여부 */
  showIcon?: boolean;

  /** 추가 CSS 클래스 */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * 단서 타입 배지
 *
 * @param type - 단서 타입 (approach, pattern, trigger, technique)
 * @param showIcon - 아이콘 표시 여부 (기본: true)
 * @param className - 추가 CSS 클래스
 *
 * 사용 예시:
 * ```tsx
 * <ClueBadge type="approach" />
 * // → [🎯 접근법] (파란색 배지)
 *
 * <ClueBadge type="pattern" showIcon={false} />
 * // → [패턴 인식] (아이콘 없음)
 * ```
 *
 * 스타일:
 * - 타입별 색상 자동 적용
 * - Tailwind CSS 사용
 * - 둥근 모서리 (rounded-full)
 * - 패딩 (px-3 py-1)
 *
 * 접근성:
 * - role="badge" 추가 (스크린 리더)
 * - aria-label로 의미 전달
 */
export function ClueBadge({
  type,
  showIcon = true,
  className = "",
}: ClueBadgeProps) {
  // 타입에 맞는 색상 가져오기
  const colorClass = CLUE_TYPE_COLORS[type];

  // 타입 레이블 가져오기
  const label = CLUE_TYPE_LABELS[type];

  // 아이콘 가져오기
  const icon = showIcon ? CLUE_TYPE_ICONS[type] : null;

  return (
    <span
      role="badge"
      aria-label={`단서 타입: ${label}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {/* 아이콘 (선택적) */}
      {icon && <span className="text-sm">{icon}</span>}

      {/* 레이블 */}
      <span>{label}</span>
    </span>
  );
}

// ============================================================================
// 변형 컴포넌트들
// ============================================================================

/**
 * 작은 배지 (컴팩트 버전)
 *
 * 사용 케이스:
 * - 좁은 공간에서 사용
 * - 목록에서 여러 개 나열
 *
 * 사용 예시:
 * ```tsx
 * <ClueBadgeSmall type="approach" />
 * ```
 */
export function ClueBadgeSmall({ type }: { type: ClueType }) {
  return (
    <ClueBadge
      type={type}
      showIcon={false}
      className="px-2 py-0.5 text-2xs"
    />
  );
}

/**
 * 아이콘만 표시 (초소형)
 *
 * 사용 케이스:
 * - 공간이 매우 제한적일 때
 * - 툴팁과 함께 사용
 *
 * 사용 예시:
 * ```tsx
 * <ClueBadgeIconOnly type="approach" />
 * ```
 */
export function ClueBadgeIconOnly({ type }: { type: ClueType }) {
  const icon = CLUE_TYPE_ICONS[type];
  const label = CLUE_TYPE_LABELS[type];

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-block text-lg"
    >
      {icon}
    </span>
  );
}
