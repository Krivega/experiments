type TMedia = HTMLAudioElement | HTMLVideoElement;

const setSinkId = async (
  _mediaElement: TMedia,
  sinkId?: string,
  debug: (message: string, ...parameters: unknown[]) => void = () => {},
): Promise<void> => {
  const mediaElement = _mediaElement as TMedia & {
    setSinkId?: (sinkId: string) => Promise<void>;
    sinkId?: string;
  };

  const isChangedSinkId = mediaElement.sinkId !== sinkId;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const isSetted = mediaElement.sinkId !== undefined && mediaElement.sinkId !== '';
  const isNeedToSetSinkId = isChangedSinkId && (isSetted || sinkId !== 'default');
  const isValidSinkId = sinkId !== undefined && sinkId !== '';

  debug('setSinkId ', typeof mediaElement.sinkId, { sinkId, mediaElSinkId: mediaElement.sinkId });

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (mediaElement.setSinkId !== undefined && isValidSinkId && isNeedToSetSinkId) {
    debug('setSinkId sinkId !!!SET!!!', sinkId);

    return mediaElement.setSinkId(sinkId).catch((error: unknown) => {
      debug('setSinkId error', mediaElement, error);
    });
  }

  return undefined;
};

export default setSinkId;
