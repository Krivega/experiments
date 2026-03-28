/// <reference types="jest" />
import doMockInternal from './doMockInternal';

const doMock = () => {
  doMockInternal();

  jest.doMock('@experiments/utils', () => {
    const originalModule =
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      jest.requireActual<typeof import('@experiments/utils')>('@experiments/utils');

    return {
      ...originalModule,
      imageUtils: {
        ...originalModule.imageUtils,
        getImageFromDataUrl: async () => {},
      },
      __esModule: true,
    };
  });
};

export default doMock;
