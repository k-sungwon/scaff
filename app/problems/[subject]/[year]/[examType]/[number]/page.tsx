import { notFound } from "next/navigation";
import { getProblemData } from "@/lib/problem";
import { EXAM_TYPE_LABELS } from "@/lib/constants";
import type { ExamType } from "@/lib/types";
import { SolutionProvider } from "@/contexts/SolutionContext";
import { HintController } from "@/components/solution/HintController";
import { ClueSection } from "@/components/solution/ClueSection";

type Props = {
  params: Promise<{
    subject: string;
    year: string;
    examType: string;
    number: string;
  }>;
};

export default async function ProblemPage({ params }: Props) {
  const { subject, year, examType, number } = await params;

  // JSON + MDX 구조 로딩
  const problemData = getProblemData(subject, year, examType, number);

  if (!problemData) {
    notFound();
  }

  const { meta, clues } = problemData;

  return (
    <div className="min-h-screen bg-paper-50">
      {/* 헤더 영역 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 text-sm text-gray-light mb-2">
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
          <h1 className="text-3xl font-bold text-gray-text">{meta.title}</h1>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="px-3 py-1 bg-butterfly-400 text-gray-text rounded-full font-medium">
              {meta.difficulty === "killer" ? "킬러" : meta.difficulty}
            </span>
            <span className="text-gray-light">
              예상 소요시간: {meta.estimatedTime}분
            </span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <SolutionProvider problemId={meta.id} totalClues={clues.length}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* 힌트 컨트롤러 */}
          <HintController />

          {/* 문제 (임시 - 나중에 problem.mdx 추가) */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📌 문제</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
              <p className="text-gray-600">
                문제 이미지 또는 텍스트가 여기에 표시됩니다.
              </p>
            </div>
          </section>

          {/* 태그 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-text mb-3">
              🏷️ 태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-paper-100 text-gray-text text-sm rounded-lg border border-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* 단서 섹션 */}
          <ClueSection clues={clues} />

          {/* 개념 정보 */}
          <section className="mt-12 p-6 bg-paper-100 rounded-lg">
            <h3 className="font-semibold text-gray-text mb-3">
              💡 이 문제의 핵심 개념
            </h3>
            <div className="space-y-2">
              {meta.concepts.map((concept) => (
                <div
                  key={concept.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                >
                  <span className="text-butterfly-600 font-medium">•</span>
                  <div>
                    <div className="font-medium text-gray-text">
                      {concept.name}
                    </div>
                    <div className="text-xs text-gray-light mt-1">
                      {concept.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </SolutionProvider>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { subject, year, examType, number } = await params;
  const problemData = getProblemData(subject, year, examType, number);

  if (!problemData) {
    return {
      title: "문제를 찾을 수 없습니다",
    };
  }

  const examLabel = EXAM_TYPE_LABELS[examType as ExamType];
  const subSubjectLabel =
    problemData.meta.subSubject === "calculus"
      ? "미적분"
      : problemData.meta.subSubject === "statistics"
        ? "확률과 통계"
        : problemData.meta.subSubject === "geometry"
          ? "기하"
          : "";

  return {
    title: `${problemData.meta.title} | ${year}학년도 ${examLabel} ${subject} ${number}번 ${subSubjectLabel} | Scaff`,
    description: `${year}학년도 ${examLabel} ${subject} ${number}번 문제 해설 - 사고 회로 중심 해설`,
  };
}
