import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  // 認証済みの場合はダッシュボードへ、未認証の場合はログインページへリダイレクト
  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
