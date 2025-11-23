'use server';
import { cookies } from "next/headers";


export interface Todo {
  id: number;
  title: string;
  description?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ToDo: 要リファクタ
async function getTokenFromCookies() {
  const cookieStore = await cookies();
  const todoAppToken = cookieStore.get('authToken' as any)?.value;
  const keycloakToken = cookieStore.get('keycloak_token' as any)?.value;

  return todoAppToken || keycloakToken;
}

// サーバーコンポーネントからの呼び出し用
export async function fetchTodosServer(): Promise<Todo[]> {
  try {
    const token = await getTokenFromCookies();

    const response = await fetch('http://todo-express:3000/api/todo', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

// クライアントコンポーネントからの呼び出し用
export async function fetchTodos(): Promise<Todo[]> {
  try {
    const token = await getTokenFromCookies();

    const response = await fetch('http://todo-express:3000/api/todo', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

export async function fetchTodo(id: number): Promise<Todo> {
  try {
    const token = await getTokenFromCookies();

    const response = await fetch(`http://todo-express:3000/api/todo/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch todo');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching todo ${id}:`, error);
    throw error;
  }
}

export async function createTodo(title: string, description?: string): Promise<Todo> {
  try {
    const token = await getTokenFromCookies();

    const response = await fetch('http://todo-express:3000/api/todo', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      throw new Error('Failed to create todo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
}

export async function updateTodo(
  id: number,
  formData: FormData
): Promise<Todo> {
  try {
    const token = await getTokenFromCookies();

    const response = await fetch(`http://todo-express:3000/api/todo/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to update todo');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating todo ${id}:`, error);
    throw error;
  }
}
