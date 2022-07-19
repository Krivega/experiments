import React, { useEffect, useState, useCallback } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ID_720P } from '@experiments/system-devices/src/resolutionsList';
import requestDevices from '@experiments/system-devices/src/requestDevices';
import type { TResolution } from '@experiments/system-devices/src/resolutionsList';
import UserMedia from './containers/UserMedia';
import PageLoader from './containers/PageLoader';
import Code from './containers/Code';
import SettingsDrawer from './containers/SettingsDrawer';
import { videoConstraints } from './constraints';
import onInitMedia from './onInitMedia';
import requestMediaStream from './requestMediaStream';
import type { TVideoConstraints } from './typings';
import useStyles from './useStyles';

const defaultState = {
  resolutionId: ID_720P,
  videoDeviceId: '',
  audioInputDeviceId: '',
  edgeBlurAmount: 4,
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

  // Video settings
  const [videoSettings, setVideoSettings] = React.useState<TVideoConstraints>({});

  useEffect(() => {
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  }, []);

  useEffect(() => {
    const state = {
      resolutionId,
      videoDeviceId,
    };

    localStorage.setItem('state', JSON.stringify(state));
  }, [resolutionId, videoDeviceId]);

  const resetState = useCallback(() => {
    setResolutionId(defaultState.resolutionId);
  }, []);

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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioInputDeviceId, videoDeviceId, resolutionId, videoDeviceList.length]);

  return (
    <React.Fragment>
      <CssBaseline />
      <div>
        <PageLoader isLoading={isLoading} classes={classes} />
        <SettingsDrawer
          resetState={resetState}
          isInitialized={isInitialized}
          videoDeviceId={videoDeviceId}
          resolutionId={resolutionId}
          resolutionList={resolutionList}
          videoDeviceList={videoDeviceList}
          setResolutionId={setResolutionId}
          setVideoDeviceFromId={setVideoDeviceFromId}
          videoConstraints={videoConstraints}
          videoSettings={videoSettings}
          setVideoSettings={setVideoSettings}
          classes={classes}
        />
        <UserMedia classes={classes} mediaStream={mediaStream} />
      </div>
      <Code videoSettings={videoSettings} />
    </React.Fragment>
  );
};
export default App;
