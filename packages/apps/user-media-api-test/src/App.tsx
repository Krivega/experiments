import React, { useEffect, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import CssBaseline from '@material-ui/core/CssBaseline';
import { getMediaStream } from '@experiments/mediastream-api';
import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';
import { getVideoDevices, getAudioInputDevices } from '@experiments/utils/src/devicesResolvers';
import Media from '@experiments/components/src/Media';
import resolutionsListAll, { ID_720P } from '@experiments/system-devices/src/resolutionsList';
import type { TResolution } from '@experiments/system-devices/src/resolutionsList';
import RequesterDevices from '@experiments/system-devices/src';
import NumericConstraint from './containers/NumericConstraint';
import BooleanConstraint from './containers/BooleanConstraint';
import StringOptionConstraint from './containers/StringOptionConstraint';
import PointOfInterestConstraint from './containers/PointOfInterestConstraint';
import { videoConstraints } from './constraints';
import type { TVideoConstraints } from './typings';
import {
  STRING_OPTION_CONSTRAINT,
  POINTS_OF_INTEREST_CONSTRAINT,
  BOOLEAN_CONSTRAINT,
} from './constants';

const useStyles = makeStyles((theme) => {
  return {
    formControl: {
      margin: theme.spacing(1),
      width: `100%`,
    },
    flex: {
      margin: theme.spacing(1),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    drawer: { width: '320px' },
    fullWidth: { width: '100%' },
    noPadding: { padding: '0' },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    video: {
      transform: 'rotateY(180deg)',
      display: 'flex',
      justifyContent: 'flex-end',
    },
  };
});
const getResolutionsByCapabilities = (capabilities) => {
  const {
    width: { max: maxWidth },
    height: { max: maxHeight },
  } = capabilities;

  const resolutionsByCapabilities = resolutionsListAll.filter((resolution) => {
    return resolution.width <= maxWidth && resolution.height <= maxHeight;
  });

  return resolutionsByCapabilities;
};
const getResolutionById = (id: string) => {
  const resolutionById = resolutionsListAll.find((resolution) => {
    return resolution.id === id;
  });

  return resolutionById;
};

const resolveHandleChangeInput = (handler) => {
  return ({ target }) => {
    const { value } = target;

    handler(value);
  };
};

const parseItemDevice = (device) => {
  return {
    label: device.label,
    value: device.deviceId,
  };
};

const renderItemDevice = (item, index) => {
  const { label, value } = parseItemDevice(item);

  return (
    <option value={value} key={`${value}${index}`}>
      {label}
    </option>
  );
};

const renderItemResolution = (item, index) => {
  const { id, label } = item;

  return (
    <option value={id} key={`${id}${index}`}>
      {label}
    </option>
  );
};

const requesterDevices = new RequesterDevices();

const getVideoTracks = (mediaStream) => {
  return mediaStream.getTracks().filter(({ kind }) => {
    return kind === 'video';
  });
};

const getAudioTracks = (mediaStream) => {
  return mediaStream.getTracks().filter(({ kind }) => {
    return kind === 'audio';
  });
};

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
    requesterDevices.request([]).then((devices) => {
      setVideoDeviceList(getVideoDevices(devices));
      setAudioInputDeviceList(getAudioInputDevices(devices));
    });
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
      const videoTrack = getVideoTracks(mediaStream)[0];
      const audioTrack = getAudioTracks(mediaStream)[0];

      if (audioTrack.getCapabilities) {
        const capabilities = audioTrack.getCapabilities();
      }

      if (videoTrack.getCapabilities) {
        const capabilities = videoTrack.getCapabilities();

        const resolutionsByCapabilities = getResolutionsByCapabilities(capabilities);

        setResolutionList(resolutionsByCapabilities);
        setInitialized(true);
      }
    }
  }, [mediaStream]);

  useEffect(() => {
    setIsLoading(true);

    if (!videoDeviceId || !resolutionId || videoDeviceList.length === 0 || !audioInputDeviceId) {
      setIsLoading(false);

      return;
    }

    const resolution = getResolutionById(resolutionId);

    if (!resolution) {
      setIsLoading(false);

      return;
    }

    const { width, height } = resolution;

    Promise.resolve()
      .then(() => {
        if (mediaStream) {
          return stopTracksMediaStream(mediaStream);
        }

        return undefined;
      })
      .then(() => {
        return getMediaStream({
          audio: true,
          video: true,
          audioDeviceId: audioInputDeviceId,
          videoDeviceId,
          width,
          height,
        });
      })
      .then(setMediaStream)
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioInputDeviceId, videoDeviceId, resolutionId, videoDeviceList.length]);

  const renderVideoConstraint = ({ key, value }) => {
    if (value.type === BOOLEAN_CONSTRAINT) {
      return (
        <ListItem key={key}>
          <BooleanConstraint
            classes={classes}
            value={value}
            constraintKey={key}
            videoSettings={videoSettings}
            setVideoSettings={setVideoSettings}
          />
        </ListItem>
      );
    }

    if (value.type === STRING_OPTION_CONSTRAINT) {
      return (
        <ListItem key={key}>
          <StringOptionConstraint
            classes={classes}
            value={value}
            constraintKey={key}
            videoSettings={videoSettings}
            setVideoSettings={setVideoSettings}
          />
        </ListItem>
      );
    }

    if (value.type === POINTS_OF_INTEREST_CONSTRAINT) {
      return (
        <ListItem key={key}>
          <PointOfInterestConstraint
            value={value}
            constraintKey={key}
            videoSettings={videoSettings}
            setVideoSettings={setVideoSettings}
          />
        </ListItem>
      );
    }

    return (
      <ListItem key={key}>
        <NumericConstraint
          value={value}
          constraintKey={key}
          videoSettings={videoSettings}
          setVideoSettings={setVideoSettings}
        />
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <div>
        <Backdrop className={classes.backdrop} open={isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {isInitialized && (
          <Drawer open anchor="right" variant="persistent">
            <div className={classes.drawer}>
              <List>
                <ListItem>
                  <FormControl variant="filled" className={classes.formControl}>
                    <InputLabel htmlFor="cam">Cam</InputLabel>
                    <Select
                      native
                      value={videoDeviceId}
                      onChange={resolveHandleChangeInput(setVideoDeviceFromId)}
                      inputProps={{
                        name: 'cam',
                        id: 'cam',
                      }}
                    >
                      {videoDeviceList.map(renderItemDevice)}
                    </Select>
                  </FormControl>
                </ListItem>
                <ListItem>
                  <FormControl variant="filled" className={classes.formControl}>
                    <InputLabel htmlFor="resolution">Resolution</InputLabel>
                    <Select
                      native
                      value={resolutionId}
                      onChange={resolveHandleChangeInput(setResolutionId)}
                      inputProps={{
                        name: 'resolution',
                        id: 'resolution',
                      }}
                    >
                      {resolutionList.map(renderItemResolution)}
                    </Select>
                  </FormControl>
                </ListItem>
              </List>
              <Container>
                <Typography variant="h5">CAMERA SETTINGS</Typography>
              </Container>
              <List>
                {Object.entries(videoConstraints).map(([key, value]) => {
                  return renderVideoConstraint({ key, value });
                })}
              </List>
              <div className={classes.flex}>
                <Fab variant="extended" color="primary" onClick={resetState}>
                  <RotateLeftIcon className={classes.extendedIcon} />
                  Reset
                </Fab>
              </div>
            </div>
          </Drawer>
        )}
        {mediaStream && (
          <div className={classes.video}>
            <Media muted mediaStream={mediaStream} />
          </div>
        )}
      </div>
      <Divider />
      <pre>{JSON.stringify(videoSettings, null, 2)}</pre>
    </React.Fragment>
  );
};
export default App;
