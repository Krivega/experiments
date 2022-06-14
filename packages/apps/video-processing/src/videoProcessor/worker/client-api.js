/* eslint-disable no-restricted-globals */

import { resolveActionToClient } from '../../utils/worker';

export const handleInitActionToClient = resolveActionToClient(self, 'init');
export const handleProcessActionToClient = resolveActionToClient(self, 'process');
export const handleChangeParamsActionToClient = resolveActionToClient(self, 'changeParams');
