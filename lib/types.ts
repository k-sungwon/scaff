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
 * 수학 세부 과목 (공통/미적분/확통/기하)
 */
export type MathSubSubject =
  | "common"      // 공통 (1~22번)
  | "calculus"    // 미적분 (23~30번)
  | "statistics"  // 확률과 통계 (23~30번)
  | "geometry";   // 기하 (23~30번)

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
 * 개념 정의 (재사용 가능)
 */
export interface Concept {
  id: string; // "inverse-function-monotonicity"
  name: string; // "역함수의 단조성"
  category: string; // "미적분-역함수"
}

/**
 * 단서 타입 (VectorDB 분류용)
 */
export type ClueType =
  | "approach"   // 접근법 (어떻게 시작할지)
  | "pattern"    // 패턴 인식 (무엇을 찾을지)
  | "trigger"    // 트리거 조건 (언제 사용할지)
  | "technique"; // 기술 (구체적 계산법)

/**
 * 풀이 단계 타입
 */
export type StepType =
  | "setup"          // 준비 (부호 확정, 식 정리)
  | "transformation" // 변환 (역함수 뒤집기, 치환)
  | "analysis"       // 분석 (교점 개수, 구간 판단)
  | "calculation"    // 계산
  | "verification";  // 검증

/**
 * 단서 정의 (JSON 구조)
 */
export interface ClueDefinition {
  id: string; // "clue-1"
  type: ClueType;
  title: string; // "절댓값 벗기기"
  keywords: string[]; // ["절댓값", "증가함수"]
  content: string; // "clues/1.mdx" (파일 경로)
}

/**
 * 풀이 단계 정의 (JSON 구조)
 */
export interface StepDefinition {
  id: string; // "step-1"
  type: StepType;
  title: string; // "역함수 부호 확정"
  concepts: string[]; // concept.id 참조
  content: string; // "steps/1.mdx"
}

/**
 * 흔한 실수 정의
 */
export interface MistakeDefinition {
  id: string; // "mistake-1"
  title: string; // "부정형 아닐 때 로피탈 적용"
  severity: "high" | "medium" | "low";
  content: string; // "mistakes/1.mdx"
}

/**
 * 문제 메타데이터 (JSON 구조)
 */
export interface ProblemMeta {
  id: string; // "2025-math-calculus-regular-30"
  subject: Subject;
  subSubject?: MathSubSubject; // 수학일 때만
  year: number;
  examType: ExamType;
  number: number;
  title: string; // "30번 - 역함수와 교점 개수"
  difficulty: Difficulty;
  estimatedTime: number; // 분

  // 태그 (VectorDB 검색용)
  tags: string[]; // ["역함수", "미적분", "증가함수", ...]

  // 개념 (구조화된 데이터)
  concepts: Concept[];

  // 단서/풀이/실수 (파일 참조)
  clues: ClueDefinition[];
  steps: StepDefinition[];
  commonMistakes: MistakeDefinition[];

  // 관련 문제 (추천 시스템용)
  relatedProblems?: string[]; // problem.id 배열
}

/**
 * 사용자 진행도 (로컬스토리지 저장용)
 */
export interface UserProgress {
  problemId: string;
  cluesRevealed: {
    id: string;
    timestamp: string;
  }[];
  stepsRevealed: {
    id: string;
    timestamp: string;
  }[];
  lastVisited: string;
  completedAt?: string; // 풀이 완료 시각
}

/**
 * 해설 공개 모드
 */
export type RevealMode = "none" | "step" | "all";

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
