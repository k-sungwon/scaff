// app/problems/[subject]/[year]/[examType]/[number]/page.tsx

import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { getProblemContent } from "@/lib/mdx";
import { EXAM_TYPE_LABELS } from "@/lib/constants";
import type { ExamType } from "@/lib/types";

// 🎯 [핵심 패턴] Next.js 15 Dynamic Route with TypeScript
type Props = {
  params: Promise<{
    subject: string;
    year: string;
    examType: string;
    number: string;
  }>;
};

// 🎯 [핵심 패턴] Async Server Component - DB/파일 접근 가능
export default async function ProblemPage({ params }: Props) {
  // Next.js 15에서는 params가 Promise
  const { subject, year, examType, number } = await params;

  // 🎯 [Vercel Rule: server-cache-react] React.cache()로 중복 제거는 mdx.ts에 적용됨
  const problemData = getProblemContent(subject, year, examType, number);

  if (!problemData) {
    notFound();
  }

  const { meta, content } = problemData;

  return (
    <div className="min-h-screen bg-paper-50">
      {/* 헤더 영역 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 text-sm text-gray-light mb-2">
            <span>{meta.subject === "math" ? "수학" : meta.subject}</span>
            <span>•</span>
            <span>{meta.year}학년도 {EXAM_TYPE_LABELS[meta.examType as ExamType]}</span>
            <span>•</span>
            <span>{meta.number}번</span>
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mdx-content">
          {/* 🎯 [핵심 패턴] MDX 렌더링 with KaTeX */}
          <MDXRemote
            source={content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkMath],
                // @ts-ignore - rehypeKatex 타입 이슈
                rehypePlugins: [rehypeKatex],
              },
            }}
          />
        </article>

        {/* 문제 정보 사이드바 */}
        <div className="mt-8 p-6 bg-paper-100 rounded-lg">
          <h3 className="font-semibold text-gray-text mb-3">이 문제의 핵심 개념</h3>
          <div className="flex flex-wrap gap-2">
            {meta.concepts.map((concept) => (
              <span
                key={concept}
                className="px-3 py-1 bg-white text-gray-text text-sm rounded border border-gray-200"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎯 [핵심 패턴] generateMetadata - SEO 최적화
export async function generateMetadata({ params }: Props) {
  const { subject, year, examType, number } = await params;
  const problemData = getProblemContent(subject, year, examType, number);

  if (!problemData) {
    return {
      title: "문제를 찾을 수 없습니다",
    };
  }

  const examLabel = EXAM_TYPE_LABELS[examType as ExamType];
  return {
    title: `${problemData.meta.title} | ${year}학년도 ${examLabel} ${subject} ${number}번 | Scaff`,
    description: `${year}학년도 ${examLabel} ${subject} ${number}번 문제 해설 - 사고 회로 중심 해설`,
  };
}
