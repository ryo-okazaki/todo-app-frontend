"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string): string | null => {
    if (!email) return "メールアドレスを入力してください";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "有効なメールアドレスを入力してください";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // フロントエンドバリデーション
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const result = await requestPasswordReset(email);

      if (!result.success) {
        throw new Error(result.message);
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 成功画面
  if (success) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 500,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <LockResetIcon
            sx={{ fontSize: 64, color: "success.main", mb: 2 }}
          />

          <Typography variant="h4" component="h1" gutterBottom color="success.main">
            送信完了
          </Typography>

          <Alert severity="success" sx={{ mt: 3, mb: 3, textAlign: "left" }}>
            パスワード初期化のリンクを記載したメールを送信しました。
          </Alert>

          <Typography variant="body1" sx={{ mb: 2 }}>
            ご登録いただいたメールアドレス宛にパスワードリセット用のリンクを送信しました。
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            メールをご確認いただき、リンクをクリックしてパスワードを再設定してください。
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Button
            component={Link}
            href="/login"
            variant="contained"
            fullWidth
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            ログイン画面へ戻る
          </Button>
        </Paper>
      </Box>
    );
  }

  // パスワードリセットフォーム画面
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 500,
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <LockResetIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            パスワードの初期化
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            登録されているメールアドレスを入力してください。
            <br />
            パスワードリセット用のリンクをお送りします。
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
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
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            placeholder="your-email@example.com"
            error={!!error}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || !email}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <LockResetIcon />
              )
            }
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? "送信中..." : "送信する"}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              component={Link}
              href="/login"
              variant="text"
              fullWidth
              disabled={isLoading}
              startIcon={<ArrowBackIcon />}
            >
              ログイン画面へ戻る
            </Button>

            <Button
              component={Link}
              href="/register"
              variant="text"
              fullWidth
              disabled={isLoading}
            >
              アカウント登録はこちら
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
