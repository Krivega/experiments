import { AUDIO_OUTPUT_KIND } from './constants';
import logger from './logger';

const permissionDescriptorCamera: PermissionDescriptor = { name: 'camera' as PermissionName };
const permissionDescriptorMicrophone: PermissionDescriptor = {
  name: 'microphone' as PermissionName,
};

const hasGrantedPermission = (status: PermissionStatus) => {
  return status.state === 'granted';
};

export const hasAvailableCheckPermissions = () => {
  const isAvailableCheckPermissions =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    !!navigator.permissions;

  logger('isAvailableCheckPermissions', isAvailableCheckPermissions);

  return isAvailableCheckPermissions;
};

export const checkPermission = async (permissionDescriptor: PermissionDescriptor) => {
  const isAvailableCheckPermissions = hasAvailableCheckPermissions();

  logger('isAvailableCheckPermissions', isAvailableCheckPermissions);

  if (!isAvailableCheckPermissions) {
    return false;
  }

  return navigator.permissions.query(permissionDescriptor).then((status) => {
    logger('checkPermission', { permissionDescriptor, status });

    return hasGrantedPermission(status);
  });
};

export const checkPermissionCamera = async () => {
  return checkPermission(permissionDescriptorCamera);
};

export const checkPermissionMicrophone = async () => {
  return checkPermission(permissionDescriptorMicrophone);
};

export const checkPermissionAudioOutput = async (devices: MediaDeviceInfo[]) => {
  const isAvailableAudioOutputDevice = devices.some((device) => {
    return device.kind === AUDIO_OUTPUT_KIND;
  });

  return isAvailableAudioOutputDevice;
};
