/* eslint-disable react/hook-use-state */
/* eslint-disable unicorn/no-null */
/* eslint-disable no-console */
import { extractVideoTrack } from '@experiments/mediastream-api';
import { RequesterDevices } from '@experiments/system-devices';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
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

type TSnackBar = {
  isOpen: boolean;
  message: string;
  autoHideDuration: number | null;
};

const requesterDevices = new RequesterDevices();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const storedState = JSON.parse(localStorage.getItem('state') ?? '{}') ?? {};
const initialState: TState = { ...defaultState, ...storedState } as TState;

const App = () => {
  const classes = useStyles();
  const [isInitialized, setInitialized] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceFromId] = useState<string>(initialState.videoDeviceId);
  const [snackbarState, setSnackbarState] = useState<TSnackBar>({
    isOpen: false,
    autoHideDuration: null,
    message: '',
  });

  const [constraints, setConstraints] = React.useState<MediaTrackConstraints>({});
  const [trackSettings, setTrackSettings] = React.useState<MediaTrackSettings>({});
  const [availableConstraintsVideoTrack, setAvailableConstraintsVideoTrack] = React.useState<
    null | object
  >(null);
  const [missingConstraints, setMissingConstraints] = useState<string[]>([]);

  useEffect(() => {
    if (!mediaStream) {
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
          if (typeof value !== 'string' && typeof key === 'string' && !value?.disabled) {
            if (value.type === STRING_OPTION_CONSTRAINT) {
              return [key, { ...value, values: [...trackCapabilities[key]] }];
            }

            if (value.type === NUMBER_CONSTRAINT && 'defaultObj' in value) {
              const minValue = trackCapabilities[key]?.min;
              const maxValue = trackCapabilities[key]?.max;
              const stepValue = trackCapabilities[key]?.step;

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
        .sort(([key, value]) => {
          if (typeof value !== 'string' && !value.disabled) {
            return -1;
          }

          return 1;
        }),
    );

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

  const onFailRequestMediaStream = (error) => {
    setSnackbarState((prevState) => {
      return {
        ...prevState,
        isOpen: true,
        message: `Wrong parameter: ${error.constraint}. Error: ${error.name},
        Constraints: ${JSON.stringify(error.constraints, null, 2)}`,
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
    if (mediaStream || !constraints.deviceId) {
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
    });
  }, [mediaStream, constraints]);

  const resetState = useCallback(() => {
    setConstraints({ deviceId: videoDeviceId });
  }, [videoDeviceId]);

  useEffect(() => {
    requesterDevices
      .request([])
      .then((devices) => {
        setVideoDeviceList(devices);
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
          <Grid item xs={6}>
            <Code
              classes={classes}
              heading="REQUESTED CONSTRAINTS"
              settings={{ audio: false, video: constraints }}
            />
          </Grid>

          <Grid item xs={6}>
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
