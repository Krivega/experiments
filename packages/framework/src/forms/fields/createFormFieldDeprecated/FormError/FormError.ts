import { types as typesMST } from 'mobx-state-tree';

import { CLIENT_ERROR_TYPE, SERVER_ERROR_TYPE } from './constants';

import type { TInstanceModel } from '@experiments/mst-tools';

const ModelFormError = typesMST.model({
  value: typesMST.string,
  type: typesMST.enumeration([CLIENT_ERROR_TYPE, SERVER_ERROR_TYPE]),
});

export type TInstanceModelFormError = TInstanceModel<typeof ModelFormError>;

export default ModelFormError;
