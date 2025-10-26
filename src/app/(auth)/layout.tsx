import GuestLayout from '@/components/layouts/guest-layout';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestLayout>{children}</GuestLayout>;
}
