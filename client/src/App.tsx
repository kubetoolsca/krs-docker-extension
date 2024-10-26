import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import logo from './assets/krs-logo.png';
import './assets/App.css';
import {
  Stack,
  Box,
  Grid,
  TextField,
  LinearProgress,
  Typography,
  useTheme,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Link,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { createDockerDesktopClient } from '@docker/extension-api-client';
import {
  initKRS,
  krsScan,
  krsRecommend,
  krsNamespaces,
  krsExit,
  krsHealth,
  krsPods,
  krsExport,
  getK8sContexts,
  setK8sContext,
} from './helper/krs-helpers';

import KRSButton from './components/KRSButton';

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | undefined>();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [kubeConfig, setKubeConfig] = useState<string>('~/.kube/config');
  const [kubeOption, setKubeOption] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [contextConfigPath, setContextConfigPath] = useState<string>('');
  const [currentContext, setCurrentContext] = useState<string>('Kubernetes Context');
  const [showKubeContextTextField, setShowKubeContextTextField] =
    useState<boolean>(false);
  const [showGuideline, setShowGuideline] = useState<boolean>(true);

  const [contexts, setContexts] = useState<string[]>([]);

  const ddClient = useDockerDesktopClient();
  const theme = useTheme();

  // Handle the change of kubernetes configuration file
  const handledRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKubeOption(e.target.value);
    if (e.target.value) {
      setKubeConfig('~/.kube/config');
    }
  };

  // Handle selection of kube configuration (default - other)
  const handledOtherConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKubeConfig(e.target.value);
  };

  // Menu state setup
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Dialog state setup
  const handleClickOpen = (value: string) => {
    setOpenDialog(true);
    setCurrentContext(value);
  };

  const handleCloseDialog = () => {
    setK8sContext(ddClient, currentContext);
    setOpenDialog(false);    
  };

  const handleOtherClick = () => {
    setShowKubeContextTextField(true);
  };

  const handleOtherContextConfigPath = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setContextConfigPath(e.target.value);
  };

  useEffect(() => {
    const fetchContexts = async () => {
      try {
        const result = await getK8sContexts(ddClient);
        setContexts(result);
      } catch (error: any) {
        console.error(error.message);
      }
    };

    fetchContexts();
  }, [ddClient]);

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
            backgroundImage: theme.palette.mode === 'light' ? 'white' : 'black',
          }}
        >
          <Grid item>
            <LinearProgress />
            <Typography
              mt={2}
              color={
                theme.palette.mode === 'light' ? 'common.black' : 'common.white'
              }
            >
              Waiting for KRS Extension to process. It may take some seconds
            </Typography>
          </Grid>
        </Grid>
      )}
      {!isLoading && (
        <Box
          sx={{
            backgroundImage: theme.palette.mode === 'light' ? 'white' : 'black',
            minHeight: '100vh',
            width: '100%',
            color: 'white',
            px: 2,
            py: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Grid
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              paddingLeft: '20px',
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              New to KRS? Check out the{' '}
              <Link
                href="#"
                onClick={() =>
                  ddClient.host.openExternal(
                    'https://github.com/kubetoolsca/krs/blob/main/README.md',
                  )
                }
              >
                KRS
              </Link>{' '}
              Guide!
            </Typography>
          </Grid>

          <Stack sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <img src={logo} alt="krs-logo" className="krs-logo" />
            <Typography variant="h1" sx={{ fontWeight: 'bold' }}>
              KRS
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              A GenAI-powered Kubetools Recommender System for Kubernetes
              clusters.
            </Typography>
          </Stack>

          <Grid
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              paddingRight: '20px',
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Join our{' '}
                <Link
                  href="#"
                  onClick={() =>
                    ddClient.host.openExternal(
                      'https://www.launchpass.com/kubetoolsio',
                    )
                  }
                >
                  Slack
                </Link>{' '}
              </Typography>
              <Typography variant="body2">
                Feel free to report any{' '}
                <Link
                  href="#"
                  onClick={() =>
                    ddClient.host.openExternal(
                      'https://github.com/kubetoolsca/krs-docker-extension/issues',
                    )
                  }
                >
                  issues
                </Link>{' '}
              </Typography>
              <Typography variant="body2">Version: 0.0.2</Typography>
            </Box>
          </Grid>
          {showGuideline === true ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Typography variant="h3" sx={{ mb: 2 }}>
                  Ensure Kubernetes Configuration is Ready
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Please confirm that your Kubernetes setup is ready before
                  starting the KRS extension. This extension requires access to
                  the <code>~/.kube/config</code> file to connect to your
                  cluster. Follow these steps if you are using Docker Desktop
                  with Kubernetes:
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h4" sx={{ mb: 2 }}>
                  Settings --&gt; Kubernetes --&gt; Select Enable Kubernetes
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowGuideline(false)}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0000FF',
                    },
                  }}
                >
                  Proceed to KRS Extension
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={2}>
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
                          const result = await initKRS(
                            ddClient,
                            kubeConfig,
                            contextConfigPath,
                          );
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

                    {/* krs export button */}
                    <KRSButton
                      label="Export"
                      onClick={async () => {
                        const result = await krsExport(ddClient);
                        setResponse(
                          typeof result === 'string'
                            ? result
                            : JSON.stringify(result, null, 2),
                        ); // Safeguard response as string
                        setShowTerminal(false);
                      }}
                      disabled={!isInitialized}
                    />

                    {/* krs exit button */}
                    <KRSButton
                      label="Exit"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          await krsExit(ddClient);
                          setResponse('Krs services closed safely.');
                          setIsInitialized(false);
                          setShowTerminal(false);
                          setIsLoading(false);
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
                  <>
                    <Grid item xs={12} lg={10} sx={{ width: '100%', mt: 3 }}>
                      <Grid container>
                        <Grid item xs={12} lg={10}>
                          <Grid container>
                            <Grid item xs={7} lg={9}>
                              <FormControl>
                                <FormLabel id="demo-row-radio-buttons-group-label">
                                  Your Kubernetes Config Path
                                </FormLabel>
                                <RadioGroup
                                  row
                                  aria-labelledby="demo-row-radio-buttons-group-label"
                                  name="row-radio-buttons-group"
                                  onChange={handledRadioChange}
                                >
                                  <FormControlLabel
                                    sx={{
                                      color:
                                        theme.palette.mode === 'light'
                                          ? 'black'
                                          : 'white',
                                    }}
                                    value="default"
                                    control={
                                      <Radio
                                        sx={{
                                          color:
                                            theme.palette.mode === 'light'
                                              ? 'black'
                                              : 'white',
                                        }}
                                      />
                                    }
                                    label="Default"
                                  />
                                  <FormControlLabel
                                    value="other"
                                    control={<Radio sx={{ color: 'white' }} />}
                                    sx={{
                                      color:
                                        theme.palette.mode === 'light'
                                          ? 'black'
                                          : 'white',
                                    }}
                                    label="Other"
                                  />
                                  {kubeOption === 'other' && (
                                    <TextField
                                      value={kubeConfig}
                                      onChange={handledOtherConfigChange}
                                      placeholder="Enter config path"
                                      sx={{
                                        ml: 2,
                                      }} // Add margin-left and set text color to black
                                      InputProps={{
                                        style: {
                                          color:
                                            theme.palette.mode === 'light'
                                              ? '#000000'
                                              : '#ffffff',
                                        }, // Set input text color to black
                                      }}
                                    />
                                  )}
                                </RadioGroup>
                              </FormControl>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={5}
                              md={3}
                              lg={3}
                              sx={{ mt: 3 }}
                            >
                              <Button
                                id="fade-button"
                                aria-controls={open ? 'fade-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleClick}
                                endIcon={<KeyboardArrowDownIcon />}
                                sx={{
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#0000FF',
                                  },
                                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)', // Soft shadow
                                  borderRadiusL: '8px',
                                }}
                              >
                                {currentContext}
                              </Button>
                              <Menu
                                id="fade-menu"
                                MenuListProps={{
                                  'aria-labelledby': 'fade-button',
                                }}
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                TransitionComponent={Fade}
                              >
                                {contexts.map((context) => (
                                  <>
                                    <MenuItem
                                      key={context}
                                      onClick={() => handleClickOpen(context)}
                                    >
                                      {context}
                                    </MenuItem>
                                  </>
                                ))}
                                {/* <MenuItem
                                  onClick={() => handleClickOpen('Minikube')}
                                >
                                  Minikube
                                </MenuItem>
                                <MenuItem
                                  onClick={() => handleClickOpen('AWS')}
                                >
                                  AWS EKS
                                </MenuItem> */}
                              </Menu>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} lg={11}>
                          <TextField
                            sx={{
                              flexGrow: 1,
                              width: '100%',
                              height: '100%',
                              mt: 2,
                              '& .MuiOutlinedInput-root': {
                                fontFamily: 'monospace',
                                // Conditional background and text colors based on the theme mode
                                backgroundColor:
                                  theme.palette.mode === 'light'
                                    ? '#ffffff'
                                    : '#000000', // White for light mode, black for dark
                                color:
                                  theme.palette.mode === 'light'
                                    ? '#000000'
                                    : '#ffffff', // Black text for light mode, white text for dark
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
                      </Grid>
                    </Grid>
                    <Dialog
                      open={openDialog}
                      onClose={handleCloseDialog}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        {'Your Kubernetes Context Configuration folder Path?'}
                      </DialogTitle>
                      <DialogContent>
                        {currentContext == 'minikube' ? (
                          <>
                            <DialogContentText id="alert-dialog-description">
                              As a default, your Minikube configuration will be
                              stored in <code>~/.minikube</code> if you are
                              using <strong>Mac</strong>. If you are using other
                              platforms. Please hit "Other" to specify the path.
                            </DialogContentText>
                          </>
                        ) : (
                          <></>
                          // <>
                          //   <DialogContentText id="alert-dialog-description">
                          //     As a default, your AWS configuration will be
                          //     stored in <code>~/.aws</code> if you are using{' '}
                          //     <strong>Mac</strong>. If you are using other
                          //     platforms. Please hit "Other" to specify the path.
                          //   </DialogContentText>
                          // </>
                        )}

                        {showKubeContextTextField && (
                          <>
                            <TextField
                              autoFocus
                              required
                              margin="dense"
                              value={contextConfigPath}
                              onChange={handleOtherContextConfigPath}
                              label="Your context configuration file path"
                              type="text"
                              fullWidth
                              variant="standard"
                            />
                          </>
                        )}
                      </DialogContent>
                      <DialogActions>
                        {showKubeContextTextField ? (
                          <>
                            <Button onClick={handleCloseDialog}>Confirm</Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={handleOtherClick}>Other</Button>
                          </>
                        )}
                        <Button onClick={handleCloseDialog} autoFocus>
                          Default
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                ) : (
                  <Box
                    display="flex"
                    flex={1}
                    width="100%"
                    sx={{ mt: 6, ml: 3, minHeight: '100vh' }}
                  >
                    <iframe
                      src="http://localhost:57681/"
                      width="100%"
                      height="100%"
                      title="Interactive Terminal for KRS health"
                    />
                  </Box>
                )}
              </Grid>
            </>
          )}
        </Box>
      )}
    </>
  );
}
