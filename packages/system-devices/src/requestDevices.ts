import { getVideoDevices, getAudioInputDevices } from '@experiments/utils/src/devicesResolvers';
import RequesterDevices from './index';

const requesterDevices = new RequesterDevices();

const requestDevices = ({ setVideoDeviceList, setAudioInputDeviceList }): Promise<void> => {
  return requesterDevices.request([]).then((devices) => {
    setVideoDeviceList(getVideoDevices(devices));
    setAudioInputDeviceList(getAudioInputDevices(devices));
  });
};

export default requestDevices;
