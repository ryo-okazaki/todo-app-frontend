'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import GoogleIcon from '@mui/icons-material/Google';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { loginAction } from '@/app/actions/auth';
import { loginWithKeycloak, loginWithGoogle } from '@/lib/keycloak';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 既存のToDoアプリ認証
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const result = await loginAction(formData);

      if (result.error) {
        setFormError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setFormError('予期せぬエラーが発生しました');
      console.error('Form submission error:', err);
      setIsLoading(false);
    }
  };

  // Keycloak認証(マイクロサービスID)
  const handleKeycloakLogin = async () => {
    setIsLoading(true);
    setFormError(null);
    try {
      await loginWithKeycloak();
    } catch (error) {
      setFormError('マイクロサービスIDでのログインに失敗しました');
      setIsLoading(false);
    }
  };

  // Google連携
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setFormError(null);
    try {
      await loginWithGoogle();
    } catch (error) {
      setFormError('Googleでのログインに失敗しました');
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        width: '100%',
        borderRadius: 2,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          ログイン
        </Typography>
      </Box>

      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}

      {/* SSO認証オプション */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<AccountCircleIcon />}
          onClick={handleKeycloakLogin}
          disabled={isLoading}
          sx={{ py: 1.5, textTransform: 'none' }}
        >
          マイクロサービスIDでログイン
        </Button>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={isLoading}
          sx={{
            py: 1.5,
            textTransform: 'none',
            borderColor: '#4285f4',
            color: '#4285f4',
            '&:hover': {
              borderColor: '#357ae8',
              bgcolor: 'rgba(66, 133, 244, 0.04)',
            },
          }}
        >
          Googleでログイン
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          または
        </Typography>
      </Divider>

      {/* 既存のToDoアプリ専用ログイン */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          ToDoアプリ専用アカウント
        </Typography>

        <TextField
          fullWidth
          label="メールアドレス"
          name="email"
          type="email"
          autoComplete="email"
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="your-email@example.com"
        />

        <TextField
          fullWidth
          label="パスワード"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          placeholder="••••••••"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </Button>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            component={Link}
            href="/register"
            variant="text"
            fullWidth
            disabled={isLoading}
          >
            アカウント登録はこちら
          </Button>

          <Button
            component={Link}
            href="/forgot_password"
            variant="text"
            fullWidth
            disabled={isLoading}
          >
            パスワードを忘れた方
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
