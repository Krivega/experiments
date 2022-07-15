const permissionDescriptorCamera = { name: 'camera' };
const permissionDescriptorMicrophone = { name: 'microphone' };

const hasGrantedPermission = (status) => {
  return status.state === 'granted';
};

export const hasAvailableCheckPermissions = () => {
  return !!navigator.permissions;
};

export const checkPermission = (permissionDescriptor) => {
  if (!hasAvailableCheckPermissions()) {
    return Promise.resolve(false);
  }

  return navigator.permissions.query(permissionDescriptor).then(hasGrantedPermission);
};

export const checkPermissionCamera = () => {
  return checkPermission(permissionDescriptorCamera);
};

export const checkPermissionMicrophone = () => {
  return checkPermission(permissionDescriptorMicrophone);
};
