import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const todoAppToken = cookieStore.get('authToken')?.value;
  const keycloakToken = cookieStore.get('keycloak_token')?.value;

  // 認証済みの場合はダッシュボードへ、未認証の場合はログインページへリダイレクト
  if (todoAppToken || keycloakToken) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
