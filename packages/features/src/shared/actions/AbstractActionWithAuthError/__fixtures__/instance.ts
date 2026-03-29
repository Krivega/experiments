const instance = {
  isActionInProgress: false,
  startAction: jest.fn(),
  endAction: jest.fn(),
};

export type TInstance = typeof instance;

export default instance;
