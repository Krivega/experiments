const VIDEO_KIND = 'videoinput';
const AUDIO_INPUT_KIND = 'audioinput';
const AUDIO_OUTPUT_KIND = 'audiooutput';

const resolveFilterIncludingDevices = (prop) => {
  return (value) => {
    return (devices: MediaDeviceInfo[] = []): MediaDeviceInfo[] => {
      return devices.filter((device) => {
        return device[prop] === value;
      });
    };
  };
};

export const resolveFilterExcludingDevices = (prop) => {
  return (value) => {
    return (devices = []) => {
      return devices.filter((device) => {
        return device[prop] !== value;
      });
    };
  };
};

export const getVideoDevices = resolveFilterIncludingDevices('kind')(VIDEO_KIND);
export const getAudioInputDevices = resolveFilterIncludingDevices('kind')(AUDIO_INPUT_KIND);
export const getAudioOutputDevices = resolveFilterIncludingDevices('kind')(AUDIO_OUTPUT_KIND);
export const resolveGetDevicesByLabel = resolveFilterIncludingDevices('label');

const resolveFindDevice = (prop) => {
  return (value) => {
    return (devices = []): MediaDeviceInfo | undefined => {
      return devices.find((device) => {
        return device[prop] === value;
      });
    };
  };
};

export const findDeviceById = resolveFindDevice('deviceId');
