import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ProblemMeta, MathSubSubject } from "./types";

const PROBLEMS_PATH = path.join(process.cwd(), "content/problems");

/**
 * JSON + MDX 구조에서 문제 데이터 로딩
 */
export function getProblemData(
  subject: string,
  year: string,
  examType: string,
  number: string,
): {
  meta: ProblemMeta;
  intent: string;
  strategy: string;
  clues: { id: string; title: string; content: string }[];
  steps: { id: string; title: string; content: string }[];
  mistakes: { id: string; title: string; content: string }[];
} | null {
  // 과목별 경로 결정 (수학이면 세부과목 포함)
  const problemPath = getProblemPath(subject, year, examType, number);

  if (!problemPath) return null;

  // meta.json 읽기
  const metaPath = path.join(problemPath, "meta.json");
  if (!fs.existsSync(metaPath)) return null;

  const metaContent = fs.readFileSync(metaPath, "utf-8");
  const meta: ProblemMeta = JSON.parse(metaContent);

  // intent.mdx 읽기
  const intentPath = path.join(problemPath, "intent.mdx");
  const intent = fs.existsSync(intentPath)
    ? fs.readFileSync(intentPath, "utf-8")
    : "";

  // strategy.mdx 읽기
  const strategyPath = path.join(problemPath, "strategy.mdx");
  const strategy = fs.existsSync(strategyPath)
    ? fs.readFileSync(strategyPath, "utf-8")
    : "";

  // clues 읽기
  const clues = meta.clues.map((clueDef) => {
    const cluePath = path.join(problemPath, clueDef.content);
    const content = fs.existsSync(cluePath)
      ? fs.readFileSync(cluePath, "utf-8")
      : "";

    return {
      id: clueDef.id,
      title: clueDef.title,
      content,
    };
  });

  // steps 읽기
  const steps = meta.steps.map((stepDef) => {
    const stepPath = path.join(problemPath, stepDef.content);
    const content = fs.existsSync(stepPath)
      ? fs.readFileSync(stepPath, "utf-8")
      : "";

    return {
      id: stepDef.id,
      title: stepDef.title,
      content,
    };
  });

  // mistakes 읽기
  const mistakes = meta.commonMistakes.map((mistakeDef) => {
    const mistakePath = path.join(problemPath, mistakeDef.content);
    const content = fs.existsSync(mistakePath)
      ? fs.readFileSync(mistakePath, "utf-8")
      : "";

    return {
      id: mistakeDef.id,
      title: mistakeDef.title,
      content,
    };
  });

  return {
    meta,
    intent,
    strategy,
    clues,
    steps,
    mistakes,
  };
}

/**
 * 과목에 따라 문제 경로 결정
 * 수학이면 세부과목(calculus, statistics, geometry) 포함
 */
function getProblemPath(
  subject: string,
  year: string,
  examType: string,
  number: string,
): string | null {
  // 수학일 경우 문제 번호로 세부과목 판단
  if (subject === "math") {
    const num = parseInt(number);
    let subSubject: MathSubSubject;

    if (num <= 22) {
      subSubject = "common";
    } else {
      // 23~30번은 미적분/확통/기하 중 하나
      // TODO: 나중에 사용자 선택 또는 URL 파라미터로 결정
      // 지금은 calculus로 가정
      subSubject = "calculus";
    }

    const problemPath = path.join(
      PROBLEMS_PATH,
      `math-${subSubject}`,
      year,
      examType,
      number,
    );

    return fs.existsSync(problemPath) ? problemPath : null;
  }

  // 다른 과목
  const problemPath = path.join(PROBLEMS_PATH, subject, year, examType, number);
  return fs.existsSync(problemPath) ? problemPath : null;
}

/**
 * 기존 getProblemContent (하위 호환성 유지)
 * TODO: 나중에 제거하고 getProblemData로 통합
 */
export function getProblemContent(
  subject: string,
  year: string,
  examType: string,
  number: string,
) {
  // 기존 MDX 파일 구조 (임시)
  const CONTENT_PATH = path.join(process.cwd(), "content/problems");
  const filePath = path.join(
    CONTENT_PATH,
    subject,
    year,
    examType,
    `${number}.mdx`,
  );

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    meta: data,
    content,
  };
}
