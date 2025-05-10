// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../actions/user';
import Link from 'next/link';

export default async function DashboardPage() {
  const { user, error } = await getCurrentUser();

  if (error) {
    return redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-all hover:shadow-2xl">
          <h1 className="text-3xl font-bold mb-6 text-indigo-800 border-b pb-4">ダッシュボード</h1>

          <div className="mb-8">
            <p className="mb-2 text-lg">ようこそ、<span className="font-semibold text-indigo-700">{user.name}</span> さん！</p>
            <p className="text-gray-600">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/todo" className="block p-6 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md text-white text-center transition-all hover:shadow-lg transform hover:-translate-y-1">
              <span className="text-xl font-semibold">ToDo一覧を表示</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
