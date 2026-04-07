/**
 * @file app/test-new-arch/page.tsx
 * @description 새 아키텍처 테스트 페이지
 *
 * 플로우:
 * 1. useClues 훅으로 단서 로드
 * 2. 로딩/에러/성공 상태 표시
 * 3. MDX 렌더링
 */

"use client";

import { useState } from "react";
import { MDXRemote } from "next-mdx-remote";
import { useClues } from "@/features/clue-reveal/hooks/use-clues";
import { useClueProgress } from "@/features/clue-reveal/hooks/use-clue-progress";
import { Button } from "@/shared/ui";
import { Card } from "@/shared/ui";
import { ClueBadge } from "@/entities/clue";

export default function TestNewArchPage() {
  const problemId = "2025-math-calculus-regular-30";

  // 단서 데이터 로드
  const { data: clues, isLoading, error } = useClues(problemId);

  // 진행 상태
  const { progress, revealNext, revealAll, hideAll, canRevealNext, progressPercent } =
    useClueProgress(problemId, clues?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">새 아키텍처 테스트</h1>

        {/* 로딩 */}
        {isLoading && (
          <Card className="p-6">
            <p className="text-gray-600">단서를 불러오는 중...</p>
          </Card>
        )}

        {/* 에러 */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <p className="text-red-700">에러: {(error as Error).message}</p>
          </Card>
        )}

        {/* 성공 */}
        {clues && (
          <>
            {/* 컨트롤러 */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                단서 컨트롤 ({progress.revealedCount}/{clues.length})
              </h2>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-butterfly-500 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={revealNext} disabled={!canRevealNext}>
                  다음 단서
                </Button>
                <Button onClick={revealAll} variant="secondary">
                  전체 보기
                </Button>
                {progress.revealedCount > 0 && (
                  <Button onClick={hideAll} variant="ghost">
                    전체 접기
                  </Button>
                )}
              </div>
            </Card>

            {/* 단서 목록 */}
            <div className="space-y-4">
              {clues.slice(0, progress.revealedCount).map((clue, index) => (
                <Card key={clue.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                      단서 {index + 1}: {clue.title}
                    </h3>
                    <ClueBadge type={clue.type} />
                  </div>

                  {clue.compiled ? (
                    <div className="prose prose-sm max-w-none">
                      <MDXRemote {...clue.compiled} />
                    </div>
                  ) : (
                    <p className="text-gray-500">컴파일 실패</p>
                  )}

                  <div className="flex gap-2 mt-4">
                    {clue.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
