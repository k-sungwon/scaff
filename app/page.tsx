import { Header } from "@/components/layout/Header";
import { MVP_PROBLEMS } from "@/lib/constants";
import { HomeClient } from "@/components/home/HomeClient";
import { getProblemData } from "@/lib/problem";

// 🎯 [핵심 패턴] 서버 컴포넌트 - 데이터 로딩
export default function Home() {
  // MVP 문제 목록 (간단하게 2025 수학 정규시험만)
  const problems = MVP_PROBLEMS.filter(
    (p) => p.year === 2025 && p.subject === "math" && p.examType === "regular",
  )
    .sort((a, b) => a.number - b.number)
    .map((p) => ({
      number: p.number,
      title: p.title,
      difficulty: p.difficulty,
    }));

  // 모든 문제 데이터를 미리 로드
  const problemDataMap: Record<
    number,
    {
      meta: any;
      clues: { id: string; title: string; content: string }[];
      steps: { id: string; title: string; content: string }[];
    } | null
  > = {};

  problems.forEach((p) => {
    const data = getProblemData("math", "2025", "regular", String(p.number));
    if (data) {
      problemDataMap[p.number] = {
        meta: data.meta,
        clues: data.clues,
        steps: data.steps,
      };
    }
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-paper-50 to-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HomeClient initialProblems={problems} problemDataMap={problemDataMap} />
      </main>
    </div>
  );
}
