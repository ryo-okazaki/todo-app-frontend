
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import LoginIcon from "@mui/icons-material/Login";
import { verifyAccount } from "@/app/actions/auth";

export default function VerifyAccount() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("認証トークンが見つかりません。URLを確認してください。");
        setIsLoading(false);
        return;
      }

      try {
        const result = await verifyAccount(token);

        if (!result.success) {
          setError(result.message || "アカウント認証に失敗しました");
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

    verify();
  }, [searchParams, router]);

  // 読み込み中
  if (isLoading) {
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
          <CircularProgress size={64} sx={{ mb: 3 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            アカウントを認証中...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            しばらくお待ちください
          </Typography>
        </Paper>
      </Box>
    );
  }

  // エラー画面
  if (error) {
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
          <ErrorIcon
            sx={{ fontSize: 64, color: "error.main", mb: 2 }}
          />

          <Typography variant="h4" component="h1" gutterBottom color="error.main">
            認証に失敗しました
          </Typography>

          <Alert severity="error" sx={{ mt: 3, mb: 3, textAlign: "left" }}>
            {error}
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            トークンが無効または期限切れの可能性があります。
            <br />
            再度登録を行うか、サポートにお問い合わせください。
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              component={Link}
              href="/login"
              variant="contained"
              fullWidth
              startIcon={<LoginIcon />}
            >
              ログイン画面へ
            </Button>

            <Button
              component={Link}
              href="/register"
              variant="outlined"
              fullWidth
            >
              新規登録
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

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
          <CheckCircleIcon
            sx={{ fontSize: 64, color: "success.main", mb: 2 }}
          />

          <Typography variant="h4" component="h1" gutterBottom color="success.main">
            認証完了
          </Typography>

          <Alert severity="success" sx={{ mt: 3, mb: 3, textAlign: "left" }}>
            アカウントの認証が完了しました。
          </Alert>

          <Typography variant="body1" sx={{ mb: 2 }}>
            ご登録ありがとうございます。
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
            startIcon={<LoginIcon />}
          >
            ログイン画面へ移動
          </Button>
        </Paper>
      </Box>
    );
  }

  return null;
}
