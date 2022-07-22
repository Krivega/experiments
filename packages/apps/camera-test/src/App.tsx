import React, { useEffect, useState, useCallback } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import requestDevices from '@experiments/system-devices/src/requestDevices';
import getVideoTracks from '@experiments/mediastream-api/src/getVideoTracks';
import AppBarTop from './containers/AppBarTop';
import UserMedia from './containers/UserMedia';
import PageLoader from './containers/PageLoader';
import Code from './containers/Code';
import SettingsDrawer from './containers/SettingsDrawer';
import Snackbar from './containers/Snackbar';
import Heading from './containers/Heading';
import { videoConstraints } from './constraints';
import requestMediaStream from './requestMediaStream';
import defaultState from './defaultState';
import useStyles from './useStyles';
import { STRING_OPTION_CONSTRAINT, NUMBER_CONSTRAINT } from './constants';

type TSnackBar = {
  isOpen: boolean;
  message: string;
  autoHideDuration: number | null;
};

// @ts-ignore
const storedState = JSON.parse(localStorage.getItem('state')) || {};
const initialState = { ...defaultState, ...storedState };

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
  const [availableConstraintsVideoTrack, setAvailableConstraintsVideoTrack] =
    React.useState<null | Object>(null);
  const [missingConstraints, setMissingConstraints] = useState<string[]>([]);

  useEffect(() => {
    if (!mediaStream) {
      return;
    }

    const videoTrack = getVideoTracks(mediaStream)[0];
    const trackCapabilities = videoTrack.getCapabilities();
    const irrelevantCapabilities = ['deviceId', 'groupId'];
    const missingConstraintsFromCapabilities = Object.entries(trackCapabilities)
      .filter(([key]) => {
        return !(key in videoConstraints) && !irrelevantCapabilities.includes(key);
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

              return [
                key,
                {
                  ...value,
                  default: minValue,
                  defaultObj: { ...value.defaultObj, min: minValue, max: maxValue },
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
        })
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
    }).finally(() => {
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
    requestDevices({ setVideoDeviceList });
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
          handleClose={() => {
            setSnackbarState((prevState) => {
              return { ...prevState, isOpen: false };
            });
          }}
          open={snackbarState.isOpen}
          message={snackbarState.message}
          autoHideDuration={snackbarState.autoHideDuration}
        />

        <Grid container spacing={2} className={classes.codes}>
          <Grid item xs={6}>
            <Code
              heading="REQUESTED CONSTRAINTS"
              settings={{ audio: false, video: constraints }}
              classes={classes}
            />
          </Grid>
          <Grid item xs={6}>
            <Code
              heading="TRACK SETTINGS"
              settings={{ audio: false, video: trackSettings }}
              classes={classes}
            />
          </Grid>
        </Grid>

        {!!missingConstraints.length && (
          <div>
            <Heading>MISSING CONSTRAINTS</Heading>
            <List>
              {missingConstraints.map((constraint) => {
                return <ListItem key={constraint}>{constraint}</ListItem>;
              })}
            </List>
          </div>
        )}
        <PageLoader isLoading={isLoading} classes={classes} />
      </Box>
      {isInitialized && (
        <Drawer open anchor="right" variant="permanent" className={classes.drawerRoot}>
          <SettingsDrawer
            videoDeviceId={videoDeviceId}
            videoDeviceList={videoDeviceList}
            setVideoDeviceFromId={setVideoDeviceFromId}
            videoConstraintsList={availableConstraintsVideoTrack}
            constraints={constraints}
            updateConstraints={updateConstraints}
            classes={classes}
          />
        </Drawer>
      )}
    </Box>
  );
};
export default App;
