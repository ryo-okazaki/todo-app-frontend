'use client';

import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from './header';
import Sidebar from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
  };
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '98vh', bgcolor: 'grey.50' }}>
      <Header onMenuClick={handleSidebarToggle} user={user} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
