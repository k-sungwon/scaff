// lib/mdx.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ProblemMeta } from "./types";

const CONTENT_PATH = path.join(process.cwd(), "content/problems");

// 특정 문제의 MDX 콘텐츠 가져오기
export function getProblemContent(
  subject: string,
  year: string,
  number: string,
) {
  const filePath = path.join(CONTENT_PATH, subject, year, `${number}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    meta: data as ProblemMeta,
    content,
  };
}

// 모든 문제 경로 가져오기 (SSG용)
export function getAllProblemPaths() {
  const paths: { subject: string; year: string; number: string }[] = [];

  const subjects = fs.readdirSync(CONTENT_PATH);

  for (const subject of subjects) {
    const subjectPath = path.join(CONTENT_PATH, subject);
    if (!fs.statSync(subjectPath).isDirectory()) continue;

    const years = fs.readdirSync(subjectPath);
    for (const year of years) {
      const yearPath = path.join(subjectPath, year);
      if (!fs.statSync(yearPath).isDirectory()) continue;

      const files = fs.readdirSync(yearPath).filter((f) => f.endsWith(".mdx"));
      for (const file of files) {
        paths.push({
          subject,
          year,
          number: file.replace(".mdx", ""),
        });
      }
    }
  }

  return paths;
}

// 특정 과목/연도의 모든 문제 메타데이터
export function getProblemsBySubjectAndYear(subject: string, year: string) {
  const dirPath = path.join(CONTENT_PATH, subject, year);

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".mdx"));
  const problems: ProblemMeta[] = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);
    problems.push(data as ProblemMeta);
  }

  return problems.sort((a, b) => a.number - b.number);
}
