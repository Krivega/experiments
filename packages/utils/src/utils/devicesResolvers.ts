const VIDEO_KIND = 'videoinput';
const AUDIO_INPUT_KIND = 'audioinput';
const AUDIO_OUTPUT_KIND = 'audiooutput';

const resolveFilterIncludingDevices = (property: keyof MediaDeviceInfo) => {
  return (value: number | string) => {
    return <T extends MediaDeviceInfo = MediaDeviceInfo>(devices: T[] = []): T[] => {
      return devices.filter((device) => {
        return device[property] === value;
      });
    };
  };
};

export const resolveFilterExcludingDevices = <T extends MediaDeviceInfo = MediaDeviceInfo>(
  property: keyof MediaDeviceInfo,
) => {
  return (value: number | string) => {
    return (devices: T[] = []) => {
      return devices.filter((device) => {
        return device[property] !== value;
      });
    };
  };
};

export const getVideoDevices = resolveFilterIncludingDevices('kind')(VIDEO_KIND);
export const getAudioInputDevices = resolveFilterIncludingDevices('kind')(AUDIO_INPUT_KIND);
export const getAudioOutputDevices = resolveFilterIncludingDevices('kind')(AUDIO_OUTPUT_KIND);
export const resolveGetDevicesByLabel = resolveFilterIncludingDevices('label');

const resolveFindDevice = (property: keyof MediaDeviceInfo) => {
  return (value: number | string) => {
    return <T extends MediaDeviceInfo = MediaDeviceInfo>(devices: T[] = []): T | undefined => {
      return devices.find((device) => {
        return device[property] === value;
      });
    };
  };
};

export const findDeviceById = resolveFindDevice('deviceId');
