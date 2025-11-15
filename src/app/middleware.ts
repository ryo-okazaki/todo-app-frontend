import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/dashboard', '/profile', '/todo'];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

/**
 * 軽量な認証チェック
 * 詳細な検証はバックエンドAPIで行う
 */
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  // ToDoアプリ専用トークン
  const todoAppToken = request.cookies.get('authToken')?.value;
  if (todoAppToken) {
    try {
      // 署名と有効期限のみチェック(軽量)
      await jwtVerify(todoAppToken, JWT_SECRET, {
        algorithms: ['HS256'],
      });
      return true;
    } catch {
      // トークンが無効
    }
  }

  // Keycloakトークン
  const keycloakToken = request.cookies.get('keycloak_token')?.value;
  return !!keycloakToken;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ログインページへのアクセス
  if (pathname === '/login') {
    if (await isAuthenticated(request)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 保護されたルートへのアクセス
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!(await isAuthenticated(request))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパス
export const config = {
  matcher: ['/login', '/dashboard/:path*', '/profile/:path*', '/todo/:path*'],
};
