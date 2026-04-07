/**
 * @file entities/problem/lib/problem.repository.ts
 * @description Problem Repository - 파일 시스템 데이터 접근 계층
 *
 * 플로우:
 * 1. 파일 시스템에서 문제 데이터 로딩
 * 2. JSON 파싱 + Zod 검증
 * 3. MDX 파일 병렬 읽기
 * 4. 최종 데이터 조합 반환
 *
 * 역할:
 * - 데이터 소스 추상화 (파일 시스템 → 나중에 Supabase로 교체 가능)
 * - 데이터 로딩 로직 캡슐화
 * - 캐싱 (React cache)
 * - 에러 처리
 *
 * 패턴: Repository Pattern
 * - 데이터 접근 로직을 비즈니스 로직에서 분리
 * - 테스트 시 Mock Repository로 교체 가능
 * - Single Responsibility (데이터 로딩만 담당)
 *
 * 함수형 vs 객체지향:
 * - Class 사용 (상태: basePath)
 * - 메서드는 순수 함수처럼 동작
 * - React cache로 메모이제이션
 */

import { cache } from "react";
import path from "path";
import {
  readFileIfExists,
  readFilesParallel,
  joinPath,
} from "@/shared/lib/fs/async-fs";
import { safeParseProblemMeta } from "../model/problem.schema";
import type {
  ProblemMeta,
  ProblemFull,
  ProblemIdParts,
} from "../model/problem.types";

// ============================================================================
// Repository 인터페이스
// ============================================================================

/**
 * Problem Repository 인터페이스
 *
 * 역할:
 * - Repository의 계약(Contract) 정의
 * - 테스트 시 Mock 구현 가능
 * - 나중에 다른 구현체로 교체 가능 (Supabase, API 등)
 *
 * 패턴: Dependency Inversion Principle
 * - 구체적 구현이 아닌 인터페이스에 의존
 * - Service는 IProblemRepository에 의존
 * - 구현체 교체 가능
 *
 * 예시:
 * ```typescript
 * // 파일 시스템 구현
 * const fsRepo = new FileSyste mProblemRepository('/path');
 *
 * // Supabase 구현 (나중에)
 * const supabaseRepo = new SupabaseProblemRepository(client);
 *
 * // Service는 인터페이스에만 의존
 * const service = new ProblemService(fsRepo);  // or supabaseRepo
 * ```
 */
export interface IProblemRepository {
  /**
   * 문제 메타데이터 로딩
   */
  getProblemMeta(problemId: string): Promise<ProblemMeta | null>;

  /**
   * 문제 전체 데이터 로딩 (메타 + 콘텐츠)
   */
  getProblemFull(problemId: string): Promise<ProblemFull | null>;

  /**
   * 여러 문제 메타데이터 로딩 (병렬)
   */
  getProblemsMetaBatch(problemIds: string[]): Promise<ProblemMeta[]>;
}

// ============================================================================
// 파일 시스템 구현
// ============================================================================

/**
 * 파일 시스템 기반 Problem Repository
 *
 * 데이터 소스: content/problems/ 폴더
 *
 * 폴더 구조:
 * ```
 * content/problems/
 *   math-calculus/
 *     2025/
 *       regular/
 *         30/
 *           meta.json          ← 메타데이터
 *           intent.mdx         ← 출제 의도
 *           strategy.mdx       ← 해결 전략
 *           clues/
 *             1.mdx
 *             2.mdx
 *           steps/
 *             1.mdx
 *             2.mdx
 *           mistakes/
 *             1.mdx
 * ```
 *
 * 캐싱 전략:
 * - React cache로 같은 요청 중복 방지
 * - 서버 컴포넌트 렌더링 중 한 번만 실행
 * - 예: 같은 페이지에서 getProblemMeta 3번 호출 → 실제론 1번만 실행
 */
export class FileSystemProblemRepository implements IProblemRepository {
  /** 콘텐츠 폴더 기본 경로 */
  private readonly basePath: string;

  /**
   * Constructor
   *
   * @param basePath - 콘텐츠 폴더 경로 (기본: process.cwd()/content/problems)
   *
   * 왜 주입?
   * - 테스트 시 다른 경로 사용 가능
   * - 환경별로 경로 변경 가능
   */
  constructor(basePath?: string) {
    this.basePath = basePath || joinPath(process.cwd(), "content/problems");
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /**
   * 문제 메타데이터 로딩
   *
   * @param problemId - 문제 ID (예: "2025-math-calculus-regular-30")
   * @returns ProblemMeta 또는 null (파일 없음/검증 실패)
   *
   * 플로우:
   * 1. Problem ID → 파일 경로 변환
   * 2. meta.json 읽기
   * 3. JSON 파싱
   * 4. Zod 검증
   * 5. ProblemMeta 반환
   *
   * 에러 처리:
   * - 파일 없음 → null 반환
   * - JSON 파싱 실패 → 로그 + null 반환
   * - Zod 검증 실패 → 로그 + null 반환
   *
   * 캐싱:
   * - React cache 적용
   * - 같은 problemId 요청 시 캐시된 결과 반환
   *
   * 예시:
   * ```typescript
   * const meta = await repo.getProblemMeta('2025-math-calculus-regular-30');
   *
   * if (meta) {
   *   console.log(meta.title);  // "30번 - 역함수와 교점 개수"
   * } else {
   *   console.error('문제를 찾을 수 없습니다');
   * }
   * ```
   */
  getProblemMeta = cache(async (problemId: string): Promise<ProblemMeta | null> => {
    try {
      // 1. 파일 경로 생성
      const problemPath = this.resolveProblemPath(problemId);
      const metaPath = joinPath(problemPath, "meta.json");

      // 2. 파일 읽기
      const result = await readFileIfExists(metaPath);

      if (result.status !== "success") {
        console.warn(`[Repository] meta.json 없음: ${problemId}`);
        return null;
      }

      // 3. JSON 파싱
      const json = JSON.parse(result.content);

      // 4. Zod 검증
      const meta = safeParseProblemMeta(json);

      if (!meta) {
        console.error(`[Repository] meta.json 검증 실패: ${problemId}`);
        return null;
      }

      return meta;
    } catch (error) {
      console.error(`[Repository] getProblemMeta 에러:`, error);
      return null;
    }
  });

  /**
   * 문제 전체 데이터 로딩 (메타 + 콘텐츠)
   *
   * @param problemId - 문제 ID
   * @returns ProblemFull 또는 null
   *
   * 플로우:
   * 1. 메타데이터 로딩 (getProblemMeta 재사용)
   * 2. intent.mdx, strategy.mdx 병렬 읽기
   * 3. 단서 MDX 파일들 병렬 읽기 (Promise.all)
   * 4. 풀이 단계 MDX 파일들 병렬 읽기
   * 5. 실수 MDX 파일들 병렬 읽기
   * 6. 모든 데이터 조합 → ProblemFull 반환
   *
   * 병렬 처리:
   * - Promise.all 사용
   * - 5개 파일 동시 읽기 → 속도 5배
   * - I/O 대기 시간 활용
   *
   * 캐싱:
   * - React cache 적용
   * - getProblemMeta도 캐시되므로 중복 호출 없음
   *
   * 예시:
   * ```typescript
   * const problem = await repo.getProblemFull('2025-math-calculus-regular-30');
   *
   * if (problem) {
   *   console.log(problem.meta.title);
   *   console.log(problem.clues[0].content);  // MDX 원본
   *   console.log(problem.steps[0].content);  // MDX 원본
   * }
   * ```
   */
  getProblemFull = cache(async (problemId: string): Promise<ProblemFull | null> => {
    try {
      // 1. 메타데이터 로딩 (이미 캐시됨)
      const meta = await this.getProblemMeta(problemId);

      if (!meta) {
        return null;
      }

      const problemPath = this.resolveProblemPath(problemId);

      // 2. 기본 MDX 파일 병렬 읽기
      const [intentResult, strategyResult] = await Promise.all([
        readFileIfExists(joinPath(problemPath, "intent.mdx")),
        readFileIfExists(joinPath(problemPath, "strategy.mdx")),
      ]);

      // 3. 단서 파일들 병렬 읽기
      const clueResults = await this.loadClueContents(problemPath, meta.clues);

      // 4. 풀이 단계 파일들 병렬 읽기
      const stepResults = await this.loadStepContents(problemPath, meta.steps);

      // 5. 실수 파일들 병렬 읽기
      const mistakeResults = await this.loadMistakeContents(
        problemPath,
        meta.commonMistakes
      );

      // 6. 최종 데이터 조합
      return {
        meta,
        intent: intentResult.status === "success" ? intentResult.content : "",
        strategy:
          strategyResult.status === "success" ? strategyResult.content : "",
        clues: clueResults,
        steps: stepResults,
        mistakes: mistakeResults,
      };
    } catch (error) {
      console.error(`[Repository] getProblemFull 에러:`, error);
      return null;
    }
  });

  /**
   * 여러 문제 메타데이터 배치 로딩
   *
   * @param problemIds - 문제 ID 배열
   * @returns 성공한 ProblemMeta 배열 (실패한 것 제외)
   *
   * 플로우:
   * 1. Promise.all로 모든 문제 병렬 로딩
   * 2. null 제외 (실패한 것)
   * 3. 성공한 것만 반환
   *
   * 병렬 처리:
   * - 10개 문제 동시 로딩
   * - 순차 처리보다 10배 빠름
   *
   * 예시:
   * ```typescript
   * const ids = ['2025-math-calculus-regular-30', '2025-math-calculus-regular-29'];
   * const metas = await repo.getProblemsMetaBatch(ids);
   *
   * console.log(metas.length);  // 2 (모두 성공)
   * ```
   */
  getProblemsMetaBatch = cache(
    async (problemIds: string[]): Promise<ProblemMeta[]> => {
      const results = await Promise.all(
        problemIds.map((id) => this.getProblemMeta(id))
      );

      // null 제외 (실패한 것)
      return results.filter((meta): meta is ProblemMeta => meta !== null);
    }
  );

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Problem ID → 파일 경로 변환
   *
   * @param problemId - 문제 ID (예: "2025-math-calculus-regular-30")
   * @returns 절대 경로 (예: "/Users/.../content/problems/math-calculus/2025/regular/30")
   *
   * 플로우:
   * 1. Problem ID 파싱 (parseProblemId)
   * 2. 경로 조합
   *
   * 예외:
   * - 잘못된 ID 형식 → throw Error
   */
  private resolveProblemPath(problemId: string): string {
    const parts = this.parseProblemId(problemId);

    // math-calculus/2025/regular/30
    const relativePath = [
      `${parts.subject}-${parts.subSubject || "common"}`,
      String(parts.year),
      parts.examType,
      String(parts.number),
    ].join("/");

    return joinPath(this.basePath, relativePath);
  }

  /**
   * Problem ID 파싱
   *
   * @param problemId - 문제 ID
   * @returns ProblemIdParts
   * @throws Error - 잘못된 형식
   *
   * 플로우:
   * 1. '-'로 split
   * 2. 각 부분 추출
   * 3. 검증
   *
   * 예시:
   * "2025-math-calculus-regular-30" →
   * { year: 2025, subject: "math", subSubject: "calculus", examType: "regular", number: 30 }
   */
  private parseProblemId(problemId: string): ProblemIdParts {
    const parts = problemId.split("-");

    if (parts.length < 5) {
      throw new Error(`[Repository] 잘못된 Problem ID 형식: ${problemId}`);
    }

    const [yearStr, subject, subSubject, examType, numberStr] = parts;

    return {
      year: parseInt(yearStr, 10),
      subject: subject as any,
      subSubject: subSubject as any,
      examType: examType as any,
      number: parseInt(numberStr, 10),
    };
  }

  /**
   * 단서 콘텐츠 로딩 (병렬)
   */
  private async loadClueContents(
    problemPath: string,
    clueDefinitions: ProblemMeta["clues"]
  ) {
    const cluePaths = clueDefinitions.map((def) =>
      joinPath(problemPath, def.content)
    );

    const results = await readFilesParallel(cluePaths);

    return clueDefinitions.map((def, index) => ({
      ...def,
      content: results[index]?.status === "success" ? results[index].content : "",
    }));
  }

  /**
   * 풀이 단계 콘텐츠 로딩 (병렬)
   */
  private async loadStepContents(
    problemPath: string,
    stepDefinitions: ProblemMeta["steps"]
  ) {
    const stepPaths = stepDefinitions.map((def) =>
      joinPath(problemPath, def.content)
    );

    const results = await readFilesParallel(stepPaths);

    return stepDefinitions.map((def, index) => ({
      ...def,
      content: results[index]?.status === "success" ? results[index].content : "",
    }));
  }

  /**
   * 실수 콘텐츠 로딩 (병렬)
   */
  private async loadMistakeContents(
    problemPath: string,
    mistakeDefinitions: ProblemMeta["commonMistakes"]
  ) {
    const mistakePaths = mistakeDefinitions.map((def) =>
      joinPath(problemPath, def.content)
    );

    const results = await readFilesParallel(mistakePaths);

    return mistakeDefinitions.map((def, index) => ({
      ...def,
      content: results[index]?.status === "success" ? results[index].content : "",
    }));
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

/**
 * 전역 Repository 인스턴스
 *
 * 역할:
 * - 앱 전체에서 하나의 인스턴스만 사용
 * - 캐시 공유
 *
 * 사용:
 * ```typescript
 * import { problemRepository } from '@/entities/problem';
 *
 * const meta = await problemRepository.getProblemMeta('...');
 * ```
 */
export const problemRepository = new FileSystemProblemRepository();
