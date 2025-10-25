import { redirect } from 'next/navigation';
import { getCurrentUser } from '../actions/user';
import AppLayout from '@/components/layouts/app-layout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect('/login');
  }

  return <AppLayout user={user}>{children}</AppLayout>;
}
