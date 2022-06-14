import flow from 'lodash/flow';
import { CancelableRequest } from '@krivega/cancelable-promise';
import {
  identityPromiseResolve,
  thenResolve,
  catchResolve,
  combineThenCombinator,
  tapThenCombinator,
} from '../utils/functions';
import stopTracksMediaStream from '../mediastreamApi/stopTracksMediaStream';
import { getMediaStreamOrigin } from '../mediastreamApi';
import createStateDeviceFromSystemDevice from './createStateDeviceFromSystemDevice';
import { VIDEO_KIND, AUDIO_INPUT_KIND } from './constants';
import {
  checkPermissionCamera,
  checkPermissionMicrophone,
  hasAvailableCheckPermissions,
} from './permissions';

const hasLabel = ({ label } = {}) => {
  return !!label;
};
const hasWithoutLabel = (devices) => {
  return devices.length > 0 && !devices.every(hasLabel);
};
const requestDevices = () => {
  return navigator.mediaDevices.enumerateDevices();
};
const checkPermissions = () => {
  return Promise.all([checkPermissionCamera(), checkPermissionMicrophone()]).then(
    ([isHavePermissionCamera, isHavePermissionMicrophone]) => {
      return isHavePermissionCamera && isHavePermissionMicrophone;
    }
  );
};
const hasChangedDevicesFromCache = ({ devices, devicesCached }) => {
  return (
    devices.length !== devicesCached.length ||
    !devices.every((device, index) => {
      const deviceCached = devicesCached[index];

      return (
        device.deviceId === deviceCached.deviceId &&
        device.label === deviceCached.label &&
        device.kind === deviceCached.kind
      );
    })
  );
};

const requestDevicesWithPermissions = flow(
  identityPromiseResolve, // for catch "undefined is not an object navigator.mediaDevices.enumerateDevices"
  thenResolve(combineThenCombinator(requestDevices)),
  thenResolve(combineThenCombinator(checkPermissions)),
  thenResolve(({ valFunc: isHavePermissions, val: { valFunc: devices, val: devicesCached } }) => {
    const isAvailableVideoDevice = devices.some((device) => {
      return device.kind === VIDEO_KIND;
    });
    const isAvailableAudioInputDevice = devices.some((device) => {
      return device.kind === AUDIO_INPUT_KIND;
    });
    const isAvailableAnyDevice = isAvailableVideoDevice || isAvailableAudioInputDevice;

    if (
      isAvailableAnyDevice &&
      ((hasAvailableCheckPermissions() && !isHavePermissions) ||
        hasWithoutLabel(devices) ||
        hasChangedDevicesFromCache({ devices, devicesCached }))
    ) {
      return getMediaStreamOrigin(
        { video: isAvailableVideoDevice, audio: isAvailableAudioInputDevice },
        { waitTimeout: 1000 * 60 * 10 } // 10 mins for started request
      );
    }

    return Promise.resolve();
  }),
  catchResolve((error) => {
    // eslint-disable-next-line no-console
    console.log(' catchResolve ~ error', error);
  }),
  thenResolve(combineThenCombinator(requestDevices)),
  thenResolve(
    tapThenCombinator(({ valFunc: devices, val: mediaStream }) => {
      if (mediaStream) {
        return stopTracksMediaStream(mediaStream);
      }

      return Promise.resolve();
    })
  ),
  thenResolve(({ valFunc: devices }) => {
    return devices;
  })
);

const convertMediaDevicesInfo = (devices) => {
  return Array.from(devices).map(({ deviceId, groupId, kind, label }) => {
    return {
      deviceId,
      groupId,
      kind,
      label,
    };
  });
};
const addIdToDevices = (devices) => {
  return devices.map(createStateDeviceFromSystemDevice);
};
const scanDevices = flow(
  requestDevicesWithPermissions,
  thenResolve(convertMediaDevicesInfo),
  thenResolve(addIdToDevices),
  catchResolve((error) => {
    // eslint-disable-next-line no-console
    console.log(' catchResolve ~ error', error);

    return [];
  })
);

export default class RequesterDevices {
  constructor() {
    this.cancelableRequestDevices = new CancelableRequest(scanDevices, this.constructor.name);
  }

  request = (devicesCached) => {
    return this.cancelableRequestDevices.request(devicesCached);
  };

  cancelRequest() {
    this.cancelableRequestDevices.cancelRequest();
  }

  get requested() {
    return this.cancelableRequestDevices.requested;
  }
}
