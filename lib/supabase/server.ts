import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 🎯 [핵심 패턴] 서버 컴포넌트용 Supabase 클라이언트 생성
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll 호출은 서버 컴포넌트에서 무시됨
            // 미들웨어에서 처리됨
          }
        },
      },
    }
  )
}
