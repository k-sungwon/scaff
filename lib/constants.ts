// 🎯 [핵심 패턴] 상수 정의 - 매직 넘버/문자열 제거

import type { Subject, Difficulty, ExamType, ProblemMeta } from "./types";

/**
 * 과목 한글명 매핑
 */
export const SUBJECT_LABELS: Record<Subject, string> = {
  math: "수학",
  physics: "물리학",
  chemistry: "화학",
  biology: "생명과학",
  "earth-science": "지구과학",
};

/**
 * 난이도 한글명 매핑
 */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  killer: "킬러",
  "semi-killer": "준킬러",
  normal: "일반",
};

/**
 * 난이도별 색상 (Tailwind CSS)
 */
export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  killer: "text-red-600",
  "semi-killer": "text-orange-600",
  normal: "text-gray-600",
};

/**
 * 시험 종류 한글명 매핑
 */
export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  june: "6월 모의고사",
  september: "9월 모의고사",
  regular: "수능",
};

/**
 * MVP 지원 년도
 */
export const SUPPORTED_YEARS = [2025] as const;

/**
 * MVP 지원 과목
 */
export const SUPPORTED_SUBJECTS: Subject[] = ["math"];

/**
 * MVP 지원 시험 종류 (표 가로축 순서)
 */
export const SUPPORTED_EXAM_TYPES: ExamType[] = ["june", "september", "regular"];

/**
 * MVP 문제 목록 (하드코딩)
 * 2025 수능 킬러 5문제
 */
export const MVP_PROBLEMS: ProblemMeta[] = [
  {
    id: "2025-math-regular-21",
    subject: "math",
    year: 2025,
    examType: "regular",
    number: 21,
    title: "21번 - 미적분 킬러",
    difficulty: "killer",
    concepts: ["미적분", "극한"],
    estimatedTime: 15,
  },
  {
    id: "2025-math-regular-22",
    subject: "math",
    year: 2025,
    examType: "regular",
    number: 22,
    title: "22번 - 기하 킬러",
    difficulty: "killer",
    concepts: ["기하", "벡터"],
    estimatedTime: 15,
  },
  {
    id: "2025-math-regular-28",
    subject: "math",
    year: 2025,
    examType: "regular",
    number: 28,
    title: "28번 - 확률과 통계",
    difficulty: "killer",
    concepts: ["확률", "통계"],
    estimatedTime: 12,
  },
  {
    id: "2025-math-regular-29",
    subject: "math",
    year: 2025,
    examType: "regular",
    number: 29,
    title: "29번 - 수열",
    difficulty: "killer",
    concepts: ["수열", "귀납법"],
    estimatedTime: 15,
  },
  {
    id: "2025-math-regular-30",
    subject: "math",
    year: 2025,
    examType: "regular",
    number: 30,
    title: "30번 - 함수의 극한",
    difficulty: "killer",
    concepts: ["극한", "연속"],
    estimatedTime: 18,
  },
];

/**
 * 라우트 경로
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  problems: "/problems",
  problem: (subject: Subject, year: number, examType: ExamType, number: number) =>
    `/problems/${subject}/${year}/${examType}/${number}`,
} as const;
