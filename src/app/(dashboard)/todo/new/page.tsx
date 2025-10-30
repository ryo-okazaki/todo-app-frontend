'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { createTodo } from "@/app/actions/todo";

export default function NewTodoPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createTodo(title, description);
      router.push('/todo');
      router.refresh();
    } catch (err) {
      setError('ToDoの作成に失敗しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            ToDo 新規作成
          </Typography>
          <Button
            component={Link}
            href="/todo"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
          >
            一覧に戻る
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            required
            id="title"
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ToDoのタイトルを入力"
            sx={{ mb: 3 }}
            error={!title.trim() && error !== null}
            helperText={!title.trim() && error !== null ? 'タイトルは必須です' : ''}
          />

          <TextField
            fullWidth
            id="description"
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ToDoの説明を入力（任意）"
            multiline
            rows={4}
            sx={{ mb: 4 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              component={Link}
              href="/todo"
              variant="outlined"
              color="inherit"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={<SaveIcon />}
            >
              {isSubmitting ? '作成中...' : '作成する'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
