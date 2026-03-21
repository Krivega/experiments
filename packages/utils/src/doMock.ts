/// <reference types="jest" />
import doMockInternal from './doMockInternal';

const doMock = () => {
  doMockInternal();

  jest.doMock('@experiments/utils', () => {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports, @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual<typeof import('@experiments/utils')>('@experiments/utils');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...originalModule,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      imageUtils: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...originalModule.imageUtils,
        getImageFromDataUrl: async () => {},
      },
      __esModule: true,
    };
  });
};

export default doMock;
