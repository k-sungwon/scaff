/**
 * @file entities/problem/model/problem.types.ts
 * @description Problem 엔티티 타입 정의
 *
 * 플로우:
 * 1. Problem 관련 모든 타입 정의
 * 2. 다른 모듈에서 import하여 사용
 * 3. Zod 스키마와 함께 사용
 *
 * 역할:
 * - Problem 엔티티의 모든 타입 중앙 관리
 * - 타입 안정성 보장
 * - 도메인 개념 명확화
 *
 * 패턴: Domain-Driven Design (DDD)
 * - Problem = 집합 루트 (Aggregate Root)
 * - Clue, Step = 엔티티
 * - Concept = 값 객체 (Value Object)
 */

import type {
  Subject,
  MathSubSubject,
  Difficulty,
  ExamType,
  Concept,
} from "@/shared/lib/validation/base.schema";

// ============================================================================
// Problem 메타데이터 (JSON에서 로드)
// ============================================================================

/**
 * 문제 메타데이터
 *
 * 역할:
 * - 문제의 기본 정보 (제목, 난이도, 연도 등)
 * - 문제 검색/필터링에 사용
 * - 목록 화면에서 표시
 *
 * 데이터 소스: content/problems/{subject}/{year}/{examType}/{number}/meta.json
 *
 * 예시:
 * ```json
 * {
 *   "id": "2025-math-calculus-regular-30",
 *   "subject": "math",
 *   "subSubject": "calculus",
 *   "year": 2025,
 *   "examType": "regular",
 *   "number": 30,
 *   "title": "30번 - 역함수와 교점 개수",
 *   "difficulty": "killer",
 *   "estimatedTime": 18,
 *   "tags": ["역함수", "미적분", "증가함수"],
 *   "concepts": [...],
 *   "clues": [...],
 *   "steps": [...],
 *   "commonMistakes": [...]
 * }
 * ```
 */
export interface ProblemMeta {
  /** 문제 고유 식별자 (예: "2025-math-calculus-regular-30") */
  id: string;

  /** 과목 */
  subject: Subject;

  /** 수학 세부 과목 (수학일 때만) */
  subSubject?: MathSubSubject;

  /** 연도 (예: 2025) */
  year: number;

  /** 시험 종류 */
  examType: ExamType;

  /** 문제 번호 (1~30) */
  number: number;

  /** 문제 제목 */
  title: string;

  /** 난이도 */
  difficulty: Difficulty;

  /** 예상 소요 시간 (분) */
  estimatedTime: number;

  /** 태그 (검색용) */
  tags: string[];

  /** 핵심 개념 */
  concepts: Concept[];

  /** 단서 정의 (파일 경로 참조) */
  clues: ClueDefinition[];

  /** 풀이 단계 정의 (파일 경로 참조) */
  steps: StepDefinition[];

  /** 흔한 실수 정의 */
  commonMistakes: MistakeDefinition[];

  /** 관련 문제 ID 목록 (추천용) */
  relatedProblems?: string[];
}

// ============================================================================
// 단서/풀이/실수 정의 (메타데이터)
// ============================================================================

/**
 * 단서 타입
 * - approach: 문제 접근법 (어떻게 시작할지)
 * - pattern: 패턴 인식 (무엇을 찾을지)
 * - trigger: 트리거 조건 (언제 사용할지)
 * - technique: 구체적 기술 (계산 방법)
 */
export type ClueType = "approach" | "pattern" | "trigger" | "technique";

/**
 * 풀이 단계 타입
 * - setup: 준비 (부호 확정, 식 정리)
 * - transformation: 변환 (역함수 뒤집기, 치환)
 * - analysis: 분석 (교점 개수, 구간 판단)
 * - calculation: 계산
 * - verification: 검증
 */
export type StepType =
  | "setup"
  | "transformation"
  | "analysis"
  | "calculation"
  | "verification";

/**
 * 단서 정의 (메타데이터)
 *
 * 역할:
 * - 단서 파일 경로 참조
 * - 단서 분류 정보
 * - VectorDB 임베딩용 키워드
 */
export interface ClueDefinition {
  /** 단서 ID (예: "clue-1") */
  id: string;

  /** 단서 타입 (VectorDB 분류용) */
  type: ClueType;

  /** 단서 제목 */
  title: string;

  /** 키워드 (검색용) */
  keywords: string[];

  /** MDX 파일 경로 (예: "clues/1.mdx") */
  content: string;
}

/**
 * 풀이 단계 정의 (메타데이터)
 */
export interface StepDefinition {
  /** 단계 ID (예: "step-1", "step-3-1") */
  id: string;

  /** 단계 타입 */
  type: StepType;

  /** 단계 제목 */
  title: string;

  /** 사용된 개념 ID 목록 */
  concepts: string[];

  /** MDX 파일 경로 (예: "steps/1.mdx") */
  content: string;
}

/**
 * 흔한 실수 정의
 */
export interface MistakeDefinition {
  /** 실수 ID (예: "mistake-1") */
  id: string;

  /** 실수 제목 */
  title: string;

  /** 심각도 */
  severity: "high" | "medium" | "low";

  /** MDX 파일 경로 (예: "mistakes/1.mdx") */
  content: string;
}

// ============================================================================
// Problem 전체 데이터 (콘텐츠 포함)
// ============================================================================

/**
 * 완전한 문제 데이터
 *
 * 역할:
 * - Repository에서 반환하는 최종 데이터
 * - 메타데이터 + 실제 콘텐츠
 *
 * 차이점:
 * - ProblemMeta: 메타데이터만 (JSON)
 * - ProblemFull: 메타 + 콘텐츠 (JSON + MDX)
 *
 * 플로우:
 * 1. Repository가 meta.json 읽음 → ProblemMeta
 * 2. Repository가 MDX 파일들 읽음 → content 채움
 * 3. 최종 결과 → ProblemFull
 */
export interface ProblemFull {
  /** 메타데이터 */
  meta: ProblemMeta;

  /** 출제 의도 (MDX 원본) */
  intent: string;

  /** 해결 전략 (MDX 원본) */
  strategy: string;

  /** 단서 목록 (콘텐츠 포함) */
  clues: Array<ClueDefinition & { content: string }>;

  /** 풀이 단계 목록 (콘텐츠 포함) */
  steps: Array<StepDefinition & { content: string }>;

  /** 흔한 실수 목록 (콘텐츠 포함) */
  mistakes: Array<MistakeDefinition & { content: string }>;
}

// ============================================================================
// 목록용 간략 타입
// ============================================================================

/**
 * 문제 카드용 간략 정보
 *
 * 역할:
 * - 문제 목록 화면에서 사용
 * - 최소한의 정보만 포함 (성능 최적화)
 *
 * 플로우:
 * ProblemMeta → 필요한 필드만 추출 → ProblemCard
 */
export interface ProblemCard {
  /** 문제 ID */
  id: string;

  /** 문제 번호 */
  number: number;

  /** 제목 */
  title: string;

  /** 난이도 */
  difficulty: Difficulty;

  /** 과목 */
  subject: Subject;

  /** 세부 과목 */
  subSubject?: MathSubSubject;

  /** 연도 */
  year: number;

  /** 시험 종류 */
  examType: ExamType;

  /** 태그 (최대 3개) */
  tags: string[];
}

// ============================================================================
// 유틸리티 함수 타입
// ============================================================================

/**
 * Problem ID 파싱 결과
 *
 * 역할:
 * - Problem ID를 구성 요소로 분해
 * - 파일 경로 생성에 사용
 *
 * 예시:
 * "2025-math-calculus-regular-30" →
 * {
 *   year: 2025,
 *   subject: "math",
 *   subSubject: "calculus",
 *   examType: "regular",
 *   number: 30
 * }
 */
export interface ProblemIdParts {
  year: number;
  subject: Subject;
  subSubject?: MathSubSubject;
  examType: ExamType;
  number: number;
}

/**
 * 문제 필터 조건
 *
 * 역할:
 * - 문제 목록 필터링
 * - 검색 기능
 */
export interface ProblemFilter {
  year?: number;
  subject?: Subject;
  difficulty?: Difficulty;
  examType?: ExamType;
  tags?: string[];
  searchQuery?: string;
}
