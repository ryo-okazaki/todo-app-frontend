// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/dashboard'];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ログインページへのアクセスで、すでに認証されている場合はダッシュボードへリダイレクト
  if (pathname === '/login') {
    const token = request.cookies.get('authToken')?.value;

    if (token) {
      try {
        // トークンの検証
        await jwtVerify(token, JWT_SECRET, {
          algorithms: ['HS256'],
        });

        // 認証済みの場合はダッシュボードへリダイレクト
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // トークンが無効な場合は何もしない（ログインページのままにする）
      }
    }
  }

  // 保護されたルートへのアクセスで、認証されていない場合はログインページへリダイレクト
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // トークンの検証
      await jwtVerify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch {
      // トークンが無効な場合はログインページへリダイレクト
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパス
export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};
