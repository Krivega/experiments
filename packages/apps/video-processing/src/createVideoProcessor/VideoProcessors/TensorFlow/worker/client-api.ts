/* eslint-disable no-restricted-globals */

import resolveAPI from './resolveAPI';

const api = resolveAPI(self as unknown as Worker);

export default api;
