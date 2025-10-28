'use client';

import { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import Link from 'next/link';

interface GuestLayoutProps {
  children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '98vh' }}>
      {/* ヘッダー */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <ChecklistIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            ToDoアプリ
          </Typography>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          py: 4,
          px: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 'sm' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
