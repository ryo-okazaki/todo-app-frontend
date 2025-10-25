
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { registerAction, type RegisterFieldErrors } from '@/app/actions/auth';

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });

  // フロントエンド側のリアルタイムバリデーション
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value) return '名前を入力してください';
        if (value.length > 50) return '名前は50文字以内で入力してください';
        return null;

      case 'email':
        if (!value) return 'メールアドレスを入力してください';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return '有効なメールアドレスを入力してください';
        return null;

      case 'password':
        if (!value) return 'パスワードを入力してください';
        if (value.length < 8) return 'パスワードは8文字以上で入力してください';
        if (!/[A-Za-z]/.test(value)) return 'パスワードには英字を含めてください';
        if (!/[0-9]/.test(value)) return 'パスワードには数字を含めてください';
        return null;

      case 'passwordConfirmation':
        if (!value) return 'パスワード（確認）を入力してください';
        if (value !== formData.password) return 'パスワードが一致しません';
        return null;

      default:
        return null;
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // フィールドのエラーをクリア
    if (fieldErrors[name as keyof RegisterFieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) {
      setError(null);
    }
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const validationError = validateField(name, value);

    if (validationError) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: [validationError],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    // フロントエンド側の全フィールドバリデーション
    const errors: RegisterFieldErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const validationError = validateField(key, value);
      if (validationError) {
        errors[key as keyof RegisterFieldErrors] = [validationError];
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('入力内容を確認してください');
      setIsLoading(false);
      return;
    }

    const formDataToSubmit = new FormData(e.currentTarget);

    try {
      const result = await registerAction(formDataToSubmit);

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setShowSuccessMessage(true);
        // 3秒後にログインページへリダイレクト
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 登録成功後のメッセージ表示
  if (showSuccessMessage) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom color="success.main">
            登録完了
          </Typography>

          <Alert severity="success" sx={{ mt: 3, mb: 3 }}>
            アカウントが作成されました！
          </Alert>

          <Typography variant="body1" sx={{ mb: 2 }}>
            ご登録いただいたメールアドレスに確認メールを送信しました。
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            メールに記載されたリンクをクリックして、アカウントを有効化してください。
          </Typography>

          <Button
            variant="contained"
            onClick={() => router.push('/login')}
            sx={{ mt: 3 }}
          >
            今すぐログインページへ
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          新規登録
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="名前"
            name="name"
            type="text"
            required
            margin="normal"
            placeholder="山田 太郎"
            value={formData.name}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name?.[0]}
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="メールアドレス"
            name="email"
            type="email"
            required
            margin="normal"
            placeholder="your-email@example.com"
            value={formData.email}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email?.[0]}
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="パスワード"
            name="password"
            type="password"
            required
            margin="normal"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password?.[0] || '8文字以上、英字と数字を含む'}
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="パスワード（確認）"
            name="passwordConfirmation"
            type="password"
            required
            margin="normal"
            placeholder="••••••••"
            value={formData.passwordConfirmation}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={!!fieldErrors.passwordConfirmation}
            helperText={fieldErrors.passwordConfirmation?.[0]}
            disabled={isLoading}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 3 }}
          >
            {isLoading ? '登録中...' : '登録する'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              すでにアカウントをお持ちですか？{' '}
              <Button
                variant="text"
                onClick={() => router.push('/login')}
                disabled={isLoading}
                sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
              >
                ログイン
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
