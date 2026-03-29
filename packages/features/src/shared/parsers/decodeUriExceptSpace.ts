import logger from '@/logger';

const ENCODED_SPACE = '%20';

const decodeUriExceptSpace = (encodedUri: string) => {
  try {
    return encodedUri.split(ENCODED_SPACE).map(decodeURI).join(ENCODED_SPACE);
  } catch (error: unknown) {
    logger('Failed to decode URI:', error);

    return encodedUri;
  }
};

export default decodeUriExceptSpace;
