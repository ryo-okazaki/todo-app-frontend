import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Next.js 15のフォント設定
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ToDoアプリ',
  description: 'JWT認証とToDoアプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
    <body className={inter.className}>{children}</body>
    </html>
  );
}
