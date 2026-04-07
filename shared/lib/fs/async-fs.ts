/**
 * @file shared/lib/fs/async-fs.ts
 * @description 비동기 파일 시스템 유틸리티
 *
 * 플로우:
 * 1. fs/promises를 래핑
 * 2. 에러 처리 추가 (파일 없음 vs 실제 에러)
 * 3. 병렬 읽기 지원
 *
 * 역할:
 * - 파일 읽기 (존재 여부 체크 포함)
 * - 여러 파일 병렬 읽기
 * - 에러 핸들링
 *
 * 패턴: Wrapper Pattern
 * - 저수준 API(fs)를 감싸서 사용하기 쉽게 만듦
 * - 에러 처리를 일관되게 적용
 *
 * 함수형 vs 객체지향:
 * - 순수 함수로 작성 (상태 없음)
 * - 입력 → 출력만 있음 (Side Effect 최소화)
 */

import { readFile, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// ============================================================================
// 타입 정의
// ============================================================================

/**
 * 파일 읽기 결과
 * - success: 파일을 성공적으로 읽음
 * - not_found: 파일이 존재하지 않음
 * - error: 읽기 실패 (권한 없음 등)
 */
export type FileReadResult =
  | { status: "success"; content: string }
  | { status: "not_found"; path: string }
  | { status: "error"; error: Error };

// ============================================================================
// 단일 파일 읽기
// ============================================================================

/**
 * 파일 읽기 (존재 여부 체크 포함)
 *
 * @param filePath - 읽을 파일 경로 (절대 경로 권장)
 * @returns FileReadResult (성공/실패/없음 구분)
 *
 * 플로우:
 * 1. fs.readFile 시도
 * 2. 성공 → content 반환
 * 3. ENOENT 에러 → not_found 반환
 * 4. 기타 에러 → error 반환
 *
 * 예시:
 * ```typescript
 * const result = await readFileIfExists('/path/to/file.md');
 *
 * if (result.status === 'success') {
 *   console.log(result.content);
 * } else if (result.status === 'not_found') {
 *   console.warn('파일 없음:', result.path);
 * } else {
 *   console.error('읽기 실패:', result.error);
 * }
 * ```
 *
 * 왜 Result 패턴?
 * - null 반환보다 명확 (왜 실패했는지 알 수 있음)
 * - 타입스크립트 타입 체크 활용
 */
export async function readFileIfExists(
  filePath: string
): Promise<FileReadResult> {
  try {
    const content = await readFile(filePath, "utf-8");

    return {
      status: "success",
      content,
    };
  } catch (error) {
    // 파일이 존재하지 않는 경우
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        status: "not_found",
        path: filePath,
      };
    }

    // 기타 에러 (권한 없음, 읽기 실패 등)
    return {
      status: "error",
      error: error as Error,
    };
  }
}

// ============================================================================
// 여러 파일 병렬 읽기
// ============================================================================

/**
 * 여러 파일을 병렬로 읽기
 *
 * @param filePaths - 읽을 파일 경로 배열
 * @returns 각 파일의 읽기 결과 배열 (순서 유지)
 *
 * 플로우:
 * 1. Promise.all로 모든 파일 동시 읽기
 * 2. 각 파일의 결과를 배열로 반환
 * 3. 실패한 파일도 포함 (일부 실패해도 전체 실패 안 함)
 *
 * 예시:
 * ```typescript
 * const paths = ['clues/1.mdx', 'clues/2.mdx', 'clues/3.mdx'];
 * const results = await readFilesParallel(paths);
 *
 * // 성공한 파일만 필터링
 * const contents = results
 *   .filter(r => r.status === 'success')
 *   .map(r => r.status === 'success' ? r.content : '');
 * ```
 *
 * 왜 Promise.all?
 * - 순차 읽기보다 3배 빠름 (3개 파일 × 100ms = 100ms vs 300ms)
 * - I/O 대기 시간 활용
 */
export async function readFilesParallel(
  filePaths: string[]
): Promise<FileReadResult[]> {
  // Promise.all: 모든 Promise가 병렬로 실행됨
  return Promise.all(filePaths.map((path) => readFileIfExists(path)));
}

// ============================================================================
// 디렉토리 관련
// ============================================================================

/**
 * 디렉토리 내 파일 목록 조회
 *
 * @param dirPath - 디렉토리 경로
 * @returns 파일명 배열 (빈 배열 = 디렉토리 없음)
 *
 * 플로우:
 * 1. fs.readdir 시도
 * 2. 성공 → 파일명 배열 반환
 * 3. ENOENT → 빈 배열 (디렉토리 없음)
 * 4. 기타 에러 → 재발생 (상위에서 처리)
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await readdir(dirPath);
    return files;
  } catch (error) {
    // 디렉토리가 존재하지 않는 경우 빈 배열 반환
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    // 기타 에러는 재발생
    throw error;
  }
}

/**
 * 경로가 디렉토리인지 확인 (동기)
 *
 * @param dirPath - 확인할 경로
 * @returns true = 디렉토리, false = 파일 또는 없음
 *
 * 왜 동기?
 * - 간단한 체크는 동기가 더 편함
 * - 성능 영향 미미
 */
export function isDirectory(dirPath: string): boolean {
  try {
    return existsSync(dirPath) && require("fs").statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

// ============================================================================
// 경로 유틸리티
// ============================================================================

/**
 * 안전한 경로 결합
 *
 * @param base - 기본 경로
 * @param segments - 추가 경로 조각들
 * @returns 정규화된 절대 경로
 *
 * 예시:
 * ```typescript
 * const problemPath = joinPath(
 *   process.cwd(),
 *   'content/problems',
 *   'math-calculus/2025/regular/30'
 * );
 * // → /Users/one/Projects/scaff/content/problems/math-calculus/2025/regular/30
 * ```
 *
 * 왜 필요?
 * - path.join이 상대 경로를 만들 수 있음
 * - path.resolve로 항상 절대 경로 보장
 */
export function joinPath(base: string, ...segments: string[]): string {
  return path.resolve(base, ...segments);
}
