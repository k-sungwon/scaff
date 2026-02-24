"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { RevealMode, UserProgress } from "@/lib/types";

interface SolutionContextType {
  // 공개 모드
  revealMode: RevealMode;
  setRevealMode: (mode: RevealMode) => void;

  // 단서 진행도
  cluesRevealed: number;
  revealNextClue: () => void;
  revealAllClues: () => void;
  resetClues: () => void;

  // 풀이 단계 진행도
  stepsRevealed: Set<string>;
  toggleStep: (stepId: string) => void;
  revealAllSteps: () => void;

  // 진행도 저장/로드
  saveProgress: () => void;
  loadProgress: () => void;
}

const SolutionContext = createContext<SolutionContextType | undefined>(
  undefined,
);

interface SolutionProviderProps {
  children: ReactNode;
  problemId: string;
  totalClues: number;
}

export function SolutionProvider({
  children,
  problemId,
  totalClues,
}: SolutionProviderProps) {
  const [revealMode, setRevealMode] = useState<RevealMode>("none");
  const [cluesRevealed, setCluesRevealed] = useState(0);
  const [stepsRevealed, setStepsRevealed] = useState<Set<string>>(new Set());

  // 로컬스토리지 키
  const STORAGE_KEY = `progress:v1:${problemId}`;

  // 초기 로드
  useEffect(() => {
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  // revealMode 변경 시 자동 처리
  useEffect(() => {
    if (revealMode === "all") {
      setCluesRevealed(totalClues);
    } else if (revealMode === "none") {
      setCluesRevealed(0);
      setStepsRevealed(new Set());
    }
  }, [revealMode, totalClues]);

  const revealNextClue = () => {
    if (cluesRevealed < totalClues) {
      setCluesRevealed((prev) => prev + 1);
    }
  };

  const revealAllClues = () => {
    setCluesRevealed(totalClues);
  };

  const resetClues = () => {
    setCluesRevealed(0);
  };

  const toggleStep = (stepId: string) => {
    setStepsRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const revealAllSteps = () => {
    // 모든 step을 revealed로 설정하려면 전체 stepId 목록 필요
    // 일단 revealMode='all'로 처리
    setRevealMode("all");
  };

  const saveProgress = () => {
    try {
      const progress: UserProgress = {
        problemId,
        cluesRevealed: Array.from({ length: cluesRevealed }, (_, i) => ({
          id: `clue-${i + 1}`,
          timestamp: new Date().toISOString(),
        })),
        stepsRevealed: Array.from(stepsRevealed).map((id) => ({
          id,
          timestamp: new Date().toISOString(),
        })),
        lastVisited: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      // localStorage 사용 불가 (incognito 모드 등)
      console.warn("Failed to save progress:", error);
    }
  };

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const progress: UserProgress = JSON.parse(stored);

      setCluesRevealed(progress.cluesRevealed.length);
      setStepsRevealed(
        new Set(progress.stepsRevealed.map((step) => step.id)),
      );
    } catch (error) {
      console.warn("Failed to load progress:", error);
    }
  };

  // 진행도 변경 시 자동 저장
  useEffect(() => {
    if (cluesRevealed > 0 || stepsRevealed.size > 0) {
      saveProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluesRevealed, stepsRevealed]);

  const value: SolutionContextType = {
    revealMode,
    setRevealMode,
    cluesRevealed,
    revealNextClue,
    revealAllClues,
    resetClues,
    stepsRevealed,
    toggleStep,
    revealAllSteps,
    saveProgress,
    loadProgress,
  };

  return (
    <SolutionContext.Provider value={value}>
      {children}
    </SolutionContext.Provider>
  );
}

export function useSolution() {
  const context = useContext(SolutionContext);
  if (context === undefined) {
    throw new Error("useSolution must be used within SolutionProvider");
  }
  return context;
}
