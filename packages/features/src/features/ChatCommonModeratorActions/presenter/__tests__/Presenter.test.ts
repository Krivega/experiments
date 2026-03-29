import Presenter from '../Presenter';

import type { TStore } from '../../store';

describe('Presenter', () => {
  let presenter: Presenter;
  const store = {
    state: {
      hasEnableChatInProgress: jest.fn(),
      hasDisableChatInProgress: jest.fn(),
      hasClearChatInProgress: jest.fn(),
    },
    executableActions: {
      enableChat: {
        execute: jest.fn(),
      },
      disableChat: {
        execute: jest.fn(),
      },
      clearChat: {
        execute: jest.fn(),
      },
    },
    destroy: jest.fn(),
  };

  beforeEach(() => {
    presenter = new Presenter({ store: store as unknown as TStore });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен сбрасывать состояние при вызове диспозера', () => {
    const disposer = presenter.init();

    disposer();

    expect(store.destroy).toHaveBeenCalledTimes(1);
  });

  describe('createPropsView', () => {
    it('должен возвращать все необходимые свойства', () => {
      const props = presenter.createPropsView();

      expect(props.hasEnableChatInProgress).toBeDefined();
      expect(props.hasDisableChatInProgress).toBeDefined();
      expect(props.hasClearChatInProgress).toBeDefined();
      expect(props.onEnableChat).toBeDefined();
      expect(props.onDisableChat).toBeDefined();
      expect(props.onClearChat).toBeDefined();
    });

    it('должен возвращать функции состояния из store.state', () => {
      const props = presenter.createPropsView();

      expect(props.hasEnableChatInProgress).toBe(store.state.hasEnableChatInProgress);
      expect(props.hasDisableChatInProgress).toBe(store.state.hasDisableChatInProgress);
      expect(props.hasClearChatInProgress).toBe(store.state.hasClearChatInProgress);
    });
  });

  describe('onEnableChat', () => {
    it('должен вызывать store.executableActions.enableChat.execute', () => {
      const props = presenter.createPropsView();

      props.onEnableChat();

      expect(store.executableActions.enableChat.execute).toHaveBeenCalledWith(undefined);
    });
  });

  describe('onDisableChat', () => {
    it('должен вызывать store.executableActions.disableChat.execute', () => {
      const props = presenter.createPropsView();

      props.onDisableChat();

      expect(store.executableActions.disableChat.execute).toHaveBeenCalledWith(undefined);
    });
  });

  describe('onClearChat', () => {
    it('должен вызывать store.executableActions.clearChat.execute с параметрами', () => {
      const props = presenter.createPropsView();

      props.onClearChat();

      expect(store.executableActions.clearChat.execute).toHaveBeenCalledWith(undefined);
    });
  });
});
