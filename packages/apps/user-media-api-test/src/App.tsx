import React, { useEffect, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import { getMediaStream } from '@experiments/mediastream-api';
import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';
import { getVideoDevices } from '@experiments/utils/src/devicesResolvers';
import Media from '@experiments/components/src/Media';
import resolutionsListAll, { ID_720P } from '@experiments/system-devices/src/resolutionsList';
import type { TResolution } from '@experiments/system-devices/src/resolutionsList';
import RequesterDevices from '@experiments/system-devices/src';

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

const defaultState = {
  resolutionId: ID_720P,
  videoDeviceId: '',
  edgeBlurAmount: 4,
};
// @ts-ignore
const storedState = JSON.parse(localStorage.getItem('state')) || {};
const initialState = { ...defaultState, ...storedState };

const App = () => {
  const classes = useStyles();
  const [isInitialized, setInitialized] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(true);
  const [mediaStreamOriginal, setMediaStreamOriginal] = useState<MediaStream | null>(null);
  const [mediaStreamProcessed, setMediaStreamProcessed] = useState<MediaStream | null>(null);
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceFromId] = useState<string>(initialState.videoDeviceId);
  const [resolutionList, setResolutionList] = useState<TResolution[]>([]);
  const [resolutionId, setResolutionId] = useState<string>(initialState.resolutionId);

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
