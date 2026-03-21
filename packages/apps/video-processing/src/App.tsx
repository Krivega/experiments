import Media from '@experiments/components/src/Media';
import useMemoizedDebounce from '@experiments/components/src/useMemoizedDebounce';
import useNoneInitialEffect from '@experiments/components/src/useNoneInitialEffect';
import { getMediaStream } from '@experiments/mediastream-api';
import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';
import RequesterDevices from '@experiments/system-devices';
import resolutionsListAll, { ID_720P } from '@experiments/system-devices/src/resolutionsList';
import { getVideoDevices } from '@experiments/utils/src/devicesResolvers';
import createVideoProcessor from '@experiments/video-processor';

import AppBar from '@mui/material/AppBar';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/material/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import React, { useCallback, useEffect, useState } from 'react';
import type { TResolution } from '@experiments/system-devices/src/resolutionsList';
import type {
  TArchitecture,
  TModelSelection,
  TProcessVideo,
} from '@experiments/video-processor/src/typings';

const useStyles = makeStyles((theme) => {
  return {
    formControl: {
      margin: theme.spacing(1),
      width: '100%',
      justifyContent: 'start',
    },
    flex: {
      margin: theme.spacing(1),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    drawer: {},
    drawerContent: { width: '320px' },
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

const resolveHandleChangeInput = (handler: (value: string) => void) => {
  return ({ target }) => {
    const { value } = target;

    handler(value);
  };
};

const resolveHandleInputChange = (handler) => {
  return (event, newValue) => {
    handler(newValue);
  };
};

const parseItemDevice = (device: MediaDeviceInfo) => {
  return {
    label: device.label,
    value: device.deviceId,
  };
};

const renderItemDevice = (item, index) => {
  const { label, value } = parseItemDevice(item);

  return (
    <option key={`${value}${index}`} value={value}>
      {label}
    </option>
  );
};

const renderItemResolution = (item, index) => {
  const { id, label } = item;

  return (
    <option key={`${id}${index}`} value={id}>
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

const defaultState = {
  resolutionId: ID_720P,
  architecture: 'MediaPipe' as TArchitecture,
  modelSelection: 'landscape' as TModelSelection,
  videoDeviceId: '',
  edgeBlurAmount: 6,
  isBlurBackground: true,
};
// @ts-ignore
const storedState = JSON.parse(localStorage.getItem('state')) || {};
const initialState = { ...defaultState, ...storedState };

const App = () => {
  const classes = useStyles();
  const [videoProcessor, setVideoProcessor] = useState<TProcessVideo | null>(null);
  const [isInitialized, setInitialized] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(true);
  const [isBlurBackground, setBlurBackground] = React.useState<boolean>(
    initialState.isBlurBackground,
  );
  const [mediaStreamOriginal, setMediaStreamOriginal] = useState<MediaStream | null>(null);
  const [mediaStreamProcessed, setMediaStreamProcessed] = useState<MediaStream | null>(null);
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceFromId] = useState<string>(initialState.videoDeviceId);
  const [resolutionList, setResolutionList] = useState<TResolution[]>([]);
  const [resolutionId, setResolutionId] = useState<string>(initialState.resolutionId);
  const [architecture, setArchitecture] = useState<TArchitecture>(initialState.architecture);
  const [modelSelection, setModelSelection] = useState<TModelSelection>(
    initialState.modelSelection,
  );
  const [edgeBlurAmount, setEdgeBlurAmount] = useState<number>(initialState.edgeBlurAmount);

  const [open, setOpen] = React.useState(false);

  const toggleDrawer = useCallback(() => {
    setOpen((current) => {
      return !current;
    });
  }, []);

  useEffect(() => {
    console.log('createVideoProcessor', architecture);
    createVideoProcessor(architecture).then(setVideoProcessor);
  }, [architecture]);

  useEffect(() => {
    const state = {
      resolutionId,
      architecture,
      modelSelection,
      videoDeviceId,
      edgeBlurAmount,
      isBlurBackground,
    };

    console.log('localStorage.setItem', state);

    localStorage.setItem('state', JSON.stringify(state));
  }, [architecture, modelSelection, resolutionId, videoDeviceId, edgeBlurAmount, isBlurBackground]);

  const resetState = useCallback(() => {
    setResolutionId(defaultState.resolutionId);
    setArchitecture(defaultState.architecture);
    setModelSelection(defaultState.modelSelection);
    setEdgeBlurAmount(defaultState.edgeBlurAmount);
    setBlurBackground(defaultState.isBlurBackground);
  }, []);

  useNoneInitialEffect(() => {
    window.location.reload();
  }, [architecture]);

  useEffect(() => {
    console.log('getVideoDevices');
    requesterDevices.request([]).then((devices) => {
      console.log(JSON.stringify(devices));
      setVideoDeviceList(getVideoDevices(devices));
    });
  }, []);

  useEffect(() => {
    if (videoDeviceList.length > 0 && !videoDeviceId) {
      console.log('setVideoDeviceFromId');
      setVideoDeviceFromId(videoDeviceList[0].deviceId);
    }
  }, [videoDeviceList, videoDeviceId]);

  useEffect(() => {
    if (mediaStreamOriginal) {
      const videoTrack = getVideoTracks(mediaStreamOriginal)[0];

      if (videoTrack.getCapabilities) {
        const capabilities = videoTrack.getCapabilities();
        const resolutionsByCapabilities = getResolutionsByCapabilities(capabilities);

        console.log('setResolutionList');
        setResolutionList(resolutionsByCapabilities);
      }
    }
  }, [mediaStreamOriginal]);

  useEffect(() => {
    if (!videoDeviceId || !resolutionId || videoDeviceList.length === 0) {
      return;
    }

    const resolution = getResolutionById(resolutionId);

    if (!resolution) {
      return;
    }

    const { width, height } = resolution;

    console.log('getMediaStream', {
      videoDeviceId,
      width,
      height,
    });

    Promise.resolve()
      .then(async () => {
        if (mediaStreamOriginal) {
          return stopTracksMediaStream(mediaStreamOriginal);
        }

        return undefined;
      })
      .then(async () => {
        return getMediaStream({
          audio: false,
          video: true,
          videoDeviceId,
          width,
          height,
        });
      })
      .then(setMediaStreamOriginal)
      .catch(console.log);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoDeviceId, resolutionId, videoDeviceList.length]);

  const updateProcessingDebounced = useMemoizedDebounce(
    (params: {
      modelSelection: TModelSelection;
      edgeBlurAmount: number;
      isBlurBackground: boolean;
    }) => {
      if (videoProcessor) {
        console.log('updateProcessingDebounced');
        setLoading(true);
        videoProcessor.changeParams(params).finally(() => {
          setLoading(false);
        });
      }
    },
    300,
    [videoProcessor],
  );

  const restartDebounced = useMemoizedDebounce(
    (params: {
      mediaStream: MediaStream;
      modelSelection: TModelSelection;
      edgeBlurAmount: number;
      isBlurBackground: boolean;
    }) => {
      if (videoProcessor) {
        console.log('restartDebounced');
        setLoading(true);
        videoProcessor
          .restart(params)
          .then(setMediaStreamProcessed)
          .finally(() => {
            setLoading(false);
          });
      }
    },
    300,
    [videoProcessor],
  );

  useEffect(() => {
    if (videoProcessor && mediaStreamOriginal && !mediaStreamProcessed && !isInitialized) {
      console.log('start');
      videoProcessor
        .start({
          modelSelection,
          edgeBlurAmount,
          isBlurBackground,
          mediaStream: mediaStreamOriginal,
        })
        .then(setMediaStreamProcessed)
        .finally(() => {
          setLoading(false);
          setInitialized(true);
        });
    }
  }, [
    edgeBlurAmount,
    isBlurBackground,
    isInitialized,
    mediaStreamOriginal,
    mediaStreamProcessed,
    modelSelection,
    videoProcessor,
  ]);

  useEffect(() => {
    if (isInitialized) {
      updateProcessingDebounced({ modelSelection, edgeBlurAmount, isBlurBackground });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeBlurAmount, modelSelection, isBlurBackground, updateProcessingDebounced]);

  useEffect(() => {
    if (mediaStreamOriginal && isInitialized) {
      // reload model

      updateProcessingDebounced.cancel();
      restartDebounced({
        mediaStream: mediaStreamOriginal,
        modelSelection,
        edgeBlurAmount,
        isBlurBackground,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaStreamOriginal]);

  return (
    <div>
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {isInitialized ? (
        <>
        <AppBar position="fixed">
            <Button onClick={toggleDrawer}>{open ? 'Close' : 'Open'} Settings</Button>
          </AppBar>

          <Drawer anchor="right" className={classes.drawer} open={open} variant="persistent">
            <div className={classes.drawerContent}>
              <IconButton onClick={toggleDrawer}>
                <ChevronRightIcon />
              </IconButton>

              <Divider />

              <List>
                <ListItem>
                  <FormControl className={classes.formControl} variant="filled">
                    <InputLabel htmlFor="cam">Cam</InputLabel>

                    <Select
                      native
                      inputProps={{
                        name: 'cam',
                        id: 'cam',
                      }}
                      value={videoDeviceId}
                      onChange={resolveHandleChangeInput(setVideoDeviceFromId)}
                    >
                      {videoDeviceList.map(renderItemDevice)}
                    </Select>
                  </FormControl>
                </ListItem>

                <ListItem>
                  <FormControl className={classes.formControl} variant="filled">
                    <InputLabel htmlFor="resolution">Resolution</InputLabel>

                    <Select
                      native
                      inputProps={{
                        name: 'resolution',
                        id: 'resolution',
                      }}
                      value={resolutionId}
                      onChange={resolveHandleChangeInput(setResolutionId)}
                    >
                      {resolutionList.map(renderItemResolution)}
                    </Select>
                  </FormControl>
                </ListItem>

                <ListItem>
                  <FormControl className={classes.formControl} variant="filled">
                    <InputLabel htmlFor="resolution">Architecture</InputLabel>

                    <Select
                      native
                      inputProps={{
                        name: 'architecture',
                        id: 'architecture',
                      }}
                      value={architecture}
                      onChange={resolveHandleChangeInput(setArchitecture)}
                    >
                      <option value="MediaPipe">MediaPipe</option>

                      {/* <option value="MediaPipeOptimized">MediaPipe optimized</option> */}
                      {/* <option value="MediaPipeWorker">MediaPipe worker</option> */}
                      <option value="TensorFlow">TensorFlow</option>
                    </Select>
                  </FormControl>
                </ListItem>

                <ListItem>
                  <FormControl className={classes.formControl} variant="filled">
                    <InputLabel htmlFor="outputStride">Model type</InputLabel>

                    <Select
                      native
                      inputProps={{
                        name: 'modelSelection',
                        id: 'modelSelection',
                      }}
                      value={modelSelection}
                      onChange={resolveHandleChangeInput(setModelSelection)}
                    >
                      <option value="general">general(best)</option>

                      <option value="landscape">landscape(fast)</option>
                    </Select>
                  </FormControl>
                </ListItem>

                <ListItem>
                  <FormControlLabel
                    className={classes.formControl}
                    control={
                      <Checkbox
                        checked={isBlurBackground}
                        onChange={resolveHandleInputChange(setBlurBackground)}
                      />
                    }
                    label={<Typography variant="subtitle1">Blur background</Typography>}
                    labelPlacement="start"
                  />
                </ListItem>

                <ListItem>
                  <FormControl className={classes.formControl} variant="filled">
                    <Typography gutterBottom>Edge blur amount</Typography>

                    <Slider
                      marks
                      max={20}
                      min={0}
                      step={1}
                      value={edgeBlurAmount}
                      valueLabelDisplay="on"
                      onChange={resolveHandleInputChange(setEdgeBlurAmount)}
                    />
                  </FormControl>
                </ListItem>
              </List>

              <div className={classes.flex}>
                <Fab color="primary" variant="extended" onClick={resetState}>
                  <RotateLeftIcon className={classes.extendedIcon} />
                  Reset
                </Fab>
              </div>
            </div>
          </Drawer>
                       </>
      ) : null}

      {mediaStreamProcessed ? (
        (
<div className={classes.video}>
          <Media mediaStream={mediaStreamProcessed} />
        </div>
) : null}
    </div>
  );
};
export default App;
