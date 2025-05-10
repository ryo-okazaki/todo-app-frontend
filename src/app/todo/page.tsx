// app/todos/page.tsx
import Link from 'next/link';
import { fetchTodosServer, Todo } from '../actions/todo';

export const dynamic = 'force-dynamic'; // 常に最新データを取得

export default async function TodosPage() {
  let todos: Todo[] = [];
  let error: string | null = null;

  try {
    const fetchedTodos = await fetchTodosServer();
    // APIからの戻り値が配列であることを確認
    if (Array.isArray(fetchedTodos)) {
      todos = fetchedTodos;
    } else {
      console.error('Fetched todos is not an array:', fetchedTodos);
      error = 'ToDoデータの形式が不正です。';
    }
  } catch (err) {
    console.error('Error fetching todos:', err);
    error = 'ToDoの読み込み中にエラーが発生しました。';
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-800">ToDo一覧</h1>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors tracking-wide"
              >
                ダッシュボード
              </Link>
              <Link
                href="/todo/new"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors tracking-wide"
              >
                新規作成
              </Link>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">ToDoがありません。新しいToDoを追加してください。</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {todos.map((todo: Todo) => (
                <li key={todo.id} className="py-4">
                  <div className="p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/todo/${todo.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {todo.title}
                      </Link>
                    </div>
                    {todo.description && (
                      <p className="mt-1 text-gray-600 line-clamp-2">{todo.description}</p>
                    )}
                    {todo.images && Array.isArray(todo.images) && todo.images.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                        {todo.images.slice(0, 3).map((image, idx) => (
                          <img
                            key={idx}
                            src={image.url}
                            alt={`イメージ ${idx+1}`}
                            width={150}
                            height={150}
                            className="object-cover rounded-md p-[5]"
                          />
                        ))}
                        {todo.images.length > 3 && (
                          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-xs">
                            +{todo.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

}
