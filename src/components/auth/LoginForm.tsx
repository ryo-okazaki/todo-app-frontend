'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { loginAction } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex justify-center "
    >
      {pending ? 'ログイン中...' : 'ログイン'}
    </button>
  );
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  // クライアント側でのフォーム送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    try {
      // FormData オブジェクトを作成
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      // Server Action を呼び出し
      const result = await loginAction(formData);

      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.success) {
        // ログイン成功後にダッシュボードにリダイレクト
        router.push('/dashboard');
        router.refresh(); // ナビゲーションやユーザー情報を更新
      }
    } catch (err) {
      setFormError('予期せぬエラーが発生しました');
      console.error('Form submission error:', err);
    }
  };

  return (
    <div className="w-1/4 space-y-8 p-10 bg-black rounded-xl shadow-md mx-auto">
      <div>
        <h1 className="text-center text-3xl font-extrabold text-gray-900">ログイン</h1>
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded" role="alert">
          {formError}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <div className="pt-[10]">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="pt-[10]">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-center pt-[10]">
          <SubmitButton />
        </div>

        <div className="flex justify-between w-full pt-[20]">
          <div className="text-sm">
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              アカウント登録はこちら
            </Link>
          </div>
          <div className="text-sm">
            <Link href="/forgot_password" className="font-medium text-indigo-600 hover:text-indigo-500">
              パスワードを忘れた方
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
