// 🎯 [핵심 패턴] 타입 정의 - 유니온 타입 활용

/**
 * 과목 타입
 * MVP: math만 사용, 나머지는 추후 확장
 */
export type Subject =
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "earth-science";

/**
 * 난이도
 * MVP: killer 문제만 다룸
 */
export type Difficulty = "killer" | "semi-killer" | "normal";

/**
 * 시험 종류
 * MVP: 2025년 6월, 9월, 수능
 */
export type ExamType = "june" | "september" | "regular";

/**
 * 문제 메타데이터
 * MDX 파일의 프론트매터와 일치
 */
export interface ProblemMeta {
  id: string; // "2025-math-june-21"
  subject: Subject;
  year: number;
  examType: ExamType; // 시험 종류
  number: number; // 문제 번호 (21, 22, ...)
  title: string; // "21번 - 삼각함수의 극한"
  difficulty: Difficulty;
  concepts: string[]; // ["삼각함수", "극한"]
  estimatedTime: number; // 풀이 예상 시간 (분)
}

/**
 * 단서 (사고 회로의 핵심)
 * "문제에서 무엇을 캐치해야 하는가"
 */
export interface Clue {
  text: string; // 단서 내용
  location: string; // "조건에서", "보기에서"
  implication: string; // 이 단서가 의미하는 것
}

/**
 * 개념 선택 이유
 * "왜 이 개념을 쓰는가"
 */
export interface ConceptReason {
  concept: string; // 사용할 개념
  whyThisConcept: string; // 왜 이 개념인가
  wrongApproach: string; // 흔한 잘못된 접근
}

/**
 * 풀이 단계
 * 각 단계의 행동-이유-결과
 */
export interface SolutionStep {
  step: number;
  action: string; // 무엇을 하는가
  reason: string; // 왜 이렇게 하는가
  result: string; // 결과
}

/**
 * 흔한 실수 패턴
 */
export interface Mistake {
  description: string; // 실수 내용
  whyItHappens: string; // 왜 이런 실수를 하는가
  howToAvoid: string; // 방지 방법
}

/**
 * Supabase User 타입
 * auth.users 테이블
 */
export interface User {
  id: string;
  email: string;
  created_at: string;
}

/**
 * 로그인/회원가입 폼 데이터
 */
export interface AuthFormData {
  email: string;
  password: string;
}
