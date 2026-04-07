/**
 * @file shared/lib/validation/base.schema.ts
 * @description 전역 Zod 스키마 정의
 *
 * 플로우:
 * 1. 기본 타입 스키마 정의 (Subject, Difficulty 등)
 * 2. TypeScript 타입 추론 (z.infer)
 * 3. 다른 모듈에서 import하여 사용
 *
 * 역할:
 * - 런타임 타입 검증 (JSON 파일 읽을 때)
 * - TypeScript 타입 자동 생성
 * - API 응답 검증
 *
 * 패턴: Schema-First Design
 * - 스키마를 먼저 정의하고 타입을 추론
 * - 런타임/컴파일타임 타입 일치 보장
 */

import { z } from "zod";

// ============================================================================
// 기본 Enum 스키마
// ============================================================================

/**
 * 과목 스키마
 * MVP: math만 사용, 나머지는 추후 확장
 */
export const SubjectSchema = z.enum([
  "math",
  "physics",
  "chemistry",
  "biology",
  "earth-science",
]);

/**
 * 수학 세부 과목 스키마
 * - common: 1~22번 (공통 수학)
 * - calculus: 23~30번 (미적분)
 * - statistics: 23~30번 (확률과 통계)
 * - geometry: 23~30번 (기하)
 */
export const MathSubSubjectSchema = z.enum([
  "common",
  "calculus",
  "statistics",
  "geometry",
]);

/**
 * 난이도 스키마
 * MVP: killer 문제만 다룸
 */
export const DifficultySchema = z.enum(["killer", "semi-killer", "normal"]);

/**
 * 시험 종류 스키마
 */
export const ExamTypeSchema = z.enum(["june", "september", "regular"]);

// ============================================================================
// TypeScript 타입 추론
// ============================================================================

/**
 * z.infer로 TypeScript 타입 자동 생성
 * - 스키마와 타입이 항상 일치
 * - 중복 정의 불필요
 */
export type Subject = z.infer<typeof SubjectSchema>;
export type MathSubSubject = z.infer<typeof MathSubSubjectSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type ExamType = z.infer<typeof ExamTypeSchema>;

// ============================================================================
// 공통 객체 스키마
// ============================================================================

/**
 * 개념 스키마
 * - id: 개념 고유 식별자 (예: "inverse-function-monotonicity")
 * - name: 개념 이름 (예: "역함수의 단조성")
 * - category: 카테고리 (예: "미적분-역함수")
 */
export const ConceptSchema = z.object({
  id: z.string().min(1, "Concept ID는 필수입니다"),
  name: z.string().min(1, "Concept 이름은 필수입니다"),
  category: z.string().min(1, "Concept 카테고리는 필수입니다"),
});

export type Concept = z.infer<typeof ConceptSchema>;
