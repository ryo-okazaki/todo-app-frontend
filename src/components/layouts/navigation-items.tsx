
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChecklistIcon from '@mui/icons-material/Checklist';

export interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

export const navigationItems: NavigationItem[] = [
  {
    title: 'ダッシュボード',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'ToDoリスト',
    path: '/todo',
    icon: <ChecklistIcon />,
  },
];
