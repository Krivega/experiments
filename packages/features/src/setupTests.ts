// Импорт обязательно должен быть через "*"
// sonar:disable:typescript:S2208
import * as matchers from 'jest-extended';
// sonar:enable:typescript:S2208

import reactIntlMock from './__mocks__/reactIntl';

expect.extend(matchers);

jest.mock('react-intl', () => {
  return reactIntlMock;
});
