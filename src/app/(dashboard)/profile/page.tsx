'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Avatar,
  CircularProgress,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { getCurrentUser, updateUser } from '@/app/actions/user';

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user: userData, error: userError } = await getCurrentUser();
        if (userError || !userData) {
          setError('ユーザー情報の読み込みに失敗しました');
          setIsLoading(false);
          return;
        }
        setUser(userData);
        setName(userData.name);
        setIsLoading(false);
      } catch (err) {
        setError('ユーザー情報の読み込みに失敗しました');
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // プレビュー用のURLを生成
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('name', name);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const updatedUser = await updateUser(formData);
      setUser(updatedUser);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditing(false);
      setSuccessMessage('プロフィールを更新しました');
      router.refresh();
    } catch (err) {
      setError('プロフィールの更新に失敗しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  const getAvatarContent = () => {
    if (previewUrl) {
      return previewUrl;
    }
    if (user?.avatar_url) {
      return user.avatar_url;
    }
    return undefined;
  };

  const getAvatarInitial = () => {
    return user?.name?.charAt(0).toUpperCase() || '?';
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            読み込み中...
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (error && !user) {
    return (
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            プロフィール
          </Typography>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="contained"
              startIcon={<EditIcon />}
            >
              編集する
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {isEditing ? (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* アバター編集 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={getAvatarContent()}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {!getAvatarContent() && getAvatarInitial()}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                  component="label"
                >
                  <PhotoCameraIcon />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    hidden
                  />
                </IconButton>
              </Box>
              {selectedFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  選択済み: {selectedFile.name}
                </Typography>
              )}
            </Box>

            {/* 名前編集 */}
            <TextField
              fullWidth
              required
              id="name"
              label="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 3 }}
              error={!name.trim() && error !== null}
              helperText={!name.trim() && error !== null ? '名前は必須です' : ''}
            />

            {/* メールアドレス（読み取り専用） */}
            <TextField
              fullWidth
              id="email"
              label="メールアドレス"
              value={user?.email || ''}
              disabled
              sx={{ mb: 4 }}
              helperText="メールアドレスは変更できません"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={handleCancelEdit}
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={<SaveIcon />}
              >
                {isSubmitting ? '保存中...' : '保存する'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            {/* アバター表示 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Avatar
                src={user?.avatar_url}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {!user?.avatar_url && getAvatarInitial()}
              </Avatar>
            </Box>

            {/* 名前表示 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                名前
              </Typography>
              <Typography variant="h6">
                {user?.name}
              </Typography>
            </Box>

            {/* メールアドレス表示 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                メールアドレス
              </Typography>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
