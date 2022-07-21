import getResolutionsByCapabilities from '@experiments/system-devices/src/getResolutionsByCapabilities';
import getVideoTracks from '@experiments/mediastream-api/src/getVideoTracks';

const onInitMedia = ({ mediaStream, setResolutionList, setInitialized }) => {
  const videoTrack = getVideoTracks(mediaStream)[0];

  if (videoTrack.getCapabilities) {
    const capabilities = videoTrack.getCapabilities();

    const resolutionsByCapabilities = getResolutionsByCapabilities(capabilities);

    setResolutionList(resolutionsByCapabilities);
    setInitialized(true);
  }
};

export default onInitMedia;
