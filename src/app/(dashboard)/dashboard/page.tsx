import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
} from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import Link from 'next/link';
import { getCurrentUser } from '@/app/actions/user';

export default async function DashboardPage() {
  const { user } = await getCurrentUser();

  return (
    <Container maxWidth="xl">
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
        ダッシュボード
      </Typography>

      <Box sx={{ my: 3 }}>
        <Typography variant="h6" gutterBottom>
          ようこそ、<Box component="span" fontWeight="bold">{user?.name}</Box> さん！
        </Typography>
      </Box>

      <Container maxWidth="xl" disableGutters>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
            メニュー
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardActionArea component={Link} href="/todo" sx={{ height: '100%', p: 2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ChecklistIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" component="div" fontWeight="bold">
                      ToDoリスト
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      タスクの管理と確認
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Container>
  );
}
