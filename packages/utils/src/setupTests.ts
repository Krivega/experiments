import * as matchers from 'jest-extended';
import 'whatwg-fetch';

import doMockInternal from './doMockInternal';

doMockInternal();

expect.extend(matchers);
