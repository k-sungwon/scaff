"use client";

import { EXAM_TYPE_LABELS } from "@/lib/constants";
import type { ExamType, ProblemMeta } from "@/lib/types";
import { SolutionProvider } from "@/contexts/SolutionContext";
import { ConversationView } from "./ConversationView";

interface ProblemViewerProps {
  meta: ProblemMeta;
  clues: {
    id: string;
    title: string;
    content: string;
  }[];
  steps: {
    id: string;
    title: string;
    content: string;
  }[];
  onClose: () => void;
}

export function ProblemViewer({
  meta,
  clues,
  steps,
  onClose,
}: ProblemViewerProps) {
  return (
    <SolutionProvider problemId={meta.id} totalClues={clues.length}>
      <div className="max-w-4xl mx-auto animate-fadeIn">
        {/* 헤더 - 문제 정보 */}
        <div className="bg-white rounded-2xl shadow-lg border border-paper-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-1 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              문제 목록으로
            </button>

            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <span>{meta.subject === "math" ? "수학" : meta.subject}</span>
              <span>•</span>
              <span>
                {meta.year}학년도 {EXAM_TYPE_LABELS[meta.examType as ExamType]}
              </span>
              <span>•</span>
              <span>{meta.number}번</span>
              {meta.subSubject && (
                <>
                  <span>•</span>
                  <span className="text-butterfly-600 font-medium">
                    {meta.subSubject === "calculus" && "미적분"}
                    {meta.subSubject === "statistics" && "확률과 통계"}
                    {meta.subSubject === "geometry" && "기하"}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {meta.title}
            </h1>

            <div className="flex gap-4 text-sm">
              <span className="px-3 py-1 bg-butterfly-400 text-gray-800 rounded-full font-medium">
                {meta.difficulty === "killer" ? "킬러" : meta.difficulty}
              </span>
              <span className="text-gray-600">
                예상 소요시간: {meta.estimatedTime}분
              </span>
            </div>
          </div>

          {/* 태그 */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              🏷️ 태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-paper-100 text-gray-800 text-sm rounded-lg border border-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 대화형 뷰 - Claude 스타일 */}
        <ConversationView clues={clues} steps={steps} meta={meta} />
      </div>
    </SolutionProvider>
  );
}
