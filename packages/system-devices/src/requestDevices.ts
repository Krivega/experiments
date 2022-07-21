import { getVideoDevices } from '@experiments/utils/src/devicesResolvers';
import RequesterDevices from './index';

const requesterDevices = new RequesterDevices();

const requestDevices = ({ setVideoDeviceList }): Promise<void> => {
  return requesterDevices.request([]).then((devices) => {
    setVideoDeviceList(getVideoDevices(devices));
  });
};

export default requestDevices;
