/**
 * API Route: GET /api/problems/[id]/steps
 * 역할: 풀이 단계 반환 (서버에서 MDX 컴파일)
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

    const meta = await problemRepository.getProblemMeta(id);
    if (!meta) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    const steps = await Promise.all(
      meta.steps.map(async (stepDef) => {
        const problemPath = `content/problems/math-calculus/2025/regular/30`;
        const fs = require("fs/promises");
        const content = await fs.readFile(
          `${process.cwd()}/${problemPath}/${stepDef.content}`,
          "utf-8"
        );
        return { ...stepDef, content };
      })
    );

    const compileResults = await compileMDXBatch(
      steps.map((s) => s.content)
    );

    const compiled = steps.map((step, index) => ({
      id: step.id,
      type: step.type,
      title: step.title,
      concepts: step.concepts,
      compiled: compileResults[index].success
        ? compileResults[index].result
        : null,
    }));

    return NextResponse.json({
      steps: compiled,
      total: compiled.length,
      problemId: id,
    });
  } catch (error) {
    console.error("[API] Steps error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
