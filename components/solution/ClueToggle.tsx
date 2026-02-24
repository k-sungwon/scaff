"use client";

import { useState } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useSolution } from "@/contexts/SolutionContext";

interface ClueToggleProps {
  clueNumber: number;
  title: string;
  content: string;
  totalClues: number;
}

export function ClueToggle({
  clueNumber,
  title,
  content,
  totalClues,
}: ClueToggleProps) {
  const { revealMode, cluesRevealed, revealNextClue } = useSolution();
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null,
  );

  // 이 단서가 공개되었는가?
  const isRevealed = revealMode === "all" || clueNumber <= cluesRevealed;

  // 다음 공개 대상인가?
  const isNext = revealMode === "step" && clueNumber === cluesRevealed + 1;

  // 잠겨있는가?
  const isLocked =
    revealMode === "step" && clueNumber > cluesRevealed + 1;

  const handleReveal = async () => {
    if (isLocked) return;

    if (isNext) {
      revealNextClue();
    }

    // MDX 컴파일 (처음 열 때만)
    if (!mdxSource && content) {
      const compiled = await serialize(content, {
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex as any],
        },
      });
      setMdxSource(compiled);
    }
  };

  return (
    <div
      className={`my-4 border-l-4 pl-6 transition-all ${
        isLocked
          ? "border-gray-300 opacity-50"
          : "border-butterfly-500"
      }`}
    >
      <button
        onClick={handleReveal}
        disabled={isLocked}
        className={`flex items-center gap-3 text-left w-full group ${
          isLocked ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className="text-2xl">
          {isLocked ? "🔒" : isRevealed ? "▼" : "▶"}
        </span>
        <span
          className={`font-semibold text-lg ${
            isLocked
              ? "text-gray-400"
              : "text-butterfly-700 group-hover:text-butterfly-800"
          }`}
        >
          단서 {clueNumber}: {title}
        </span>
      </button>

      {isRevealed && mdxSource && (
        <div className="mt-4 pl-11 prose prose-sm max-w-none animate-fadeIn">
          <MDXRemote {...mdxSource} />
        </div>
      )}

      {isLocked && (
        <p className="text-xs text-gray-500 pl-11 mt-2">
          이전 단서를 먼저 확인하세요
        </p>
      )}
    </div>
  );
}
