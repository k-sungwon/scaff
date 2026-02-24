"use client";

import { ClueToggle } from "./ClueToggle";

interface ClueSectionProps {
  clues: {
    id: string;
    title: string;
    content: string;
  }[];
}

export function ClueSection({ clues }: ClueSectionProps) {
  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">🔍 단서</h2>
        <span className="text-sm text-gray-500 font-medium">
          총 {clues.length}개
        </span>
      </div>

      {clues.map((clue, index) => (
        <ClueToggle
          key={clue.id}
          clueNumber={index + 1}
          title={clue.title}
          content={clue.content}
          totalClues={clues.length}
        />
      ))}
    </div>
  );
}
