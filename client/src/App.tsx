import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import logo from './assets/IMG_5496.jpg';
import {
  Stack,
  Box,
  Grid,
  TextField,
  LinearProgress,
  Typography,
  useTheme,
} from '@mui/material';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import {
  initKRS,
  krsScan,
  krsRecommend,
  krsNamespaces,
  krsExit,
  krsHealth,
  krsPods,
} from './helper/krs-helpers';

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | undefined>();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const ddClient = useDockerDesktopClient();
  const theme = useTheme();
  interface KRSButtonProps {
    children?: React.ReactNode;
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
  }

  // Reusable Button Component
  const KRSButton = ({ label, onClick, disabled = false }: KRSButtonProps) => {
    return (
      <Button
        variant="contained"
        sx={{
          minWidth: '150px',
          maxWidth: '180px',
          background: '#f5f5f5',
          color: 'black',
          '&:hover': {
            backgroundColor: '#e0e0e0',
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

  return (
    <>
      {isLoading && (
        <Grid
          container
          flex={1}
          direction="column"
          padding="16px 32px"
          height="100vh"
          justifyContent="center"
          alignItems="center"
          sx={{
            flexGrow: 1,
            backgroundImage: 'linear-gradient(180deg, #1a237e 5%, #0d0d0d 95%)',
          }}
        >
          <Grid item>
            <LinearProgress />
            <Typography mt={2} color="common.white">
              Waiting for Krs-Extension to be ready. It may take some seconds if
              it's the first time.
            </Typography>
          </Grid>
        </Grid>
      )}
      {!isLoading && (
        <Box
          sx={{
            backgroundImage: 'linear-gradient(180deg, #1a237e 5%, #0d0d0d 95%)',
            minHeight: '100vh',
            width: '100%',
            color: 'white',
            px: 2,
            py: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <img
              src={logo}
              alt="krs-logo"
              style={{
                width: '80px', // Adjust the size of the logo as needed
                height: '80px',
                marginRight: '8px', // Space between the logo and text
                borderRadius: '50%',
              }}
            />
            <Typography
              variant="h3"
              color="common.white"
              sx={{ fontWeight: 'bold' }}
            >
              Krs - Chat with the Kubernetes Cluster
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }} color="common.white">
            A GenAI-powered Kubetools Recommender System for Kubernetes
            clusters.
          </Typography>

          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid item>
              <Stack
                alignItems="start"
                spacing={2}
                sx={{
                  mt: 4,
                  display: 'flex',
                  justifyContent: 'center', // Distribute space between buttons evenly
                  gap: 2, // Space between buttons
                  flexWrap: 'wrap', // Enable flex wrap
                }}
                direction={{ sm: 'row', lg: 'column' }}
              >
                {/* krs init button */}
                <KRSButton
                  label="Initialize"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      const result = await initKRS(ddClient);
                      setResponse(
                        typeof result === 'string'
                          ? result
                          : JSON.stringify(result, null, 2),
                      ); // Safeguard response as string
                    } catch (error: any) {
                      setResponse(error.message || 'An error occurred');
                    }
                    setIsInitialized(true);
                    setIsLoading(false);
                  }}
                />

                {/* krs scan button */}

                <KRSButton
                  label="Scan"
                  onClick={async () => {
                    const result = await krsScan(ddClient);
                    setResponse(
                      typeof result === 'string'
                        ? result
                        : JSON.stringify(result, null, 2),
                    ); // Safeguard response as string
                    setShowTerminal(false);
                  }}
                  disabled={!isInitialized}
                />

                {/* krs recommend button */}
                <KRSButton
                  label="Recommend"
                  onClick={async () => {
                    const result = await krsRecommend(ddClient);
                    setResponse(
                      typeof result === 'string'
                        ? result
                        : JSON.stringify(result, null, 2),
                    ); // Safeguard response as string
                    setShowTerminal(false);
                  }}
                  disabled={!isInitialized}
                />

                {/* krs namespaces button */}
                <KRSButton
                  label="Namespaces"
                  onClick={async () => {
                    const result = await krsNamespaces(ddClient);
                    setResponse(
                      typeof result === 'string'
                        ? result
                        : JSON.stringify(result, null, 2),
                    ); // Safeguard response as string
                    setShowTerminal(false);
                  }}
                  disabled={!isInitialized}
                />

                {/* krs pods button */}
                <KRSButton
                  label="Pods"
                  onClick={async () => {
                    const result = await krsPods(ddClient);
                    setResponse(
                      typeof result === 'string'
                        ? result
                        : JSON.stringify(result, null, 2),
                    ); // Safeguard response as string
                    setShowTerminal(false);
                  }}
                  disabled={!isInitialized}
                />

                {/* krs health button */}
                <KRSButton
                  label="Health"
                  onClick={async () => {
                    try {
                      await krsHealth(ddClient);
                      setShowTerminal(true); // Show terminal when krsHealth is called
                    } catch (error: any) {
                      setResponse(error.message || 'An error occurred');
                    }
                  }}
                  disabled={!isInitialized}
                />

                {/* krs exit button */}
                <KRSButton
                  label="Exit"
                  onClick={async () => {
                    try {
                      await krsExit(ddClient);
                      setResponse('Krs services closed safely.');
                      setIsInitialized(false);
                      setShowTerminal(false);
                    } catch (error: any) {
                      setResponse(error.message || 'An error occurred');
                    }
                  }}
                  disabled={!isInitialized}
                />
              </Stack>
            </Grid>

            {/* Conditionally render TextField or Terminal */}
            {!showTerminal ? (
              <Grid item xs={12} lg={10}>
                <TextField
                  sx={{
                    flexGrow: 1,
                    width: '100%',
                    height: '100%',
                    mt: 4,
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      // Conditional background and text colors based on the theme mode
                      backgroundColor:
                        theme.palette.mode === 'light' ? '#ffffff' : '#000000', // White for light mode, black for dark
                      color:
                        theme.palette.mode === 'light' ? '#000000' : '#ffffff', // Black text for light mode, white text for dark
                    },
                  }}
                  InputProps={{
                    readOnly: true, // Makes the TextField read-only, no need to use 'disabled'
                  }}
                  multiline
                  variant="outlined"
                  minRows={5}
                  value={
                    typeof response === 'string'
                      ? response
                      : JSON.stringify(response, null, 2)
                  }
                />
              </Grid>
            ) : (
              <Box display="flex" flex={1} width="100%" sx={{ mt: 6, ml: 3 }}>
                <iframe
                  src="http://localhost:57681/"
                  width="100%"
                  height="100%"
                />
              </Box>
            )}
          </Grid>
        </Box>
      )}
    </>
  );
}
