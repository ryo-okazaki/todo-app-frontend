'use server';
import { cookies } from 'next/headers';

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

// ToDo: 要リファクタ
async function getTokenFromCookies() {
  const cookieStore = await cookies();
  const todoAppToken = cookieStore.get('authToken' as any)?.value;
  const keycloakToken = cookieStore.get('keycloak_token' as any)?.value;

  return todoAppToken || keycloakToken;
}

export async function getCurrentUser() {
  try {
    // クッキーからトークンを取得
    const token = await getTokenFromCookies();

    const apiBaseUrl = process.env.API_BASE_URL || 'http://todo-express:3000';
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

export async function updateUser(formData: FormData): Promise<User> {
  try {
    const token = await getTokenFromCookies();
    console.log('formData:', formData)

    const apiBaseUrl = process.env.API_BASE_URL || 'http://todo-express:3000';
    const response = await fetch(`${apiBaseUrl}/api/user`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return await response.json();
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
}
