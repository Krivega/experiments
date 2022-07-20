import React, { useEffect, useState, useCallback } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import requestDevices from '@experiments/system-devices/src/requestDevices';
import type { TResolution } from '@experiments/system-devices/src/resolutionsList';
import getVideoTracks from '@experiments/mediastream-api/src/getVideoTracks';
import UserMedia from './containers/UserMedia';
import PageLoader from './containers/PageLoader';
import Code from './containers/Code';
import SettingsDrawer from './containers/SettingsDrawer';
import Snackbar from './containers/Snackbar';
import Heading from './containers/Heading';
import { videoConstraints } from './constraints';
import onInitMedia from './onInitMedia';
import requestMediaStream from './requestMediaStream';
import type { TVideoConstraints } from './typings';
import defaultState from './defaultState';
import useStyles, { flex } from './useStyles';
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
  const [audioInputDeviceList, setAudioInputDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceFromId] = useState<string>(initialState.videoDeviceId);
  const [audioInputDeviceId, setAudioInputDeviceFromId] = useState<string>(
    initialState.audioInputDeviceId
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [resolutionList, setResolutionList] = useState<TResolution[]>([]);
  const [resolutionId] = useState<string>(initialState.resolutionId);
  const [snackbarState, setSnackbarState] = useState<TSnackBar>({
    isOpen: false,
    autoHideDuration: null,
    message: '',
  });

  // Video settings
  const [videoSettings, setVideoSettings] = React.useState<TVideoConstraints>({});
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
      resolutionId,
      videoDeviceId,
    };

    localStorage.setItem('state', JSON.stringify(state));
  }, [resolutionId, videoDeviceId]);

  const requestStream = useCallback(() => {
    requestMediaStream({
      mediaStream,
      setMediaStream,
      setIsLoading,
      videoDeviceId,
      resolutionId,
      videoDeviceList,
      onSuccess: onSuccessRequestMediaStream,
      onFail: onFailRequestMediaStream,
      additionalConstraints: videoSettings,
    });
  }, [mediaStream, resolutionId, videoDeviceId, videoDeviceList, videoSettings]);

  const resetState = useCallback(() => {
    setVideoSettings({});

    requestMediaStream({
      mediaStream,
      setMediaStream,
      setIsLoading,
      videoDeviceId,
      resolutionId,
      videoDeviceList,
      onFail: onFailRequestMediaStream,
      additionalConstraints: {},
    });
  }, [mediaStream, resolutionId, videoDeviceId, videoDeviceList]);

  useEffect(() => {
    requestDevices({ setVideoDeviceList, setAudioInputDeviceList });
  }, []);

  useEffect(() => {
    if (videoDeviceList.length > 0 && !videoDeviceId) {
      setVideoDeviceFromId(videoDeviceList[0].deviceId);
    }

    if (audioInputDeviceList.length > 0 && !audioInputDeviceId) {
      setAudioInputDeviceFromId(audioInputDeviceList[0].deviceId);
    }
  }, [videoDeviceList, videoDeviceId, audioInputDeviceList, audioInputDeviceId]);

  useEffect(() => {
    if (mediaStream) {
      onInitMedia({ mediaStream, setResolutionList, setInitialized });
    }
  }, [mediaStream]);

  useEffect(() => {
    requestMediaStream({
      mediaStream,
      setMediaStream,
      setIsLoading,
      videoDeviceId,
      resolutionId,
      videoDeviceList,
      onFail: onFailRequestMediaStream,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoDeviceId, resolutionId, videoDeviceList.length]);

  return (
    <React.Fragment>
      <CssBaseline />
      <PageLoader isLoading={isLoading} classes={classes} />
      <SettingsDrawer
        resetState={resetState}
        requestStream={requestStream}
        isInitialized={isInitialized}
        videoDeviceId={videoDeviceId}
        videoDeviceList={videoDeviceList}
        setVideoDeviceFromId={setVideoDeviceFromId}
        videoConstraints={availableConstraintsVideoTrack}
        videoSettings={videoSettings}
        setVideoSettings={setVideoSettings}
        classes={classes}
      />
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
      <Code videoSettings={{ audio: false, video: videoSettings }} />
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
    </React.Fragment>
  );
};
export default App;
