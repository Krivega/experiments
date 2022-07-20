import React, { useEffect, useState, useCallback } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import requestDevices from '@experiments/system-devices/src/requestDevices';
import type { TResolution } from '@experiments/system-devices/src/resolutionsList';
import getVideoTracks from '@experiments/mediastream-api/src/getVideoTracks';
import UserMedia from './containers/UserMedia';
import PageLoader from './containers/PageLoader';
import Code from './containers/Code';
import SettingsDrawer from './containers/SettingsDrawer';
import Snackbar from './containers/Snackbar';
import { videoConstraints } from './constraints';
import onInitMedia from './onInitMedia';
import requestMediaStream from './requestMediaStream';
import type { TVideoConstraints } from './typings';
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
  const [audioInputDeviceList, setAudioInputDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceFromId] = useState<string>(initialState.videoDeviceId);
  const [audioInputDeviceId, setAudioInputDeviceFromId] = useState<string>(
    initialState.audioInputDeviceId
  );
  const [resolutionList, setResolutionList] = useState<TResolution[]>([]);
  const [resolutionId, setResolutionId] = useState<string>(initialState.resolutionId);
  const [snackbarState, setSnackbarState] = useState<TSnackBar>({
    isOpen: false,
    autoHideDuration: null,
    message: '',
  });

  // Video settings
  const [videoSettings, setVideoSettings] = React.useState<TVideoConstraints>({});
  const [availableConstraintsVideoTrack, setAvailableConstraintsVideoTrack] =
    React.useState<null | Object>(null);

  useEffect(() => {
    if (!mediaStream) {
      return;
    }

    const videoTrack = getVideoTracks(mediaStream)[0];
    const trackCapabilities = videoTrack.getCapabilities();

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
      audioInputDeviceId,
      onSuccess: onSuccessRequestMediaStream,
      onFail: onFailRequestMediaStream,
      additionalConstraints: videoSettings,
    });
  }, [
    audioInputDeviceId,
    mediaStream,
    resolutionId,
    videoDeviceId,
    videoDeviceList,
    videoSettings,
  ]);

  const resetState = useCallback(() => {
    setVideoSettings({});

    requestMediaStream({
      mediaStream,
      setMediaStream,
      setIsLoading,
      videoDeviceId,
      resolutionId,
      videoDeviceList,
      audioInputDeviceId,
      onFail: onFailRequestMediaStream,
      additionalConstraints: {},
    });
  }, [audioInputDeviceId, mediaStream, resolutionId, videoDeviceId, videoDeviceList]);

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
      audioInputDeviceId,
      onFail: onFailRequestMediaStream,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioInputDeviceId, videoDeviceId, resolutionId, videoDeviceList.length]);

  return (
    <React.Fragment>
      <CssBaseline />
      <PageLoader isLoading={isLoading} classes={classes} />
      <SettingsDrawer
        resetState={resetState}
        requestStream={requestStream}
        isInitialized={isInitialized}
        videoDeviceId={videoDeviceId}
        resolutionId={resolutionId}
        resolutionList={resolutionList}
        videoDeviceList={videoDeviceList}
        setResolutionId={setResolutionId}
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
      <Code videoSettings={videoSettings} />
    </React.Fragment>
  );
};
export default App;
