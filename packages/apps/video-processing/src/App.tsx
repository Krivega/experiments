import React, { useEffect, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';
import { getMediaStream } from '@experiments/mediastream-api';
import { getVideoDevices } from '@experiments/utils/src/devicesResolvers';
import Media from '@experiments/components/src/Media';
import useMemoizedDebounce from '@experiments/components/src/useMemoizedDebounce';
import useNoneInitialEffect from '@experiments/components/src/useNoneInitialEffect';
import resolutionsListAll, { ID_720P } from '@experiments/system-devices/src/resolutionsList';
import type { TResolution } from '@experiments/system-devices/src/resolutionsList';
import RequesterDevices from '@experiments/system-devices';
import createVideoProcessor from '@experiments/video-processor';
import type {
  TProcessVideo,
  TModelSelection,
  TArchitecture,
} from '@experiments/video-processor/src/typings';

const useStyles = makeStyles((theme) => {
  return {
    formControl: {
      margin: theme.spacing(1),
      width: `100%`,
      justifyContent: 'start',
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

const resolveHandleInputChange = (handler) => {
  return (event, newValue) => {
    handler(newValue);
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

const defaultState = {
  resolutionId: ID_720P,
  architecture: 'MediaPipe' as TArchitecture,
  modelSelection: 'landscape' as TModelSelection,
  videoDeviceId: '',
  edgeBlurAmount: 4,
  isBlurBackground: false,
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
    initialState.isBlurBackground
  );
  const [mediaStreamOriginal, setMediaStreamOriginal] = useState<MediaStream | null>(null);
  const [mediaStreamProcessed, setMediaStreamProcessed] = useState<MediaStream | null>(null);
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceFromId] = useState<string>(initialState.videoDeviceId);
  const [resolutionList, setResolutionList] = useState<TResolution[]>([]);
  const [resolutionId, setResolutionId] = useState<string>(initialState.resolutionId);
  const [architecture, setArchitecture] = useState<TArchitecture>(initialState.architecture);
  const [modelSelection, setModelSelection] = useState<TModelSelection>(
    initialState.modelSelection
  );
  const [edgeBlurAmount, setEdgeBlurAmount] = useState<number>(initialState.edgeBlurAmount);

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
      .then(() => {
        if (mediaStreamOriginal) {
          return stopTracksMediaStream(mediaStreamOriginal);
        }

        return undefined;
      })
      .then(() => {
        return getMediaStream({
          audio: false,
          video: true,
          videoDeviceId,
          width,
          height,
        });
      })
      .then(setMediaStreamOriginal);
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
        videoProcessor.changeParams(params).then(() => {
          setLoading(false);
        });
      }
    },
    300,
    [videoProcessor]
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
          .then(() => {
            setLoading(false);
          });
      }
    },
    300,
    [videoProcessor]
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
        .then(() => {
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
              <ListItem>
                <FormControl variant="filled" className={classes.formControl}>
                  <InputLabel htmlFor="resolution">Architecture</InputLabel>
                  <Select
                    native
                    value={architecture}
                    onChange={resolveHandleChangeInput(setArchitecture)}
                    inputProps={{
                      name: 'architecture',
                      id: 'architecture',
                    }}
                  >
                    <option value="MediaPipe">MediaPipe</option>
                    {/* <option value="MediaPipeOptimized">MediaPipe optimized</option> */}
                    {/* <option value="MediaPipeWorker">MediaPipe worker</option> */}
                    {/* <option value="TensorFlow">TensorFlow</option> */}
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem>
                <FormControl variant="filled" className={classes.formControl}>
                  <InputLabel htmlFor="outputStride">Model type</InputLabel>
                  <Select
                    native
                    value={modelSelection}
                    onChange={resolveHandleChangeInput(setModelSelection)}
                    inputProps={{
                      name: 'modelSelection',
                      id: 'modelSelection',
                    }}
                  >
                    <option value="general">general(best)</option>
                    <option value="landscape">landscape(fast)</option>
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem>
                <FormControlLabel
                  labelPlacement="start"
                  className={classes.formControl}
                  control={
                    <Checkbox
                      checked={isBlurBackground}
                      onChange={resolveHandleInputChange(setBlurBackground)}
                    />
                  }
                  label={<Typography variant="subtitle1">Blur background</Typography>}
                />
              </ListItem>
              <ListItem>
                <FormControl variant="filled" className={classes.formControl}>
                  <Typography gutterBottom>Edge blur amount</Typography>
                  <Slider
                    marks
                    valueLabelDisplay="on"
                    min={0}
                    step={1}
                    max={20}
                    value={edgeBlurAmount}
                    onChange={resolveHandleInputChange(setEdgeBlurAmount)}
                  />
                </FormControl>
              </ListItem>
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
      {mediaStreamProcessed && (
        <div className={classes.video}>
          <Media mediaStream={mediaStreamProcessed} />
        </div>
      )}
    </div>
  );
};
export default App;
