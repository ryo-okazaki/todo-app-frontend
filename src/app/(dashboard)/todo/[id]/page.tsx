'use client';

import { useState, useEffect, useRef, use } from 'react';
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
  CircularProgress,
  Grid,
  Card,
  CardMedia,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageIcon from '@mui/icons-material/Image';
import { fetchTodo, updateTodo, Todo } from "@/app/actions/todo";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TodoDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const todoId = parseInt(id, 10);
  const [todo, setTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadTodo = async () => {
      try {
        const todoData = await fetchTodo(todoId);
        setTodo(todoData);
        setTitle(todoData.title);
        setDescription(todoData.description || '');
        setIsLoading(false);
      } catch (err) {
        setError('ToDoの読み込みに失敗しました');
        setIsLoading(false);
      }
    };

    if (todoId) {
      loadTodo();
    }
  }, [todoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const updatedTodo = await updateTodo(todoId, formData);
      setTodo(updatedTodo);
      setSelectedFiles([]);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError('ToDoの更新に失敗しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleCancelEdit = () => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
    }
    setSelectedFiles([]);
    setIsEditing(false);
    setError(null);
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

  if (error && !todo) {
    return (
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            component={Link}
            href="/todo"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
          >
            一覧に戻る
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            {isEditing ? 'ToDo 編集' : 'ToDo 詳細'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={Link}
              href="/todo"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
            >
              一覧に戻る
            </Button>
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
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isEditing ? (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              required
              id="title"
              label="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                画像
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
              >
                画像を選択
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  hidden
                />
              </Button>
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    選択済み: {selectedFiles.map(f => f.name).join(', ')}
                  </Typography>
                </Box>
              )}
            </Box>

            {todo?.images && Array.isArray(todo.images) && todo.images.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  既存の画像
                </Typography>
                <Grid container spacing={2}>
                  {todo.images.map((image: any, index: number) => (
                    <Grid key={index}>
                      <Card elevation={1}>
                        <CardMedia
                          component="img"
                          image={image.url}
                          alt={`画像 ${index + 1}`}
                          sx={{
                            width: 150,
                            height: 150,
                            objectFit: 'cover',
                          }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

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
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                タイトル
              </Typography>
              <Typography variant="h6">
                {todo?.title}
              </Typography>
            </Box>

            {todo?.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  説明
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {todo.description}
                </Typography>
              </Box>
            )}

            {todo?.images && Array.isArray(todo.images) && todo.images.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  画像
                </Typography>
                <Grid container spacing={2}>
                  {todo.images.map((image: any, index: number) => (
                    <Grid key={index}>
                      <Card elevation={2}>
                        <CardMedia
                          component="img"
                          image={image.url}
                          alt={`画像 ${index + 1}`}
                          sx={{
                            width: 200,
                            height: 200,
                            objectFit: 'cover',
                          }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {todo?.createdAt && (
              <Box sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  作成日時: {new Date(todo.createdAt).toLocaleString('ja-JP')}
                </Typography>
                {todo.updatedAt && (
                  <Typography variant="body2" color="text.secondary">
                    更新日時: {new Date(todo.updatedAt).toLocaleString('ja-JP')}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
