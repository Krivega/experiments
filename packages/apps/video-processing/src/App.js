import React, { useEffect, useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import { getMediaStream } from './mediastreamApi';
import stopTracksMediaStream from './mediastreamApi/stopTracksMediaStream';
import resolutionsListAll, { ID_360P, ID_720P } from './systemDevices/resolutionsList';
import RequesterDevices from './systemDevices';
import { getVideoDevices } from './utils/devicesResolvers';
import Media from './components/Media';
import resolveVideoProcessor from './resolveVideoProcessor';

const useStyles = makeStyles((theme) => ({
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
}));
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
const getResolutionById = (id) => {
  const resolutionById = resolutionsListAll.find((resolution) => {
    return resolution.id === id;
  });

  return resolutionById;
};

const resolveHandleChangeInput = (handler) => ({ target }) => {
  const { value } = target;

  handler(value);
};

const resolveHandleInputChange = (handler) => (event, newValue) => {
  handler(newValue);
};
const parseItemDevice = (device) => ({
  label: device.label,
  value: device.deviceId,
});

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

const calcScale = (resolutionId, resolutionIdProcessing) => {
  const resolution = getResolutionById(resolutionId);
  const resolutionProcessing = getResolutionById(resolutionIdProcessing);

  return resolutionProcessing.width / resolution.width;
};
const requesterDevices = new RequesterDevices();

const getVideoTracks = (mediaStream) => {
  return mediaStream.getTracks().filter(({ kind }) => kind === 'video');
};

const algorithm = 'person';

const defaultMobileNetMultiplier = 0.75;
const defaultMobileNetValuesMultiplier = [0.5, 0.75, 1.0];
const defaultMobileNetStride = 16;
const defaultMobileNetValuesStride = [8, 16];
const defaultMobileNetInternalResolution = 'medium';

const defaultResNetMultiplier = 1.0;
const defaultResNetValuesMultiplayer = [1.0];
const defaultResNetStride = 16;
const defaultResNetValuesStride = [32, 16];
const defaultResNetInternalResolution = 'low';

const defaultState = {
  internalResolution: defaultMobileNetInternalResolution,
  multiplier: defaultMobileNetMultiplier,
  valuesMultiplier: defaultMobileNetValuesMultiplier,
  valuesStride: defaultMobileNetValuesStride,
  resolutionId: ID_720P,
  resolutionIdProcessing: ID_360P,
  architecture: 'MobileNetV1',
  segmentationThreshold: 0.7,
  edgeBlurAmount: 3,
  outputStride: 16,
  quantBytes: 2,
  maxDetections: 1,
  scoreThreshold: 0.3,
  nmsRadius: 20,
  numKeypointForMatching: 17,
  refineSteps: 10,
  videoDeviceId: '',
};
const storedState = JSON.parse(localStorage.getItem('state')) || {};
const initialState = { ...defaultState, ...storedState };

const App = () => {
  const classes = useStyles();
  const videoProcessorRef = useRef(null);
  const [isInitialized, setInitialized] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);
  const [mediaStreamOriginal, setMediaStreamOriginal] = useState(null);
  const [mediaStreamProcessed, setMediaStreamProcessed] = useState(null);
  const [videoDeviceList, setVideoDeviceList] = useState([]);
  const [videoDeviceId, setVideoDeviceFromId] = useState(initialState.videoDeviceId);
  const [resolutionList, setResolutionList] = useState([]);
  const [resolutionId, setResolutionId] = useState(initialState.resolutionId);
  const [resolutionListProcessing, setResolutionListProcessing] = useState([]);
  const [resolutionIdProcessing, setResolutionIdProcessing] = useState(
    initialState.resolutionIdProcessing
  );
  const [scale, setScale] = useState(
    calcScale(initialState.resolutionId, initialState.resolutionIdProcessing)
  );
  const [architecture, setArchitecture] = useState(initialState.architecture);
  // const [algorithm, setAlgorithm] = useState('person');
  const [segmentationThreshold, setSegmentationThreshold] = useState(
    initialState.segmentationThreshold
  );
  const [edgeBlurAmount, setEdgeBlurAmount] = useState(initialState.edgeBlurAmount);
  const [valuesStride, setValuesStride] = useState(initialState.valuesStride);
  const [outputStride, setOutputStride] = useState(initialState.outputStride);
  const [internalResolution, setInternalResolution] = useState(initialState.internalResolution);
  const [quantBytes, setQuantBytes] = useState(initialState.quantBytes);
  const [valuesMultiplier, setValuesMultiplayer] = useState(initialState.valuesMultiplier);
  const [multiplier, setMultiplayer] = useState(initialState.multiplier);
  const [maxDetections, setMaxDetections] = useState(initialState.maxDetections);
  const [scoreThreshold, setScoreThreshold] = useState(initialState.scoreThreshold);
  const [nmsRadius, setNmsRadius] = useState(initialState.nmsRadius);
  const [numKeypointForMatching, setNumKeypointForMatching] = useState(
    initialState.numKeypointForMatching
  );
  const [refineSteps, setRefineSteps] = useState(initialState.refineSteps);

  useEffect(() => {
    resolveVideoProcessor().then((videoProcessor) => {
      videoProcessorRef.current = videoProcessor;
    });
  }, []);

  useEffect(() => {
    const state = {
      resolutionId,
      resolutionIdProcessing,
      architecture,
      segmentationThreshold,
      edgeBlurAmount,
      outputStride,
      internalResolution,
      quantBytes,
      multiplier,
      maxDetections,
      scoreThreshold,
      nmsRadius,
      numKeypointForMatching,
      refineSteps,
      videoDeviceId,
    };

    localStorage.setItem('state', JSON.stringify(state));
  }, [
    architecture,
    edgeBlurAmount,
    internalResolution,
    maxDetections,
    multiplier,
    nmsRadius,
    numKeypointForMatching,
    outputStride,
    quantBytes,
    refineSteps,
    resolutionId,
    resolutionIdProcessing,
    scoreThreshold,
    segmentationThreshold,
    videoDeviceId,
  ]);

  const resetState = useCallback(() => {
    setResolutionId(defaultState.resolutionId);
    setResolutionIdProcessing(defaultState.resolutionIdProcessing);
    setArchitecture(defaultState.architecture);
    setSegmentationThreshold(defaultState.segmentationThreshold);
    setEdgeBlurAmount(defaultState.edgeBlurAmount);
    setOutputStride(defaultState.outputStride);
    setInternalResolution(defaultState.internalResolution);
    setQuantBytes(defaultState.quantBytes);
    setMultiplayer(defaultState.multiplier);
    setMaxDetections(defaultState.maxDetections);
    setScoreThreshold(defaultState.scoreThreshold);
    setNmsRadius(defaultState.nmsRadius);
    setNumKeypointForMatching(defaultState.numKeypointForMatching);
    setRefineSteps(defaultState.refineSteps);
  }, []);

  useEffect(() => {
    if (architecture === 'MobileNetV1') {
      setInternalResolution(defaultMobileNetInternalResolution);
      setOutputStride(defaultMobileNetStride);
      setValuesStride(defaultMobileNetValuesStride);
      setMultiplayer(defaultMobileNetMultiplier);
      setValuesMultiplayer(defaultMobileNetValuesMultiplier);
    } else {
      // architecture === "ResNet50"

      setInternalResolution(defaultResNetInternalResolution);
      setOutputStride(defaultResNetStride);
      setValuesStride(defaultResNetValuesStride);
      setMultiplayer(defaultResNetMultiplier);
      setValuesMultiplayer(defaultResNetValuesMultiplayer);
    }

    setQuantBytes(defaultState.quantBytes);
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
    if (resolutionList.length > 0) {
      const index = resolutionList.findIndex((resolution) => {
        return resolution.id === resolutionId;
      });

      setResolutionListProcessing(resolutionList.slice(0, index + 1));
      setResolutionIdProcessing(initialState.resolutionIdProcessing);
    }
  }, [resolutionList, resolutionId]);

  useEffect(() => {
    if (resolutionList.length > 0) {
      setScale(calcScale(resolutionId, resolutionIdProcessing));
    }
  }, [resolutionList, resolutionId, resolutionIdProcessing]);

  useEffect(() => {
    if (!videoDeviceId || !resolutionId || videoDeviceList.length === 0) {
      return;
    }

    const { width, height } = getResolutionById(resolutionId);

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
          algorithm,
          segmentationThreshold,
          edgeBlurAmount,
          scale,
          architecture,
          outputStride,
          multiplier,
          quantBytes,
          internalResolution,
          multiPersonDecoding: {
            maxDetections,
            scoreThreshold,
            nmsRadius,
            numKeypointForMatching,
            refineSteps,
          },
          mediaStream: mediaStreamOriginal,
        })
        .then(setMediaStreamProcessed)
        .then(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaStreamOriginal]);

  const updateProcessingDebouncedRef = useRef(null);

  useEffect(() => {
    if (updateProcessingDebouncedRef.current) {
      updateProcessingDebouncedRef.current.cancel();
    }

    const updateProcessingDebounced = debounce(() => {
      if (videoProcessorRef.current && mediaStreamOriginal && mediaStreamProcessed) {
        // update processing

        setLoading(true);
        videoProcessorRef.current
          .changeParams({
            algorithm,
            edgeBlurAmount,
            internalResolution,
            segmentationThreshold,
            scale,
            multiPersonDecoding: {
              maxDetections,
              scoreThreshold,
              nmsRadius,
              numKeypointForMatching,
              refineSteps,
            },
          })
          .then(() => {
            setLoading(false);
          });
      }
    }, 300);

    updateProcessingDebouncedRef.current = updateProcessingDebounced;
  }, [
    edgeBlurAmount,
    internalResolution,
    segmentationThreshold,
    scale,
    mediaStreamOriginal,
    mediaStreamProcessed,
    maxDetections,
    scoreThreshold,
    nmsRadius,
    numKeypointForMatching,
    refineSteps,
  ]);

  const restartDebouncedRef = useRef(null);

  useEffect(() => {
    if (restartDebouncedRef.current) {
      restartDebouncedRef.current.cancel();
    }

    const restartDebounced = debounce(() => {
      if (restartDebouncedRef.current && mediaStreamOriginal && mediaStreamProcessed) {
        setLoading(true);
        videoProcessorRef.current
          .restart({
            algorithm,
            segmentationThreshold,
            edgeBlurAmount,
            scale,
            architecture,
            outputStride,
            multiplier,
            quantBytes,
            internalResolution,
            multiPersonDecoding: {
              maxDetections,
              scoreThreshold,
              nmsRadius,
              numKeypointForMatching,
              refineSteps,
            },
            mediaStream: mediaStreamOriginal,
          })
          .then(setMediaStreamProcessed)
          .then(() => {
            setLoading(false);
          });
      }
    }, 300);

    restartDebouncedRef.current = restartDebounced;
  }, [
    edgeBlurAmount,
    internalResolution,
    segmentationThreshold,
    scale,
    mediaStreamOriginal,
    mediaStreamProcessed,
    maxDetections,
    scoreThreshold,
    nmsRadius,
    numKeypointForMatching,
    refineSteps,
    architecture,
    outputStride,
    multiplier,
    quantBytes,
  ]);

  useEffect(() => {
    updateProcessingDebouncedRef.current();
  }, [edgeBlurAmount, internalResolution, segmentationThreshold, scale]);

  useEffect(() => {
    if (videoProcessorRef.current && mediaStreamProcessed && mediaStreamOriginal) {
      // reload model

      updateProcessingDebouncedRef.current.cancel();
      restartDebouncedRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaStreamOriginal, architecture, outputStride, multiplier, quantBytes]);

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
                    <option value="MobileNetV1">MobileNetV1</option>
                    <option value="ResNet50">ResNet50</option>
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem>
                <FormControl variant="filled" className={classes.formControl}>
                  <InputLabel htmlFor="resolutionProcessing">Resolution for processing</InputLabel>
                  <Select
                    native
                    value={resolutionIdProcessing}
                    onChange={resolveHandleChangeInput(setResolutionIdProcessing)}
                    inputProps={{
                      name: 'resolutionProcessing',
                      id: 'resolutionProcessing',
                    }}
                  >
                    {resolutionListProcessing.map(renderItemResolution)}
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem>
                <FormControl variant="filled" className={classes.formControl}>
                  <InputLabel htmlFor="outputStride">outputStride (smaller - better)</InputLabel>
                  <Select
                    native
                    value={outputStride}
                    onChange={resolveHandleChangeInput(setOutputStride)}
                    inputProps={{
                      name: 'outputStride',
                      id: 'outputStride',
                    }}
                  >
                    {valuesStride.map((value) => {
                      return (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem>
                <FormControl variant="filled" className={classes.formControl}>
                  <InputLabel htmlFor="internalResolution">
                    Internal resolution (larger - better)
                  </InputLabel>
                  <Select
                    native
                    value={internalResolution}
                    onChange={resolveHandleChangeInput(setInternalResolution)}
                    inputProps={{
                      name: 'internalResolution',
                      id: 'internalResolution',
                    }}
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="full">full</option>
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem>
                <FormControl variant="filled" className={classes.formControl}>
                  <InputLabel htmlFor="quantBytes">quantBytes (larger - better)</InputLabel>
                  <Select
                    native
                    value={quantBytes}
                    onChange={resolveHandleChangeInput(setQuantBytes)}
                    inputProps={{
                      name: 'quantBytes',
                      id: 'quantBytes',
                    }}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem>
                <FormControl variant="filled" className={classes.formControl}>
                  <InputLabel htmlFor="multiplier">multiplier</InputLabel>
                  <Select
                    native
                    value={multiplier}
                    onChange={resolveHandleChangeInput(setMultiplayer)}
                    inputProps={{
                      name: 'multiplier',
                      id: 'multiplier',
                    }}
                  >
                    {valuesMultiplier.map((value) => {
                      return (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
              </ListItem>
            </List>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Segmentation</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.noPadding}>
                <List className={classes.fullWidth}>
                  <ListItem>
                    <FormControl variant="filled" className={classes.formControl}>
                      <Typography gutterBottom>SegmentationThreshold</Typography>
                      <Slider
                        marks
                        valueLabelDisplay="on"
                        min={0}
                        step={0.1}
                        max={1}
                        value={segmentationThreshold}
                        onChange={resolveHandleInputChange(setSegmentationThreshold)}
                      />
                    </FormControl>
                  </ListItem>
                  <ListItem>
                    <FormControl variant="filled" className={classes.formControl}>
                      <Typography gutterBottom>EdgeBlurAmount</Typography>
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
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>MultiPersonDecoding</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.noPadding}>
                <List className={classes.fullWidth}>
                  <ListItem>
                    <FormControl variant="filled" className={classes.formControl}>
                      <Typography gutterBottom>maxDetections</Typography>
                      <Slider
                        marks
                        valueLabelDisplay="on"
                        min={0}
                        step={1}
                        max={20}
                        value={maxDetections}
                        onChange={resolveHandleInputChange(setMaxDetections)}
                      />
                    </FormControl>
                  </ListItem>
                  <ListItem>
                    <FormControl variant="filled" className={classes.formControl}>
                      <Typography gutterBottom>scoreThreshold</Typography>
                      <Slider
                        marks
                        valueLabelDisplay="on"
                        min={0.0}
                        step={0.1}
                        max={1.0}
                        value={scoreThreshold}
                        onChange={resolveHandleInputChange(setScoreThreshold)}
                      />
                    </FormControl>
                  </ListItem>
                  <ListItem>
                    <FormControl variant="filled" className={classes.formControl}>
                      <Typography gutterBottom>nmsRadius</Typography>
                      <Slider
                        marks
                        valueLabelDisplay="on"
                        min={0}
                        step={1}
                        max={30}
                        value={nmsRadius}
                        onChange={resolveHandleInputChange(setNmsRadius)}
                      />
                    </FormControl>
                  </ListItem>
                  <ListItem>
                    <FormControl variant="filled" className={classes.formControl}>
                      <Typography gutterBottom>numKeypointForMatching</Typography>
                      <Slider
                        marks
                        valueLabelDisplay="on"
                        min={1}
                        step={1}
                        max={17}
                        value={numKeypointForMatching}
                        onChange={resolveHandleInputChange(setNumKeypointForMatching)}
                      />
                    </FormControl>
                  </ListItem>
                  <ListItem>
                    <FormControl variant="filled" className={classes.formControl}>
                      <Typography gutterBottom>refineSteps</Typography>
                      <Slider
                        marks
                        valueLabelDisplay="on"
                        min={1}
                        step={1}
                        max={10}
                        value={refineSteps}
                        onChange={resolveHandleInputChange(setRefineSteps)}
                      />
                    </FormControl>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
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
