type TMedia = HTMLAudioElement | HTMLVideoElement | { volume?: number };

const setVolume = (
  mediaElement: TMedia,
  volume?: number,
  debug: (message: string, ...parameters: unknown[]) => void = () => {},
) => {
  const isChangedVolume = mediaElement.volume !== volume;
  const isSetted = mediaElement.volume !== undefined && mediaElement.volume !== 1;

  debug('setVolume ', typeof mediaElement.volume, { volume, mediaElVolume: mediaElement.volume });

  if (volume !== undefined && isChangedVolume && (isSetted || volume !== 1)) {
    debug('setVolume volume !!!SET!!!', volume);

    // eslint-disable-next-line no-param-reassign
    mediaElement.volume = volume;
  }
};

export default setVolume;
