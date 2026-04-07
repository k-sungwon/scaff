/**
 * @file entities/problem/model/problem.schema.ts
 * @description Problem 엔티티 Zod 스키마
 *
 * 플로우:
 * 1. Zod 스키마 정의 (런타임 검증용)
 * 2. Repository에서 JSON 파일 읽은 후 검증
 * 3. 잘못된 데이터 조기 발견
 *
 * 역할:
 * - JSON 파일 검증 (meta.json)
 * - API 응답 검증
 * - 타입 추론 (TypeScript)
 *
 * 패턴: Schema-First + Validation
 * - 스키마로 타입과 검증을 동시에 해결
 * - 런타임 안정성 보장
 *
 * 함수형 vs 객체지향:
 * - 스키마는 불변 객체
 * - 검증은 순수 함수 (parse)
 */

import { z } from "zod";
import {
  SubjectSchema,
  MathSubSubjectSchema,
  DifficultySchema,
  ExamTypeSchema,
  ConceptSchema,
} from "@/shared/lib/validation/base.schema";

// ============================================================================
// 단서/풀이/실수 타입 스키마
// ============================================================================

/**
 * 단서 타입 스키마
 */
export const ClueTypeSchema = z.enum([
  "approach",
  "pattern",
  "trigger",
  "technique",
]);

/**
 * 풀이 단계 타입 스키마
 */
export const StepTypeSchema = z.enum([
  "setup",
  "transformation",
  "analysis",
  "calculation",
  "verification",
]);

// ============================================================================
// 정의(Definition) 스키마
// ============================================================================

/**
 * 단서 정의 스키마
 *
 * 검증 규칙:
 * - id: 빈 문자열 불가
 * - type: ClueType enum 중 하나
 * - title: 빈 문자열 불가
 * - keywords: 배열 (빈 배열 허용)
 * - content: 파일 경로 (빈 문자열 불가)
 */
export const ClueDefinitionSchema = z.object({
  id: z.string().min(1, "Clue ID는 필수입니다"),
  type: ClueTypeSchema,
  title: z.string().min(1, "Clue 제목은 필수입니다"),
  keywords: z.array(z.string()).default([]),
  content: z.string().min(1, "Clue 파일 경로는 필수입니다"),
});

/**
 * 풀이 단계 정의 스키마
 */
export const StepDefinitionSchema = z.object({
  id: z.string().min(1, "Step ID는 필수입니다"),
  type: StepTypeSchema,
  title: z.string().min(1, "Step 제목은 필수입니다"),
  concepts: z.array(z.string()).default([]),
  content: z.string().min(1, "Step 파일 경로는 필수입니다"),
});

/**
 * 흔한 실수 정의 스키마
 */
export const MistakeDefinitionSchema = z.object({
  id: z.string().min(1, "Mistake ID는 필수입니다"),
  title: z.string().min(1, "Mistake 제목은 필수입니다"),
  severity: z.enum(["high", "medium", "low"]),
  content: z.string().min(1, "Mistake 파일 경로는 필수입니다"),
});

// ============================================================================
// Problem 메타데이터 스키마
// ============================================================================

/**
 * Problem 메타데이터 스키마
 *
 * 검증 규칙:
 * - id: 문자열 (예: "2025-math-calculus-regular-30")
 * - subject: Subject enum
 * - subSubject: 선택적 (수학일 때만)
 * - year: 1900 이상 숫자
 * - examType: ExamType enum
 * - number: 1~30
 * - title: 빈 문자열 불가
 * - difficulty: Difficulty enum
 * - estimatedTime: 1 이상
 * - tags: 문자열 배열
 * - concepts: Concept 배열
 * - clues: ClueDefinition 배열
 * - steps: StepDefinition 배열
 * - commonMistakes: MistakeDefinition 배열
 * - relatedProblems: 선택적 문자열 배열
 *
 * 예시 검증 에러:
 * ```typescript
 * const invalidData = { number: 0 };  // number는 1~30
 * ProblemMetaSchema.parse(invalidData);
 * // → ZodError: number must be >= 1
 * ```
 */
export const ProblemMetaSchema = z.object({
  id: z.string().min(1, "Problem ID는 필수입니다"),
  subject: SubjectSchema,
  subSubject: MathSubSubjectSchema.optional(),
  year: z.number().min(1900, "Year는 1900 이상이어야 합니다"),
  examType: ExamTypeSchema,
  number: z
    .number()
    .min(1, "문제 번호는 1 이상이어야 합니다")
    .max(30, "문제 번호는 30 이하여야 합니다"),
  title: z.string().min(1, "문제 제목은 필수입니다"),
  difficulty: DifficultySchema,
  estimatedTime: z.number().min(1, "예상 소요 시간은 1분 이상이어야 합니다"),
  tags: z.array(z.string()).default([]),
  concepts: z.array(ConceptSchema).default([]),
  clues: z.array(ClueDefinitionSchema).default([]),
  steps: z.array(StepDefinitionSchema).default([]),
  commonMistakes: z.array(MistakeDefinitionSchema).default([]),
  relatedProblems: z.array(z.string()).optional(),
});

// ============================================================================
// TypeScript 타입 추론
// ============================================================================

/**
 * Zod 스키마에서 TypeScript 타입 추론
 *
 * 장점:
 * - 타입과 검증 규칙이 항상 일치
 * - 스키마 수정 시 타입도 자동 업데이트
 * - 중복 정의 불필요
 *
 * 사용 예시:
 * ```typescript
 * import { ProblemMeta } from './problem.types';  // 수동 정의
 * import type { ProblemMetaFromSchema } from './problem.schema';  // 자동 추론
 *
 * // 둘 다 같은 타입
 * const problem1: ProblemMeta = { ... };
 * const problem2: ProblemMetaFromSchema = { ... };
 * ```
 */
export type ProblemMetaFromSchema = z.infer<typeof ProblemMetaSchema>;
export type ClueDefinitionFromSchema = z.infer<typeof ClueDefinitionSchema>;
export type StepDefinitionFromSchema = z.infer<typeof StepDefinitionSchema>;
export type MistakeDefinitionFromSchema = z.infer<
  typeof MistakeDefinitionSchema
>;

// ============================================================================
// 검증 유틸리티 함수
// ============================================================================

/**
 * Problem ID 유효성 검사
 *
 * @param id - 검증할 Problem ID
 * @returns true = 유효, false = 무효
 *
 * 플로우:
 * 1. 정규식으로 형식 확인
 * 2. 형식: {year}-{subject}-{subSubject?}-{examType}-{number}
 *
 * 예시:
 * ```typescript
 * isValidProblemId('2025-math-calculus-regular-30')  // → true
 * isValidProblemId('invalid-id')                     // → false
 * ```
 *
 * 패턴: Validation Pattern
 * - 빠른 검증 (정규식)
 * - 무효한 데이터 조기 차단
 */
export function isValidProblemId(id: string): boolean {
  // 형식: 2025-math-calculus-regular-30
  // 또는: 2025-math-common-regular-21
  const pattern =
    /^\d{4}-(math|physics|chemistry|biology|earth-science)-(common|calculus|statistics|geometry)-(june|september|regular)-\d{1,2}$/;

  return pattern.test(id);
}

/**
 * Problem 메타데이터 안전하게 파싱
 *
 * @param data - 파싱할 데이터 (unknown)
 * @returns 성공 시 ProblemMeta, 실패 시 null
 *
 * 플로우:
 * 1. Zod parse 시도
 * 2. 성공 → ProblemMeta 반환
 * 3. 실패 → 에러 로깅 + null 반환
 *
 * 사용 예시:
 * ```typescript
 * const jsonData = JSON.parse(fileContent);
 * const problemMeta = safeParseProblemMeta(jsonData);
 *
 * if (problemMeta) {
 *   // 안전하게 사용
 *   console.log(problemMeta.title);
 * } else {
 *   // 에러 처리
 *   console.error('Invalid problem data');
 * }
 * ```
 *
 * 왜 try-catch?
 * - Zod는 검증 실패 시 throw
 * - Repository에서 매번 try-catch 쓰기 귀찮음
 * - 여기서 한 번만 처리
 */
export function safeParseProblemMeta(data: unknown): ProblemMetaFromSchema | null {
  try {
    return ProblemMetaSchema.parse(data);
  } catch (error) {
    console.error("[Schema] Problem 파싱 에러:", error);
    return null;
  }
}
