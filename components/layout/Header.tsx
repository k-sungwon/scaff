import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import Image from "next/image";
// 🎯 [핵심 패턴] 서버 컴포넌트 - 기본값
export function Header() {
  return (
    <header className="bg-white border-b border-paper-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 - 나비 */}
          <Link href={ROUTES.home} className="flex items-center gap-2">
            {/* 나비 아이콘 - 옆모습 */}
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/scaff_logo.png"
                alt="Scaff logo"
                width={28}
                height={28}
                priority
              />
            </div>
            <span className="text-xl font-bold text-gray-800">Scaff</span>
          </Link>

          {/* 중앙 네비게이션 */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href={ROUTES.home}
              className="text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors"
            >
              문제 보기
            </Link>
            <Link
              href={ROUTES.problems}
              className="text-sm font-medium text-gray-600er hover:text-gray-800 transition-colors"
            >
              내 학습
            </Link>
          </nav>

          {/* 우측: 검색 + 로그인 */}
          <div className="flex items-center gap-4">
            {/* 검색 아이콘 (MVP에서는 disabled) */}
            <button
              disabled
              className="p-2 text-gray-600er hover:text-gray-800 transition-colors"
              aria-label="검색"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* 로그인 버튼 */}
            <Link
              href={ROUTES.login}
              className="text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors"
            >
              로그인
            </Link>

            {/* 회원가입 버튼 */}
            <Link
              href={ROUTES.signup}
              className="px-4 py-2 bg-gray-800 text-yellow-500 text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
            >
              시작하기
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
