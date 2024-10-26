import React from 'react';
import { Button } from '@mui/material';

interface KRSButtonProps {
  children?: React.ReactNode;
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const KRSButton = ({ label, onClick, disabled = false }: KRSButtonProps) => {
  return (
    <Button
      variant="contained"
      sx={{
        minWidth: '150px',
        maxWidth: '180px',
        color: 'white',
        '&:hover': {
          backgroundColor: '#0000FF',
        },
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)', // Soft shadow
        borderRadiusL: '8px',
      }}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

export default KRSButton;
