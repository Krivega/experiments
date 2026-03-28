/* eslint-disable react/hook-use-state */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable unicorn/no-null */
/* eslint-disable no-console */
import { extractVideoTrack } from '@experiments/mediastream-api';
import { RequesterDevices } from '@experiments/system-devices';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React, { useCallback, useEffect, useState } from 'react';

import { NUMBER_CONSTRAINT, STRING_OPTION_CONSTRAINT } from './constants';
import { videoConstraints } from './constraints';
import AppBarTop from './containers/AppBarTop';
import Code from './containers/Code';
import Heading from './containers/Heading';
import PageLoader from './containers/PageLoader';
import SettingsDrawer from './containers/SettingsDrawer';
import Snackbar from './containers/Snackbar';
import UserMedia from './containers/UserMedia';
import defaultState from './defaultState';
import requestMediaStream from './requestMediaStream';
import useStyles from './useStyles';

import type { TState } from './defaultState';
import type { TVideoConstraints } from './typings';

type TSnackBar = {
  isOpen: boolean;
  message: string;
  autoHideDuration: number | null;
};

const requesterDevices = new RequesterDevices();

const parseStoredState = (): Partial<TState> => {
  const raw = localStorage.getItem('state');

  if (raw === null) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return typeof parsed === 'object' && parsed !== null ? (parsed as Partial<TState>) : {};
  } catch {
    return {};
  }
};

const initialState: TState = { ...defaultState, ...parseStoredState() };

const readStringOptionValues = (caps: MediaTrackCapabilities, key: string): string[] => {
  const raw: unknown = caps[key as keyof MediaTrackCapabilities];

  if (Array.isArray(raw)) {
    return raw.map(String);
  }

  return [];
};

const readNumericCapabilityRange = (
  caps: MediaTrackCapabilities,
  key: string,
): { min?: number; max?: number; step?: number } => {
  const raw: unknown = caps[key as keyof MediaTrackCapabilities];

  if (typeof raw === 'object' && raw !== null && 'min' in raw) {
    const range = raw as { min?: number; max?: number; step?: number };

    return { min: range.min, max: range.max, step: range.step };
  }

  return {};
};

const hasDeviceIdForRequest = (c: MediaTrackConstraints): boolean => {
  const { deviceId } = c;

  if (deviceId === undefined) {
    return false;
  }

  if (typeof deviceId === 'string') {
    return deviceId.length > 0;
  }

  return true;
};

const App = () => {
  const classes = useStyles();
  const [isInitialized, setInitialized] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceFromId] = useState(initialState.videoDeviceId);
  const [snackbarState, setSnackbarState] = useState<TSnackBar>({
    isOpen: false,
    autoHideDuration: null,
    message: '',
  });

  const [constraints, setConstraints] = React.useState<MediaTrackConstraints>({});
  const [trackSettings, setTrackSettings] = React.useState<MediaTrackSettings>({});
  const [availableConstraintsVideoTrack, setAvailableConstraintsVideoTrack] =
    React.useState<TVideoConstraints | null>(null);
  const [missingConstraints, setMissingConstraints] = useState<string[]>([]);

  useEffect(() => {
    if (mediaStream === null) {
      return;
    }

    const videoTrack = extractVideoTrack(mediaStream);

    console.log('🚀 ~ file: App.tsx:58 ~ useEffect ~ videoTrack', videoTrack);

    const trackCapabilities = videoTrack.getCapabilities();

    console.log('🚀 ~ file: App.tsx:60 ~ useEffect ~ trackCapabilities', trackCapabilities);

    const irrelevantCapabilities = new Set(['deviceId', 'groupId']);
    const missingConstraintsFromCapabilities = Object.entries(trackCapabilities)
      .filter(([key]) => {
        return !(key in videoConstraints) && !irrelevantCapabilities.has(key);
      })
      .map(([key]) => {
        return key;
      });

    setMissingConstraints(missingConstraintsFromCapabilities);

    const availableVideoConstraints = Object.fromEntries(
      Object.entries(videoConstraints)
        .map(([key, value]) => {
          if (key in trackCapabilities) {
            return [key, { ...value, disabled: false }];
          }

          return [key, { ...value, disabled: true }];
        })
        .map(([key, value]) => {
          const isDisabled =
            typeof value === 'object' && 'disabled' in value && Boolean(value.disabled);

          if (typeof value !== 'string' && typeof key === 'string' && !isDisabled) {
            if (value.type === STRING_OPTION_CONSTRAINT) {
              return [key, { ...value, values: readStringOptionValues(trackCapabilities, key) }];
            }

            if (value.type === NUMBER_CONSTRAINT && 'defaultObj' in value) {
              const {
                min: minValue,
                max: maxValue,
                step: stepValue,
              } = readNumericCapabilityRange(trackCapabilities, key);

              return [
                key,
                {
                  ...value,
                  default: minValue,
                  defaultObj: {
                    ...value.defaultObj,
                    min: minValue,
                    max: maxValue,
                    step: stepValue,
                  },
                },
              ];
            }
          }

          return [key, value];
        })
        .sort(([_key, value]) => {
          if (
            typeof value !== 'string' &&
            typeof value === 'object' &&
            'disabled' in value &&
            !value.disabled
          ) {
            return -1;
          }

          return 1;
        }),
    ) as TVideoConstraints;

    setAvailableConstraintsVideoTrack(availableVideoConstraints);
  }, [mediaStream]);

  const onSuccessRequestMediaStream = () => {
    setSnackbarState((prevState) => {
      return {
        ...prevState,
        isOpen: true,
        autoHideDuration: 1000,
        message: 'Success!',
      };
    });
  };

  const onFailRequestMediaStream = (error: Error) => {
    const maybeOce = error as Error & {
      constraint?: string;
      constraints?: MediaTrackConstraints;
    };

    const constraintLabel =
      typeof maybeOce.constraint === 'string' ? maybeOce.constraint : '(unknown)';
    const constraintsJson =
      maybeOce.constraints === undefined ? '' : JSON.stringify(maybeOce.constraints, undefined, 2);

    setSnackbarState((prevState) => {
      return {
        ...prevState,
        isOpen: true,
        message: `Wrong parameter: ${constraintLabel}. Error: ${error.name},
        Constraints: ${constraintsJson}`,
      };
    });
  };

  useEffect(() => {
    const state = {
      videoDeviceId,
    };

    localStorage.setItem('state', JSON.stringify(state));
  }, [videoDeviceId]);

  const updateConstraints = useCallback((additionalConstraints: MediaTrackConstraints) => {
    setConstraints((prevState) => {
      return { ...prevState, ...additionalConstraints };
    });
  }, []);

  useEffect(() => {
    updateConstraints({ deviceId: videoDeviceId });
  }, [updateConstraints, videoDeviceId]);

  useEffect(() => {
    if (mediaStream !== null || !hasDeviceIdForRequest(constraints)) {
      return;
    }

    requestMediaStream({
      mediaStream,
      setMediaStream,
      setIsLoading,
      setTrackSettings,
      constraints,
      onFail: onFailRequestMediaStream,
    })
      .catch((error: unknown) => {
        console.error('🚀 ~ file: App.tsx:186 ~ useEffect ~ error', error);
      })
      .finally(() => {
        setInitialized(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constraints]);

  const requestStream = useCallback(() => {
    requestMediaStream({
      mediaStream,
      setMediaStream,
      setIsLoading,
      setTrackSettings,
      constraints,
      onSuccess: onSuccessRequestMediaStream,
      onFail: onFailRequestMediaStream,
    }).catch((error: unknown) => {
      console.error('🚀 ~ file: App.tsx ~ requestStream ~ error', error);
    });
  }, [mediaStream, constraints]);

  const resetState = useCallback(() => {
    setConstraints({ deviceId: videoDeviceId });
  }, [videoDeviceId]);

  useEffect(() => {
    requesterDevices
      .request([])
      .then((devices) => {
        setVideoDeviceList(
          devices.filter((device) => {
            return device.kind === 'videoinput';
          }),
        );
      })
      .catch((error: unknown) => {
        console.error('🚀 ~ file: App.tsx:207 ~ useEffect ~ error', error);
      });
  }, []);

  useEffect(() => {
    if (videoDeviceList.length > 0 && !videoDeviceId) {
      setVideoDeviceFromId(videoDeviceList[0].deviceId);
    }
  }, [videoDeviceList, videoDeviceId]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <CssBaseline />

        <AppBarTop classes={classes} requestStream={requestStream} resetState={resetState} />

        <UserMedia classes={classes} mediaStream={mediaStream} />

        <Snackbar
          autoHideDuration={snackbarState.autoHideDuration}
          handleClose={() => {
            setSnackbarState((prevState) => {
              return { ...prevState, isOpen: false };
            });
          }}
          message={snackbarState.message}
          open={snackbarState.isOpen}
        />

        <Grid container className={classes.codes} spacing={2}>
          <Grid size={6}>
            <Code
              classes={classes}
              heading="REQUESTED CONSTRAINTS"
              settings={{ audio: false, video: constraints }}
            />
          </Grid>

          <Grid size={6}>
            <Code
              classes={classes}
              heading="TRACK SETTINGS"
              settings={{ audio: false, video: trackSettings }}
            />
          </Grid>
        </Grid>

        {missingConstraints.length > 0 && (
          <div>
            <Heading>MISSING CONSTRAINTS</Heading>

            <List>
              {missingConstraints.map((constraint) => {
                return <ListItem key={constraint}>{constraint}</ListItem>;
              })}
            </List>
          </div>
        )}

        <PageLoader classes={classes} isLoading={isLoading} />
      </Box>

      {isInitialized ? (
        <Drawer open anchor="right" className={classes.drawerRoot} variant="permanent">
          <SettingsDrawer
            classes={classes}
            constraints={constraints}
            setVideoDeviceFromId={setVideoDeviceFromId}
            trackSettings={trackSettings}
            updateConstraints={updateConstraints}
            videoConstraintsList={availableConstraintsVideoTrack}
            videoDeviceId={videoDeviceId}
            videoDeviceList={videoDeviceList}
          />
        </Drawer>
      ) : null}
    </Box>
  );
};
export default App;
