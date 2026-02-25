"use client";

import { useState } from "react";
import {
  SUPPORTED_YEARS,
  SUPPORTED_SUBJECTS,
  SUPPORTED_EXAM_TYPES,
  EXAM_TYPE_LABELS,
  SUBJECT_LABELS,
} from "@/lib/constants";
import type { ExamType, Subject, ProblemMeta } from "@/lib/types";
import { ProblemViewer } from "@/components/problem/ProblemViewer";

interface Problem {
  number: number;
  title: string;
  difficulty: string;
}

interface HomeClientProps {
  initialProblems: Problem[];
  problemDataMap: Record<
    number,
    {
      meta: ProblemMeta;
      clues: { id: string; title: string; content: string }[];
      steps: { id: string; title: string; content: string }[];
    } | null
  >;
}

export function HomeClient({
  initialProblems,
  problemDataMap,
}: HomeClientProps) {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedSubject, setSelectedSubject] = useState<Subject>("math");
  const [selectedExam, setSelectedExam] = useState<ExamType>("regular");
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null);

  // 현재 선택된 문제 데이터
  const selectedProblemData =
    selectedProblem !== null ? problemDataMap[selectedProblem] : null;

  // 문제 목록
  const problems = initialProblems;

  return (
    <>
      {/* 상단: 제목 + 년도 선택 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              수능 기출 해설
            </h1>
            <p className="text-gray-600">
              킬러 문제의 사고 회로를 배워보세요
            </p>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2.5 bg-white border border-paper-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm font-medium text-gray-800 shadow-sm hover:shadow transition-shadow"
          >
            {SUPPORTED_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 탭 UI: 하나의 박스 - 문제 선택 시 축소됨 */}
      <div
        className={`bg-white rounded-2xl shadow-lg border border-paper-200 overflow-hidden transition-all duration-500 ${
          selectedProblem !== null ? "mb-8" : ""
        }`}
      >
        {/* 상단 탭: 시험 종류 (포스트잇 플래그) */}
        <div className="flex border-b border-paper-200">
          {SUPPORTED_EXAM_TYPES.map((examType) => (
            <button
              key={examType}
              onClick={() => setSelectedExam(examType)}
              className={`flex-1 px-6 py-4 font-medium text-sm transition-all relative ${
                selectedExam === examType
                  ? "bg-white text-gray-800"
                  : "bg-paper-100 text-gray-600 hover:bg-paper-50"
              }`}
            >
              {EXAM_TYPE_LABELS[examType]}
              {selectedExam === examType && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800" />
              )}
            </button>
          ))}
        </div>

        {/* 좌측 탭 + 콘텐츠 */}
        <div className="flex">
          {/* 좌측: 과목 탭 (포스트잇 플래그) */}
          <div className="flex flex-col border-r border-paper-200">
            {SUPPORTED_SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                  selectedSubject === subject
                    ? "bg-white text-gray-800 border-r-2 border-gray-800"
                    : "bg-paper-100 text-gray-600 hover:bg-paper-50"
                }`}
              >
                {SUBJECT_LABELS[subject]}
              </button>
            ))}
            {/* 준비중 과목 */}
            <button
              disabled
              className="px-6 py-4 text-sm font-medium bg-paper-100 text-gray-600er cursor-not-allowed whitespace-nowrap"
            >
              물리학
            </button>
            <button
              disabled
              className="px-6 py-4 text-sm font-medium bg-paper-100 text-gray-600er cursor-not-allowed whitespace-nowrap"
            >
              화학
            </button>
          </div>

          {/* 우측: 문제 번호 그리드 */}
          <div className="flex-1 p-8 bg-paper-50">
            {problems.length > 0 ? (
              <div>
                {/* 헤더 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {SUBJECT_LABELS[selectedSubject]} ·{" "}
                    {EXAM_TYPE_LABELS[selectedExam]}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {problems.length}개의 문제
                  </p>
                </div>

                {/* 문제 번호 그리드 */}
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4">
                  {problems.map((problem) => (
                    <button
                      key={problem.number}
                      onClick={() => setSelectedProblem(problem.number)}
                      className="group relative aspect-square bg-linear-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl flex flex-col items-center justify-center transition-all hover:shadow-lg hover:scale-105 border border-gray-300"
                      title={problem.title}
                    >
                      <span className="text-xl font-bold text-gray-800 group-hover:text-gray-900">
                        {problem.number}
                      </span>
                      <span className="text-xs text-gray-600 mt-1">번</span>
                      {/* 킬러 배지 */}
                      {problem.difficulty === "killer" && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 하단 정보 */}
                <div className="mt-6 pt-6 border-t border-paper-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>킬러 문제</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-paper-200 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600er"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  해설 준비 중입니다
                </p>
                <p className="text-gray-600er text-xs">
                  {SUBJECT_LABELS[selectedSubject]} ·{" "}
                  {EXAM_TYPE_LABELS[selectedExam]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 문제 뷰어 - 선택된 문제가 있을 때만 표시 */}
      {selectedProblem !== null && selectedProblemData && (
        <ProblemViewer
          meta={selectedProblemData.meta}
          clues={selectedProblemData.clues}
          steps={selectedProblemData.steps}
          onClose={() => setSelectedProblem(null)}
        />
      )}

      {/* 하단 안내 - 문제 선택 안 했을 때만 */}
      {selectedProblem === null && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-300">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>MVP: 2025 수능 킬러 5문제 해설 제공</span>
          </div>
        </div>
      )}
    </>
  );
}
