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
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { loginAction } from '@/app/actions/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

      <Box component="form" onSubmit={handleSubmit} noValidate>
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
