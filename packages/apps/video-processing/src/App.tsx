import React, { useEffect, useState, useRef, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import ListItem from '@material-ui/core/ListItem';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import stopTracksMediaStream from '@vinteo/mediastream-api/src/stopTracksMediaStream';
import { getMediaStream } from '@vinteo/mediastream-api';
import { getVideoDevices } from '@vinteo/utils/src/devicesResolvers';
import Media from '@vinteo/components/src/Media';
import useMemoizedDebounce from '@vinteo/components/src/useMemoizedDebounce';
import useNoneInitialEffect from '@vinteo/components/src/useNoneInitialEffect';
import resolutionsListAll, { ID_720P } from '@vinteo/system-devices/src/resolutionsList';
import type { TResolution } from '@vinteo/system-devices/src/resolutionsList';
import RequesterDevices from '@vinteo/system-devices';
import createVideoProcessor from '@vinteo/video-processor';
import type {
  TProcessVideo,
  TModelSelection,
  TArchitecture,
} from '@vinteo/video-processor/src/typings';

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
};
// @ts-ignore
const storedState = JSON.parse(localStorage.getItem('state')) || {};
const initialState = { ...defaultState, ...storedState };

const App = () => {
  const classes = useStyles();
  const videoProcessorRef = useRef<TProcessVideo | null>(null);
  const [isInitialized, setInitialized] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(true);
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
    createVideoProcessor(architecture).then((videoProcessor) => {
      videoProcessorRef.current = videoProcessor;
    });
  }, [architecture]);

  useEffect(() => {
    const state = {
      resolutionId,
      architecture,
      modelSelection,
      videoDeviceId,
      edgeBlurAmount,
    };

    localStorage.setItem('state', JSON.stringify(state));
  }, [architecture, modelSelection, resolutionId, videoDeviceId, edgeBlurAmount]);

  const resetState = useCallback(() => {
    setResolutionId(defaultState.resolutionId);
    setArchitecture(defaultState.architecture);
    setModelSelection(defaultState.modelSelection);
    setEdgeBlurAmount(defaultState.edgeBlurAmount);
  }, []);

  useNoneInitialEffect(() => {
    window.location.reload();
  }, [architecture]);

  useEffect(() => {
    requesterDevices.request([]).then((devices) => {
      setVideoDeviceList(getVideoDevices(devices));
    });
  }, []);

  useEffect(() => {
    if (videoDeviceList.length > 0 && !videoDeviceId) {
      setVideoDeviceFromId(videoDeviceList[0].deviceId);
    }
  }, [videoDeviceList, videoDeviceId]);

  useEffect(() => {
    if (mediaStreamOriginal) {
      const videoTrack = getVideoTracks(mediaStreamOriginal)[0];

      if (videoTrack.getCapabilities) {
        const capabilities = videoTrack.getCapabilities();
        const resolutionsByCapabilities = getResolutionsByCapabilities(capabilities);

        setResolutionList(resolutionsByCapabilities);
        setInitialized(true);
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

  useEffect(() => {
    if (videoProcessorRef.current && mediaStreamOriginal && !mediaStreamProcessed) {
      setLoading(true);
      videoProcessorRef.current
        .start({
          modelSelection,
          edgeBlurAmount,
          mediaStream: mediaStreamOriginal,
        })
        .then(setMediaStreamProcessed)
        .then(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaStreamOriginal]);

  const updateProcessingDebounced = useMemoizedDebounce(
    () => {
      if (videoProcessorRef.current && mediaStreamOriginal && mediaStreamProcessed) {
        // update processing

        setLoading(true);
        videoProcessorRef.current
          .changeParams({
            modelSelection,
            edgeBlurAmount,
          })
          .then(() => {
            setLoading(false);
          });
      }
    },
    300,
    [modelSelection, edgeBlurAmount, mediaStreamOriginal, mediaStreamProcessed]
  );

  const restartDebounced = useMemoizedDebounce(
    () => {
      if (videoProcessorRef.current && mediaStreamOriginal && mediaStreamProcessed) {
        setLoading(true);
        videoProcessorRef.current
          .restart({
            modelSelection,
            edgeBlurAmount,
            mediaStream: mediaStreamOriginal,
          })
          .then(setMediaStreamProcessed)
          .then(() => {
            setLoading(false);
          });
      }
    },
    300,
    [modelSelection, edgeBlurAmount, mediaStreamOriginal, mediaStreamProcessed]
  );

  useEffect(() => {
    updateProcessingDebounced();
  }, [modelSelection, updateProcessingDebounced]);

  useEffect(() => {
    if (videoProcessorRef.current && mediaStreamProcessed && mediaStreamOriginal) {
      // reload model

      updateProcessingDebounced.cancel();
      restartDebounced();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaStreamOriginal, modelSelection]);

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
                    <option value="MediaPipeOptimized">MediaPipe optimized</option>
                    {/* <option value="MediaPipeWorker">MediaPipe worker</option> */}
                    <option value="TensorFlow">TensorFlow</option>
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
                    <option value="general">general</option>
                    <option value="landscape">landscape</option>
                  </Select>
                </FormControl>
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
