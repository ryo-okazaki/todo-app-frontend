'use server';

import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'メールアドレスとパスワードを入力してください' };
  }

  try {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://todo-express:3000';
    const response = await fetch(`${apiBaseUrl}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || 'ログインに失敗しました' };
    }

    const data = await response.json();

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'authToken',
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1日
      path: '/'
    });

    return { success: true, user: data.user };
  } catch (err) {
    console.error('Login error:', err);
    return { error: '認証サービスに接続できませんでした。後でやり直してください。' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('authToken');
  return { success: true };
}
