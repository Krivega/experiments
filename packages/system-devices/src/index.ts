import flow from 'lodash/flow';
import { CancelableRequest } from '@krivega/cancelable-promise';
import {
  identityPromiseResolve,
  thenResolve,
  catchResolve,
  combineThenCombinator,
  tapThenCombinator,
} from '@experiments/utils/src/functions';
import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';
import { getMediaStreamOrigin } from '@experiments/mediastream-api';
import createStateDeviceFromSystemDevice from './createStateDeviceFromSystemDevice';
import { VIDEO_KIND, AUDIO_INPUT_KIND } from './constants';
import {
  checkPermissionCamera,
  checkPermissionMicrophone,
  hasAvailableCheckPermissions,
} from './permissions';

const hasLabel = ({ label }: { label?: string } = {}) => {
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
    const isAvailableVideoDeviceCached = devicesCached.some((device) => {
      return device.kind === VIDEO_KIND;
    });
    const isAvailableAudioInputDeviceCached = devicesCached.some((device) => {
      return device.kind === AUDIO_INPUT_KIND;
    });
    const isVideoDeviceAdded = isAvailableVideoDevice && !isAvailableVideoDeviceCached;
    const isAudioInputDeviceAdded =
      isAvailableAudioInputDevice && !isAvailableAudioInputDeviceCached;

    if (
      isVideoDeviceAdded ||
      isAudioInputDeviceAdded ||
      (hasAvailableCheckPermissions() && !isHavePermissions) ||
      hasWithoutLabel(devices)
    ) {
      return getMediaStreamOrigin(
        { video: isAvailableVideoDevice, audio: isAvailableAudioInputDevice },
        { waitTimeout: 1000 * 60 * 10 } // 10 mins for started request
      );
    }

    return Promise.resolve();
  }),
  catchResolve((error) => {
    console.log('error', error);
  }),
  thenResolve(combineThenCombinator(requestDevices)),
  thenResolve(
    tapThenCombinator(({ val: mediaStream }) => {
      if (mediaStream) {
        return stopTracksMediaStream(mediaStream);
      }

      return Promise.resolve();
    })
  ),
  thenResolve(({ valFunc: devices }: { valFunc: MediaDeviceInfo[] }) => {
    return devices;
  })
);

const convertMediaDevicesInfo = (devices: MediaDeviceInfo[]) => {
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
const scanDevices: (devicesCached?: MediaDeviceInfo[]) => Promise<MediaDeviceInfo[]> = flow(
  requestDevicesWithPermissions,
  thenResolve(convertMediaDevicesInfo),
  thenResolve(addIdToDevices),
  catchResolve((error) => {
    console.log('error', error);

    return [];
  })
);

export default class RequesterDevices {
  cancelableRequestDevices: CancelableRequest<
    Parameters<typeof scanDevices>[0],
    ReturnType<typeof scanDevices>
  >;

  constructor() {
    this.cancelableRequestDevices = new CancelableRequest<
      Parameters<typeof scanDevices>[0],
      ReturnType<typeof scanDevices>
    >(scanDevices, this.constructor.name);
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
