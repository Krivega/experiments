export const MOCK_UUID = 'uuid-mocked';

jest.mock('@/shared/uuidV4', () => {
  return {
    uuidV4: () => {
      return MOCK_UUID;
    },
  };
});
