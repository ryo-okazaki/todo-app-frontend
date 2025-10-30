'use server';
import { cookies } from 'next/headers';

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export async function getCurrentUser() {
  try {
    // クッキーからトークンを取得
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken' as any)?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

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
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken' as any)?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }
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
