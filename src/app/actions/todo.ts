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

// サーバーコンポーネントからの呼び出し用
export async function fetchTodosServer(): Promise<Todo[]> {
  try {
    const response = await fetch('http://express:3000/api/todo', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${(await cookies()).get('authToken')?.value}`
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
    const response = await fetch('http://express:3000/api/todo', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${(await cookies()).get('authToken')?.value}`
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
    const response = await fetch(`http://express:3000/api/todo/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${(await cookies()).get('authToken')?.value}`
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

export async function createTodo(title: string): Promise<Todo> {
  try {
    const response = await fetch('http://express:3000/api/todo', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await cookies()).get('authToken')?.value}`
      },
      body: JSON.stringify({ title })
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
    const response = await fetch(`http://express:3000/api/todo/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${(await cookies()).get('authToken')?.value}`
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
