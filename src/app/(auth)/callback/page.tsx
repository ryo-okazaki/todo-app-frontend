'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { getKeycloakInstance } from '@/lib/keycloak';
import { syncKeycloakUserAction } from "@/app/actions/auth";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const keycloak = getKeycloakInstance();
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
        });

        if (!authenticated || !keycloak.token) {
          router.push('/login');
          return;
        }

        const result = await syncKeycloakUserAction(keycloak.token)

        if (!result.success) {
          setError(result.error || '認証に失敗しました');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        // ダッシュボードへリダイレクト
        router.push('/dashboard');

      } catch (error) {
        console.error('Callback handling failed:', error);
        setError(error instanceof Error ? error.message : '認証処理中にエラーが発生しました');

        // 3秒後にログインページへ
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        px: 2,
      }}
    >
      {error ? (
        <>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            ログインページにリダイレクトしています...
          </Typography>
        </>
      ) : (
        <>
          <CircularProgress size={60} />
          <Typography variant="h6">認証処理中...</Typography>
          <Typography variant="body2" color="text.secondary">
            少々お待ちください
          </Typography>
        </>
      )}
    </Box>
  );
}
