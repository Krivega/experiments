/// <reference types="jest" />

import { isCanceledError } from '@krivega/cancelable-promise';
import { getAvailableDevices } from 'webrtc-mock';

import createStateDeviceFromSystemDevice from '../createStateDeviceFromSystemDevice';
import RequesterDevices from '../RequesterDevices';

import type { TGlobal } from 'webrtc-mock';

declare let global: TGlobal;

const parseObject = <T extends object>(object: T): T => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, unicorn/prefer-structured-clone
  return JSON.parse(JSON.stringify(object));
};

const resolveParseArray = <T extends object>(parameter: keyof T) => {
  return (array: T[]) => {
    return array
      .map((item: T) => {
        return parseObject<T>(item);
      })
      .sort((previous: T, next: T) => {
        const previousValue = previous[parameter];
        const nextValue = next[parameter];

        if (typeof previousValue === 'string' && typeof nextValue === 'string') {
          return previousValue.localeCompare(nextValue);
        }

        if (previousValue > nextValue) {
          return 1;
        }

        if (previousValue < nextValue) {
          return -1;
        }

        return 0;
      });
  };
};
const parseDevices = resolveParseArray<MediaDeviceInfo>('deviceId');

const { setUserNotAccessAll, setCountVideoDevicesAvailable, setCountAudioInDevicesAvailable } =
  global.navigator.mediaDevices;

describe('RequesterDevices', () => {
  let requesterDevices: RequesterDevices;
  let allDevices: MediaDeviceInfo[];

  beforeEach(() => {
    requesterDevices = new RequesterDevices();
    allDevices = getAvailableDevices().map(createStateDeviceFromSystemDevice);
  });

  afterEach(() => {
    setUserNotAccessAll(false);
    setCountVideoDevicesAvailable(1);
    setCountAudioInDevicesAvailable(1);
  });

  it('cancelRequest', async () => {
    expect.assertions(1);

    const request = requesterDevices.request([]);

    requesterDevices.cancelRequest();

    const rejectedError = await request.catch((error: unknown) => {
      return error;
    });

    expect(isCanceledError(rejectedError)).toBe(true);
  });

  it('requested', async () => {
    expect.assertions(3);

    expect(requesterDevices.requested).toBe(false);

    const request = requesterDevices.request([]);

    expect(requesterDevices.requested).toBe(true);

    return request.then(() => {
      expect(requesterDevices.requested).toBe(false);
    });
  });

  it('request: without support', async () => {
    expect.assertions(2);

    const { mediaDevices } = global.navigator;

    // @ts-expect-error
    delete global.navigator.mediaDevices;

    return requesterDevices.request([]).then((devices) => {
      expect(devices).toEqual([]);
      expect(devices).toMatchSnapshot();

      global.navigator.mediaDevices = mediaDevices;
    });
  });

  it('request: available all', async () => {
    expect.assertions(2);

    return requesterDevices.request([]).then((devices) => {
      expect(parseDevices(devices)).toEqual(parseDevices(allDevices));
      expect(devices).toMatchSnapshot();
    });
  });

  it('request: not available video', async () => {
    expect.assertions(2);
    setCountVideoDevicesAvailable(0);

    allDevices = getAvailableDevices().map(createStateDeviceFromSystemDevice);

    return requesterDevices.request([]).then((devices) => {
      expect(parseDevices(devices)).toEqual(parseDevices(allDevices));
      expect(devices).toMatchSnapshot();
    });
  });

  it('request: not available audio', async () => {
    expect.assertions(2);
    setCountVideoDevicesAvailable(0);

    allDevices = getAvailableDevices().map(createStateDeviceFromSystemDevice);

    return requesterDevices.request([]).then((devices) => {
      expect(parseDevices(devices)).toEqual(parseDevices(allDevices));
      expect(devices).toMatchSnapshot();
    });
  });

  it('request: not available audio and video', async () => {
    expect.assertions(2);
    setCountVideoDevicesAvailable(0);
    setCountAudioInDevicesAvailable(0);

    allDevices = getAvailableDevices().map(createStateDeviceFromSystemDevice);

    return requesterDevices.request([]).then((devices) => {
      expect(parseDevices(devices)).toEqual(parseDevices(allDevices));
      expect(devices).toMatchSnapshot();
    });
  });

  it('request: available 2 video devices', async () => {
    expect.assertions(2);
    setCountVideoDevicesAvailable(2);

    allDevices = getAvailableDevices().map(createStateDeviceFromSystemDevice);

    return requesterDevices.request([]).then((devices) => {
      expect(parseDevices(devices)).toEqual(parseDevices(allDevices));
      expect(devices).toMatchSnapshot();
    });
  });

  it('request: user not access audio and video', async () => {
    expect.assertions(2);
    setUserNotAccessAll(true);

    allDevices = getAvailableDevices().map(createStateDeviceFromSystemDevice);

    return requesterDevices.request([]).then((devices) => {
      expect(parseDevices(devices)).toEqual(parseDevices(allDevices));
      expect(devices).toMatchSnapshot();
    });
  });
});
