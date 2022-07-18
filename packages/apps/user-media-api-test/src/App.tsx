import React, { useEffect, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Drawer from '@material-ui/core/Drawer';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Backdrop from '@material-ui/core/Backdrop';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import CssBaseline from '@material-ui/core/CssBaseline';
import { getMediaStream } from '@experiments/mediastream-api';
import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';
import { getVideoDevices, getAudioInputDevices } from '@experiments/utils/src/devicesResolvers';
import Media from '@experiments/components/src/Media';
import resolutionsListAll, { ID_720P } from '@experiments/system-devices/src/resolutionsList';
import type { TResolution } from '@experiments/system-devices/src/resolutionsList';
import RequesterDevices from '@experiments/system-devices/src';
import { videoConstraints, audioConstraints } from './constraints';
import type { TVideoConstraints } from './typings';

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

  const resolveHandleBooleanConstraintsChange = (key: string) => {
    return (event) => {
      if (event.target.name === key) {
        setVideoSettings({
          ...videoSettings,
          [key]: event.target.checked,
        });
      } else if (event.target.name === 'exact') {
        setVideoSettings({
          ...videoSettings,
          [key]: { exact: event.target.checked },
        });
      } else if (event.target.name === 'ideal') {
        setVideoSettings({
          ...videoSettings,
          [key]: { ideal: event.target.checked },
        });
      }
    };
  };

  const renderVideoConstraint = ({ key, value }) => {
    if (value.type === 'boolean') {
      const handleBooleanConstraintsChange = resolveHandleBooleanConstraintsChange(key);

      const children = (
        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="exact"
                size="small"
                onChange={handleBooleanConstraintsChange}
                checked={!!videoSettings[key]?.exact}
                color="default"
              />
            }
            label="exact"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="ideal"
                size="small"
                onChange={handleBooleanConstraintsChange}
                checked={!!videoSettings[key]?.ideal}
                color="default"
              />
            }
            label="ideal"
          />
        </Box>
      );

      return (
        <ListItem key={key}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  name={key}
                  onChange={handleBooleanConstraintsChange}
                  checked={videoSettings[key] === true}
                  color="default"
                />
              }
              label={key}
            />

            {!!videoSettings[key] && children}
          </FormGroup>
        </ListItem>
      );
    }

    return <ListItem key={key}>{key}</ListItem>;
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
                <div>CAMERA SETTINGS</div>
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
            <Media mediaStream={mediaStream} />
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
export default App;
