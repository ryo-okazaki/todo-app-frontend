import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  fullWidth?: boolean;
}

export default function Button({
  children,
  loading = false,
  variant = 'contained',
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <MuiButton
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </MuiButton>
  );
}
