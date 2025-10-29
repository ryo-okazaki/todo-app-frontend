"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  InputAdornment,
  IconButton,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { resetPassword, ResetPasswordFieldErrors } from "@/app/actions/auth";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("トークンが無効です。パスワードリセットのリンクをもう一度確認してください。");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("トークンが無効です");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("password", password);
      formData.append("passwordConfirmation", passwordConfirmation);

      const result = await resetPassword(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setError(result.error || "パスワードリセットに失敗しました");
      } else {
        setSuccess(true);
        // 3秒後にログイン画面へリダイレクト
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
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
            パスワード変更完了
          </Typography>

          <Alert severity="success" sx={{ mt: 3, mb: 3, textAlign: "left" }}>
            パスワードが正常に変更されました。
          </Alert>

          <Typography variant="body1" sx={{ mb: 2 }}>
            新しいパスワードでログインできます。
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            3秒後に自動的にログイン画面へ移動します...
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Button
            component={Link}
            href="/login"
            variant="contained"
            fullWidth
            startIcon={<ArrowBackIcon />}
          >
            ログイン画面へ移動
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
            新しいパスワードを設定
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            新しいパスワードを入力してください。
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
            label="新しいパスワード"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            margin="normal"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors({ ...fieldErrors, password: undefined });
              }
              if (error) setError(null);
            }}
            disabled={isLoading || !token}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password?.[0] || "8文字以上、英字と数字を含む"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="パスワードの表示切替"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={isLoading || !token}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="新しいパスワード（確認用）"
            name="passwordConfirmation"
            type={showPasswordConfirmation ? "text" : "password"}
            autoComplete="new-password"
            required
            margin="normal"
            value={passwordConfirmation}
            onChange={(e) => {
              setPasswordConfirmation(e.target.value);
              if (fieldErrors.passwordConfirmation) {
                setFieldErrors({ ...fieldErrors, passwordConfirmation: undefined });
              }
              if (error) setError(null);
            }}
            disabled={isLoading || !token}
            error={!!fieldErrors.passwordConfirmation}
            helperText={fieldErrors.passwordConfirmation?.[0] || "確認のため、もう一度入力してください"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="確認用パスワードの表示切替"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    edge="end"
                    disabled={isLoading || !token}
                  >
                    {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || !password || !passwordConfirmation || !token}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <LockResetIcon />
              )
            }
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? "変更中..." : "パスワードを変更する"}
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
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
