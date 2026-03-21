import { createMediaStreamMock } from 'webrtc-mock';

import prepareConstraints from '../prepareConstraints';

type TConstraintsOptions = Parameters<typeof prepareConstraints>[0] & {
  fromCanvas?: boolean;
  fromAudioContext?: boolean;
};

const createMediaStreamMockWrapped = (
  constraintsOptions: TConstraintsOptions = {},
  parseConstraints = prepareConstraints,
) => {
  const constraints = parseConstraints(constraintsOptions);

  return createMediaStreamMock(constraints, constraintsOptions);
};

export default createMediaStreamMockWrapped;
