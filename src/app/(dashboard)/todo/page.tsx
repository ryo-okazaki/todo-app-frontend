import Link from 'next/link';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { fetchTodosServer, Todo } from '@/app/actions/todo';

export const dynamic = 'force-dynamic';

export default async function TodosPage() {
  let todos: Todo[] = [];
  let error: string | null = null;

  try {
    const fetchedTodos = await fetchTodosServer();
    if (Array.isArray(fetchedTodos)) {
      todos = fetchedTodos;
    } else {
      console.error('Fetched todos is not an array:', fetchedTodos);
      error = 'ToDoデータの形式が不正です。';
    }
  } catch (err) {
    console.error('Error fetching todos:', err);
    error = 'ToDoの読み込み中にエラーが発生しました。';
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            ToDo一覧
          </Typography>
          <Button
            component={Link}
            href="/todo/new"
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
          >
            新規作成
          </Button>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : todos.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'grey.50',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ToDoがありません
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              新しいToDoを追加してください
            </Typography>
            <Button
              component={Link}
              href="/todo/new"
              variant="contained"
              startIcon={<AddIcon />}
            >
              最初のToDoを作成
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {todos.map((todo: Todo) => (
              <Grid size={{ xs: 12 }} key={todo.id}>
                <Card
                  elevation={1}
                  sx={{
                    transition: 'all 0.3s',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardActionArea component={Link} href={`/todo/${todo.id}`}>
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        {/* 画像エリア */}
                        {todo.images && Array.isArray(todo.images) && todo.images.length > 0 && (
                          <Box sx={{ flexShrink: 0 }}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {todo.images.slice(0, 3).map((image: any, idx: number) => (
                                <CardMedia
                                  key={idx}
                                  component="img"
                                  image={image.url}
                                  alt={`イメージ ${idx + 1}`}
                                  sx={{
                                    width: 150,
                                    height: 150,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                  }}
                                />
                              ))}
                              {todo.images.length > 3 && (
                                <Box
                                  sx={{
                                    width: 150,
                                    height: 150,
                                    bgcolor: 'grey.200',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                  }}
                                >
                                  <ImageIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    +{todo.images.length - 3} 枚
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}

                        {/* テキストエリア */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'text.primary',
                              fontWeight: 'bold',
                            }}
                          >
                            {todo.title}
                          </Typography>

                          {todo.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {todo.description}
                            </Typography>
                          )}

                          {todo.images && todo.images.length > 0 && (
                            <Chip
                              icon={<ImageIcon />}
                              label={`${todo.images.length} 枚の画像`}
                              size="small"
                              sx={{ mt: 2 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}
