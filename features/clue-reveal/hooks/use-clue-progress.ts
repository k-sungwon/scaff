/**
 * @file features/clue-reveal/hooks/use-clue-progress.ts
 * @description 단서 진행 상태 관리 훅
 */

"use client";

import { useState, useEffect } from "react";
import type { ClueProgress, RevealMode } from "@/entities/clue";
import { STORAGE_KEYS, CLUE_DEFAULTS } from "@/entities/clue";

export function useClueProgress(problemId: string, totalClues: number) {
  const [progress, setProgress] = useState<ClueProgress>({
    problemId,
    revealMode: CLUE_DEFAULTS.INITIAL_REVEAL_MODE,
    revealedCount: CLUE_DEFAULTS.INITIAL_REVEALED_COUNT,
    totalCount: totalClues,
    lastUpdated: new Date().toISOString(),
  });

  // LocalStorage 로드
  useEffect(() => {
    const key = `${STORAGE_KEYS.CLUE_PROGRESS}:${problemId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProgress(parsed);
      } catch (error) {
        console.error("Failed to load progress:", error);
      }
    }
  }, [problemId]);

  // LocalStorage 저장
  useEffect(() => {
    if (progress.revealedCount > 0) {
      const key = `${STORAGE_KEYS.CLUE_PROGRESS}:${problemId}`;
      localStorage.setItem(key, JSON.stringify(progress));
    }
  }, [progress, problemId]);

  const revealNext = () => {
    if (progress.revealedCount < totalClues) {
      setProgress((prev) => ({
        ...prev,
        revealMode: "step",
        revealedCount: prev.revealedCount + 1,
        lastUpdated: new Date().toISOString(),
      }));
    }
  };

  const revealAll = () => {
    setProgress((prev) => ({
      ...prev,
      revealMode: "all",
      revealedCount: totalClues,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const hideAll = () => {
    setProgress((prev) => ({
      ...prev,
      revealMode: "none",
      revealedCount: 0,
      lastUpdated: new Date().toISOString(),
    }));
  };

  return {
    progress,
    revealNext,
    revealAll,
    hideAll,
    canRevealNext: progress.revealedCount < totalClues,
    progressPercent: Math.round((progress.revealedCount / totalClues) * 100),
  };
}
