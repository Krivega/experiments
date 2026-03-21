import { getMediaStreamOrigin, stopTracksMediaStream } from '@experiments/mediastream-api';
import { resolvers } from '@experiments/utils';
import { CancelableRequest } from '@krivega/cancelable-promise';

import { AUDIO_INPUT_KIND, VIDEO_KIND } from './constants';
import createStateDeviceFromSystemDevice from './createStateDeviceFromSystemDevice';
import logger from './logger';
import {
  checkPermissionAudioOutput,
  checkPermissionCamera,
  checkPermissionMicrophone,
  hasAvailableCheckPermissions,
} from './permissions';

import type { TMediaDeviceInfoWithID } from './createStateDeviceFromSystemDevice';

const {
  catchResolve,
  combineThenCombinator,
  identityPromiseResolve,
  tapThenCombinator,
  thenResolve,
  pipe,
} = resolvers.functions;

const TEN_MINUTES_FOR_STARTED_REQUEST = 1000 * 60 * 10;

const hasLabel = ({ label }: { label?: string } = {}): boolean => {
  return label !== undefined && label !== '';
};

const hasWithoutLabel = (devices: MediaDeviceInfo[]) => {
  return devices.length > 0 && !devices.every(hasLabel);
};

const requestDevices = async () => {
  const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();

  logger('enumeratedDevices: O%', { enumeratedDevices });

  return enumeratedDevices;
};

const checkPermissions = async (devices: MediaDeviceInfo[]) => {
  return Promise.all([
    checkPermissionCamera(),
    checkPermissionMicrophone(),
    checkPermissionAudioOutput(devices),
  ]).then(([isHavePermissionCamera, isHavePermissionMicrophone, isHavePermissionAudioOutput]) => {
    return { isHavePermissionCamera, isHavePermissionMicrophone, isHavePermissionAudioOutput };
  });
};

const checkPermissionsWithCombinator = combineThenCombinator(
  async ({ valFunc: devices }: { valFunc: MediaDeviceInfo[]; val?: MediaDeviceInfo[] }) => {
    return checkPermissions(devices);
  },
);

const requestDevicesWithPermissions = pipe(
  // for catch "undefined is not an object navigator.mediaDevices.enumerateDevices"
  identityPromiseResolve<MediaDeviceInfo[]>,
  thenResolve(combineThenCombinator(requestDevices)),
  thenResolve(checkPermissionsWithCombinator),
  thenResolve(
    async ({
      valFunc: { isHavePermissionCamera, isHavePermissionMicrophone, isHavePermissionAudioOutput },
      val,
    }) => {
      const { valFunc: devices } = val;

      logger('enumeratedDevices devices after check permissions: O%', { devices });

      const devicesCached = val.val;
      const isAvailableVideoDevice = devices.some((device) => {
        return device.kind === VIDEO_KIND;
      });

      const isAvailableAudioInputDevice = devices.some((device) => {
        return device.kind === AUDIO_INPUT_KIND;
      });
      const isAvailableVideoDeviceCached =
        devicesCached?.some((device) => {
          return device.kind === VIDEO_KIND;
        }) ?? false;
      const isAvailableAudioInputDeviceCached =
        devicesCached?.some((device) => {
          return device.kind === AUDIO_INPUT_KIND;
        }) ?? false;
      const isVideoDeviceAdded = isAvailableVideoDevice && !isAvailableVideoDeviceCached;
      const isAudioInputDeviceAdded =
        isAvailableAudioInputDevice && !isAvailableAudioInputDeviceCached;
      const isCheckPermissions =
        hasAvailableCheckPermissions() && !(isHavePermissionCamera && isHavePermissionMicrophone);

      if (
        isVideoDeviceAdded ||
        isAudioInputDeviceAdded ||
        isCheckPermissions ||
        !isHavePermissionAudioOutput ||
        hasWithoutLabel(devices)
      ) {
        return getMediaStreamOrigin(
          { video: isAvailableVideoDevice, audio: isAvailableAudioInputDevice },
          { waitTimeout: TEN_MINUTES_FOR_STARTED_REQUEST },
        );
      }

      return undefined;
    },
  ),
  catchResolve((error) => {
    logger('error', error);

    return undefined;
  }),
  thenResolve(combineThenCombinator(requestDevices)),

  thenResolve(
    tapThenCombinator(
      async ({
        val: mediaStream,
      }: {
        val: MediaStream | undefined;
        valFunc: MediaDeviceInfo[];
      }) => {
        logger('stopTracksMediaStream !!mediaStream:', !!mediaStream);

        if (mediaStream) {
          return stopTracksMediaStream(mediaStream).catch((error: unknown) => {
            logger('error', error);
          });
        }

        return undefined;
      },
    ),
  ),
  thenResolve(
    ({ valFunc: devices }: { val: MediaStream | undefined; valFunc: MediaDeviceInfo[] }) => {
      logger('devices: O%', { devices });

      return devices;
    },
  ),
);

const convertMediaDevicesInfo = (devices: MediaDeviceInfo[]): MediaDeviceInfo[] => {
  logger('convertMediaDevicesInfo devices: O%', { devices });

  return [...devices].map((device) => {
    const { deviceId, groupId, kind, label } = device;

    return { ...device, deviceId, groupId, kind, label };
  });
};

const addIdToDevices = (devices: MediaDeviceInfo[]) => {
  return devices.map(createStateDeviceFromSystemDevice);
};

const scanDevices = pipe(
  requestDevicesWithPermissions,
  thenResolve(convertMediaDevicesInfo),
  thenResolve(addIdToDevices),
  catchResolve((error) => {
    logger('error', error);

    return [] as TMediaDeviceInfoWithID[];
  }),
);

class RequesterDevices {
  public readonly cancelableRequestDevices: CancelableRequest<
    Parameters<typeof scanDevices>[0],
    ReturnType<typeof scanDevices>
  >;

  public constructor() {
    this.cancelableRequestDevices = new CancelableRequest<
      Parameters<typeof scanDevices>[0],
      ReturnType<typeof scanDevices>
    >(scanDevices, { moduleName: this.constructor.name });
  }

  public get requested() {
    return this.cancelableRequestDevices.requested;
  }

  public request = async (devicesCached: MediaDeviceInfo[]) => {
    return this.cancelableRequestDevices.request(devicesCached);
  };

  public cancelRequest() {
    this.cancelableRequestDevices.cancelRequest();
  }
}

export default RequesterDevices;
