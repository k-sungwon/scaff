"use client";

import { useState, useEffect } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useSolution } from "@/contexts/SolutionContext";
import type { ProblemMeta } from "@/lib/types";

interface ConversationViewProps {
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
  meta: ProblemMeta;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string | MDXRemoteSerializeResult;
  title?: string;
  isCompiling?: boolean;
}

// 풀이 단계 컴포넌트
function SolutionStep({
  stepNumber,
  title,
  content,
}: {
  stepNumber: number;
  title: string;
  content: string;
}) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null,
  );
  const [isCompiling, setIsCompiling] = useState(true);

  useEffect(() => {
    serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex as any],
      },
    })
      .then((compiled) => {
        setMdxSource(compiled);
        setIsCompiling(false);
      })
      .catch((error) => {
        console.error("MDX compilation error:", error);
        setIsCompiling(false);
      });
  }, [content]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-full">
      <h3 className="text-lg font-semibold text-blue-700 mb-4">
        풀이 {stepNumber}: {title}
      </h3>
      <div className="prose prose-sm max-w-none">
        {isCompiling ? (
          <p className="text-gray-500 text-sm">로딩 중...</p>
        ) : mdxSource ? (
          <MDXRemote {...mdxSource} />
        ) : null}
      </div>
    </div>
  );
}

export function ConversationView({ clues, steps, meta }: ConversationViewProps) {
  const { revealMode, cluesRevealed, setRevealMode, revealNextClue } =
    useSolution();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSolution, setShowSolution] = useState(false);

  // 초기 메시지 (문제 제시)
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "problem",
          type: "user",
          content: "이 문제를 같이 풀어볼까요? 힌트가 필요하시면 말씀해주세요.",
        },
      ]);
    }
  }, [messages.length]);

  // 단서 공개 시 메시지 추가
  useEffect(() => {
    if (revealMode === "all") {
      // 전체 보기: 모든 단서를 한 번에 추가
      const newMessages: Message[] = [];

      clues.forEach((clue, index) => {
        const clueNumber = index + 1;

        // 사용자 메시지: 힌트 요청
        newMessages.push({
          id: `user-clue-${clueNumber}`,
          type: "user",
          content: `단서 ${clueNumber} 보여주세요`,
        });

        // Assistant 메시지: 단서 내용
        newMessages.push({
          id: `clue-${clueNumber}`,
          type: "assistant",
          title: `단서 ${clueNumber}: ${clue.title}`,
          content: clue.content,
          isCompiling: true,
        });
      });

      setMessages((prev) => [
        prev[0], // 초기 문제 제시 메시지 유지
        ...newMessages,
      ]);
    } else if (revealMode === "step" && cluesRevealed > 0) {
      // 단계별 보기: 공개된 단서만큼만 추가
      const newMessages: Message[] = [];

      for (let i = 0; i < cluesRevealed; i++) {
        const clue = clues[i];
        const clueNumber = i + 1;

        newMessages.push({
          id: `user-clue-${clueNumber}`,
          type: "user",
          content: `단서 ${clueNumber} 보여주세요`,
        });

        newMessages.push({
          id: `clue-${clueNumber}`,
          type: "assistant",
          title: `단서 ${clueNumber}: ${clue.title}`,
          content: clue.content,
          isCompiling: true,
        });
      }

      setMessages((prev) => [
        prev[0],
        ...newMessages,
      ]);
    } else if (revealMode === "none") {
      // 전체 접기: 초기 메시지만 유지
      setMessages((prev) => [prev[0]]);
    }
  }, [revealMode, cluesRevealed, clues]);

  // MDX 컴파일
  useEffect(() => {
    messages.forEach((message, index) => {
      if (
        message.type === "assistant" &&
        message.isCompiling &&
        typeof message.content === "string"
      ) {
        serialize(message.content, {
          mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex as any],
          },
        }).then((compiled) => {
          setMessages((prev) =>
            prev.map((msg, i) =>
              i === index
                ? { ...msg, content: compiled, isCompiling: false }
                : msg,
            ),
          );
        });
      }
    });
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* 힌트 컨트롤러 - 대화 시작 전 */}
      <div className="bg-white rounded-2xl shadow-lg border border-butterfly-100 p-6">
        <p className="text-sm text-gray-800 mb-4 font-medium">
          💡 힌트가 필요하신가요?
        </p>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              if (revealMode !== "step") {
                setRevealMode("step");
                if (cluesRevealed === 0) {
                  revealNextClue();
                }
              } else {
                revealNextClue();
              }
            }}
            disabled={revealMode === "step" && cluesRevealed >= clues.length}
            className={`px-5 py-2.5 border-2 rounded-lg font-medium transition-all ${
              revealMode === "step"
                ? "border-butterfly-500 bg-butterfly-50 text-butterfly-700"
                : "border-butterfly-400 text-butterfly-600 hover:bg-butterfly-50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {revealMode === "step" && cluesRevealed < clues.length
              ? `다음 단서 보기 (${cluesRevealed}/${clues.length})`
              : revealMode === "step" && cluesRevealed >= clues.length
                ? "모든 단서 확인함"
                : "단서 1개씩 보기"}
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
              onClick={() => setRevealMode("none")}
              className="px-5 py-2.5 text-gray-600 underline hover:text-gray-800 font-medium"
            >
              전체 접기
            </button>
          )}
        </div>
      </div>

      {/* 대화 메시지들 */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`animate-fadeIn ${
              message.type === "user" ? "flex justify-end" : ""
            }`}
          >
            {message.type === "user" ? (
              // 사용자 메시지 (오른쪽 정렬, 간단한 말풍선)
              <div className="bg-butterfly-500 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-md shadow-sm">
                <p className="text-sm">{message.content as string}</p>
              </div>
            ) : (
              // Assistant 메시지 (왼쪽 정렬, 카드 형태)
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-full">
                {message.title && (
                  <h3 className="text-lg font-semibold text-butterfly-700 mb-4">
                    {message.title}
                  </h3>
                )}
                <div className="prose prose-sm max-w-none">
                  {message.isCompiling ? (
                    <p className="text-gray-500 text-sm">로딩 중...</p>
                  ) : typeof message.content === "string" ? (
                    <p>{message.content}</p>
                  ) : (
                    <MDXRemote {...message.content} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 풀이 보기 버튼 */}
      {!showSolution && revealMode !== "none" && (
        <div className="bg-white rounded-2xl shadow-lg border border-butterfly-100 p-6 animate-fadeIn">
          <p className="text-sm text-gray-800 mb-4 font-medium">
            📝 단서를 확인하셨나요? 이제 풀이를 볼 수 있습니다.
          </p>
          <button
            onClick={() => setShowSolution(true)}
            className="px-6 py-3 bg-butterfly-600 text-white rounded-lg font-medium hover:bg-butterfly-700 transition-colors"
          >
            풀이 보기
          </button>
        </div>
      )}

      {/* 풀이 단계들 */}
      {showSolution && (
        <div className="space-y-4 animate-fadeIn">
          {/* 풀이 시작 메시지 */}
          <div className="flex justify-end">
            <div className="bg-butterfly-500 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-md shadow-sm">
              <p className="text-sm">풀이를 보여주세요</p>
            </div>
          </div>

          {steps.map((step, index) => (
            <SolutionStep
              key={step.id}
              stepNumber={index + 1}
              title={step.title}
              content={step.content}
            />
          ))}
        </div>
      )}

      {/* 개념 정보 - 하단 */}
      {revealMode !== "none" && (
        <div className="bg-paper-100 rounded-2xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg">💡</span>
            이 문제의 핵심 개념
          </h3>
          <div className="space-y-2">
            {meta.concepts.map((concept) => (
              <div
                key={concept.id}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <span className="text-butterfly-600 font-medium">•</span>
                <div>
                  <div className="font-medium text-gray-800">
                    {concept.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {concept.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
