/**
 * API Route: GET /api/problems/[id]/clues
 * 역할: 단서 목록 반환 (서버에서 MDX 컴파일)
 */

import { NextRequest, NextResponse } from "next/server";
import { problemRepository } from "@/entities/problem/lib/problem.repository";
import { compileMDXBatch } from "@/shared/lib/mdx/compile";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. 문제 메타데이터 로드
    const meta = await problemRepository.getProblemMeta(id);
    if (!meta) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // 2. 단서 파일 로드 (병렬)
    const clues = await Promise.all(
      meta.clues.map(async (clueDef) => {
        const problemPath = `content/problems/math-calculus/2025/regular/30`;
        const fs = require("fs/promises");
        const content = await fs.readFile(
          `${process.cwd()}/${problemPath}/${clueDef.content}`,
          "utf-8"
        );
        return { ...clueDef, content };
      })
    );

    // 3. MDX 컴파일 (병렬)
    const compileResults = await compileMDXBatch(
      clues.map((c) => c.content)
    );

    const compiled = clues.map((clue, index) => ({
      id: clue.id,
      type: clue.type,
      title: clue.title,
      keywords: clue.keywords,
      compiled: compileResults[index].success
        ? compileResults[index].result
        : null,
    }));

    return NextResponse.json({
      clues: compiled,
      total: compiled.length,
      problemId: id,
    });
  } catch (error) {
    console.error("[API] Clues error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
