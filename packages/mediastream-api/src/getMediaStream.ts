import getMediaStreamOrigin from './getMediaStreamOrigin';
import prepareConstraints from './prepareConstraints';

const getMediaStream = async ({
  options,
  optionsConstraints,
}: {
  options?: { waitTimeout?: number };
  optionsConstraints: Parameters<typeof prepareConstraints>[0];
}) => {
  const constraints = prepareConstraints(optionsConstraints);

  return getMediaStreamOrigin(constraints, options);
};

export default getMediaStream;
