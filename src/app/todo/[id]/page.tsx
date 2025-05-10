'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchTodo, updateTodo, Todo } from '../../actions/todo';

interface PageProps {
  params: {
    id: string;
  };
}

export default function TodoDetailPage({ params }: PageProps) {
  const unwrappedParams = use(params as any);
  const todoId = unwrappedParams?.id;
  const [todo, setTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadTodo = async () => {
      try {
        const todoData = await fetchTodo(todoId);
        setTodo(todoData);
        setTitle(todoData.title);
        setDescription(todoData.description || '');
        setIsLoading(false);
      } catch (err) {
        setError('ToDoの読み込みに失敗しました');
        setIsLoading(false);
      }
    };

    if (todoId) {
      loadTodo();
    }
  }, [todoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      // 選択されたファイルを追加
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const updatedTodo = await updateTodo(todoId, formData);
      setTodo(updatedTodo);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError('ToDoの更新に失敗しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleCancelEdit = () => {
    // 編集をキャンセルしたら、元の値に戻す
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
    }
    setSelectedFiles([]);
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-pulse">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !todo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
            <Link
              href="/todo"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
            >
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditing ? 'ToDo 編集' : 'ToDo 詳細'}
            </h1>
            <div className="flex space-x-3">
              <Link
                href="/todo"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
              >
                一覧に戻る
              </Link>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                >
                  編集する
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                  画像
                </label>
                <input
                  type="file"
                  id="images"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">選択済み: {selectedFiles.map(f => f.name).join(', ')}</p>
                  </div>
                )}
              </div>

              {todo?.images && todo.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">既存の画像</h3>
                  <div className="flex gap-4">
                    {todo.images.map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden bg-gray-100">
                        <img src={image.url} alt={`画像 ${index + 1}`} className="p-[5] h-auto object-cover" width={150} height={150} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? '保存中...' : '保存する'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500">タイトル</h2>
                <p className="mt-1 text-lg">{todo?.title}</p>
              </div>

              {todo?.description && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500">説明</h2>
                  <p className="mt-1 whitespace-pre-line">{todo.description}</p>
                </div>
              )}

              {todo?.images && todo.images.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500">画像</h2>
                  <div className="flex mt-1">
                    {todo.images.map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        <img src={image.url} alt={`画像 ${index + 1}`} className="p-[5] h-auto object-cover" width={200} height={200} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {todo?.createdAt && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    作成日時: {new Date(todo.createdAt).toLocaleString('ja-JP')}
                  </p>
                  {todo.updatedAt && (
                    <p className="text-sm text-gray-500">
                      更新日時: {new Date(todo.updatedAt).toLocaleString('ja-JP')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
