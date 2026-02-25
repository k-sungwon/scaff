"use client";

import { useSolution } from "@/contexts/SolutionContext";

export function HintController() {
  const { revealMode, setRevealMode, cluesRevealed, resetClues } =
    useSolution();

  return (
    <div className="sticky top-20 bg-white border-2 border-butterfly-100 rounded-lg p-6 shadow-sm mb-8 z-10">
      <p className="text-sm text-gray-800 mb-4 font-medium">
        💡 힌트가 필요하신가요?
      </p>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setRevealMode("step")}
          className={`px-5 py-2.5 border-2 rounded-lg font-medium transition-all ${
            revealMode === "step"
              ? "border-butterfly-500 bg-butterfly-50 text-butterfly-700"
              : "border-butterfly-400 text-butterfly-600 hover:bg-butterfly-50"
          }`}
        >
          단서 1개씩 보기
        </button>

        <button
          onClick={() => setRevealMode("all")}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
            revealMode === "all"
              ? "bg-butterfly-600 text-white"
              : "bg-butterfly-500 text-white hover:bg-butterfly-600"
          }`}
        >
          전체 보기
        </button>

        {(revealMode !== "none" || cluesRevealed > 0) && (
          <button
            onClick={() => {
              setRevealMode("none");
              resetClues();
            }}
            className="px-5 py-2.5 text-gray-600 underline hover:text-gray-800 font-medium"
          >
            전체 접기
          </button>
        )}
      </div>

      {revealMode === "step" && cluesRevealed > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          현재 {cluesRevealed}개 단서 공개됨
        </p>
      )}
    </div>
  );
}
