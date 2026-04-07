/**
 * @file entities/clue/index.ts
 * @description Clue 엔티티 Public API
 *
 * 플로우:
 * 1. Clue 모듈의 모든 export를 여기서 재export
 * 2. 외부 모듈은 이 파일만 import
 * 3. 내부 구조 변경 시 여기만 수정
 *
 * 역할:
 * - 모듈 경계 명확화
 * - 캡슐화 (내부 구조 숨김)
 * - Import 경로 단순화
 *
 * 패턴: Facade Pattern
 * - 복잡한 내부 구조를 간단한 인터페이스로 노출
 * - 의존성 역전 (외부는 내부 구조 몰라도 됨)
 *
 * 사용 예시:
 * ```typescript
 * // ❌ 나쁜 예 (내부 구조 노출)
 * import { Clue } from '@/entities/clue/model/clue.types';
 * import { getClues } from '@/entities/clue/api/get-clues';
 * import { ClueBadge } from '@/entities/clue/ui/clue-badge';
 *
 * // ✅ 좋은 예 (Public API 사용)
 * import { Clue, getClues, ClueBadge } from '@/entities/clue';
 * ```
 */

// ============================================================================
// Types (model/)
// ============================================================================

/**
 * Clue 관련 타입
 *
 * 재export 이유:
 * - 외부에서 타입 사용 시 경로 단순화
 * - 타입 파일 위치 변경 시 여기만 수정
 */
export type {
  ClueType,
  ClueBase,
  Clue,
  CompiledClue,
  RevealMode,
  ClueProgress,
  ClueListResponse,
  ClueFilter,
} from "./model/clue.types";

// ============================================================================
// Constants (model/)
// ============================================================================

/**
 * Clue 관련 상수
 *
 * 재export 이유:
 * - UI에서 레이블/색상 사용
 * - 일관된 값 보장
 */
export {
  CLUE_TYPE_LABELS,
  CLUE_TYPE_COLORS,
  CLUE_TYPE_ICONS,
  REVEAL_MODE_LABELS,
  STORAGE_KEYS,
  CLUE_DEFAULTS,
  CLUE_ANIMATION,
  CLUE_MESSAGES,
} from "./model/clue.constants";

// ============================================================================
// API Functions (api/)
// ============================================================================

/**
 * Clue API 호출 함수
 *
 * 재export 이유:
 * - Hook에서 사용
 * - API 호출 로직 캡슐화
 */
export {
  getClues,
  getClue,
  getClueApiUrl,
  createFetchOptions,
} from "./api/get-clues";

// ============================================================================
// UI Components (ui/)
// ============================================================================

/**
 * Clue UI 컴포넌트
 *
 * 재export 이유:
 * - 다른 feature에서 재사용
 * - 일관된 UI 보장
 */
export { ClueBadge, ClueBadgeSmall, ClueBadgeIconOnly } from "./ui/clue-badge";

// ============================================================================
// 네임스페이스 export (선택적)
// ============================================================================

/**
 * Clue 관련 모든 것을 네임스페이스로 묶음
 *
 * 사용 예시:
 * ```typescript
 * import { Clue } from '@/entities/clue';
 *
 * const labels = Clue.CONSTANTS.CLUE_TYPE_LABELS;
 * const clues = await Clue.API.getClues('...');
 * ```
 *
 * 장점:
 * - 명확한 네임스페이스
 * - 자동완성 지원
 *
 * 단점:
 * - 약간 장황함
 *
 * 선택사항: 프로젝트 스타일에 따라 사용
 */
import * as ClueAPI from "./api/get-clues";
import * as ClueConstants from "./model/clue.constants";

export const Clue = {
  API: ClueAPI,
  CONSTANTS: ClueConstants,
} as const;
