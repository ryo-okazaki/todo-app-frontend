'use server';
import { cookies } from 'next/headers';

interface User {
  id: number;
  name: string;
  email: string;
}

export async function getCurrentUser() {
  try {
    // クッキーからトークンを取得
    const token = await cookies().get('authToken')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const apiBaseUrl = process.env.API_BASE_URL || 'http://express:3001';
    const response = await fetch(`${apiBaseUrl}/api/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // JWTトークンをAuthorizationヘッダーで送信
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { error: 'Failed to authenticate' };
    }

    const data = await response.json();
    console.log('next.js data:', data);
    return { user: data as User };
  } catch (error) {
    console.error('Get user error:', error);
    return { error: 'Failed to fetch user data' };
  }
}
