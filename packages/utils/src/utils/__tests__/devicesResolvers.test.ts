/// <reference types="jest" />
import { devicesResolvers } from '..';

const {
  findDeviceById,
  getAudioInputDevices,
  getAudioOutputDevices,
  getVideoDevices,
  resolveFilterExcludingDevices,
  resolveGetDevicesByLabel,
} = devicesResolvers;

const videoInputDeviceMocked = {
  deviceId: '1',
  label: 'videoInputDeviceMocked',
  kind: 'videoinput',
} as MediaDeviceInfo;
const audioInputDeviceMocked = {
  deviceId: '2',
  label: 'audioInputDeviceMocked',
  kind: 'audioinput',
} as MediaDeviceInfo;
const audioOutputDeviceMocked = {
  deviceId: '3',
  label: 'audioOutputDeviceMocked',
  kind: 'audiooutput',
} as MediaDeviceInfo;

const devices = [videoInputDeviceMocked, audioInputDeviceMocked, audioOutputDeviceMocked];

describe('devicesResolvers', () => {
  it('resolveFilterExcludingDevices: should filter devices based on the specified property and value', () => {
    const filterFunction = resolveFilterExcludingDevices('deviceId');
    const filter = filterFunction(audioInputDeviceMocked.deviceId);

    const filteredDevices = filter(devices);

    expect(filteredDevices).toEqual([videoInputDeviceMocked, audioOutputDeviceMocked]);
  });

  it('getVideoDevices: should return video devices', () => {
    const result = getVideoDevices(devices);

    expect(result).toEqual([videoInputDeviceMocked]);
  });

  it('getAudioInputDevices: should return audio input devices', () => {
    const result = getAudioInputDevices(devices);

    expect(result).toEqual([audioInputDeviceMocked]);
  });

  it('getAudioOutputDevices: should return audio output devices', () => {
    const result = getAudioOutputDevices(devices);

    expect(result).toEqual([audioOutputDeviceMocked]);
  });

  it('resolveGetDevicesByLabel: should return device by label', () => {
    const getDevicesByLabel = resolveGetDevicesByLabel(videoInputDeviceMocked.label);

    expect(getDevicesByLabel(devices)).toEqual([videoInputDeviceMocked]);
  });

  it('findDeviceById: should return device by device id', () => {
    const findDevice = findDeviceById(audioOutputDeviceMocked.deviceId);

    expect(findDevice(devices)).toEqual(audioOutputDeviceMocked);
  });
});
