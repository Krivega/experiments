import Composer from '../Composer';

import type { TStore } from '../../store';
import type { TFeatures } from '../types';

describe('Composer', () => {
  const mockComponents = {
    ChatMessagesList: jest.fn(),
    CommonModeratorActions: jest.fn(),
    EnableChatAction: jest.fn(),
    ChatNewMessageForm: jest.fn(),
    ChatCountUnreadMessages: jest.fn(),
  };

  const mockStore = {
    state: {
      hasNotSynced: jest.fn().mockReturnValue(false),
      hasNotAvailable: jest.fn().mockReturnValue(false),
      hasSyncInProgress: jest.fn().mockReturnValue(false),
      hasBanned: jest.fn().mockReturnValue(false),
      hasAvailable: jest.fn().mockReturnValue(false),
      hasActive: jest.fn().mockReturnValue(false),
      hasModerator: jest.fn().mockReturnValue(false),
    },
  };

  const mockFeatures: TFeatures = {
    chatMessagesList: { Component: mockComponents.ChatMessagesList },
    commonModeratorActions: { Component: mockComponents.CommonModeratorActions },
    enableChatAction: { Component: mockComponents.EnableChatAction },
    chatNewMessageForm: { Component: mockComponents.ChatNewMessageForm },
    chatCountUnreadMessages: { Component: mockComponents.ChatCountUnreadMessages },
  };

  let composer: Composer;

  beforeEach(() => {
    jest.clearAllMocks();

    composer = new Composer({ store: mockStore as unknown as TStore, features: mockFeatures });
  });

  it('возвращает флаги из propsView', () => {
    const props = composer.getPropsView();

    expect(props.hasNoContent()).toBe(false);
    expect(props.hasNotAvailable()).toBe(false);
    expect(props.hasBanned()).toBe(false);
    expect(props.hasModerator()).toBe(false);
    expect(props.hasLoading()).toBe(false);
    expect(props.hasEnabledModeratorActions()).toBe(false);
  });

  describe('hasLoading', () => {
    it('должен вернуть true если hasSyncInProgress=>true', () => {
      mockStore.state.hasSyncInProgress.mockReturnValue(true);

      expect(composer.getPropsView().hasLoading()).toBe(true);
    });

    it('должен вернуть true если hasAvailable=>true', () => {
      mockStore.state.hasSyncInProgress.mockReturnValue(false);
      mockStore.state.hasAvailable.mockReturnValue(true);

      expect(composer.getPropsView().hasLoading()).toBe(true);
    });

    it('должен вернуть false если hasSyncInProgress и hasAvailable возвращают false', () => {
      mockStore.state.hasSyncInProgress.mockReturnValue(false);
      mockStore.state.hasAvailable.mockReturnValue(false);

      expect(composer.getPropsView().hasLoading()).toBe(false);
    });
  });

  describe('hasEnabledModeratorActions', () => {
    it('должен вернуть false если hasActive=>false и hasModerator=>true', () => {
      mockStore.state.hasActive.mockReturnValue(false);
      mockStore.state.hasModerator.mockReturnValue(true);

      expect(composer.getPropsView().hasEnabledModeratorActions()).toBe(false);
    });

    it('должен вернуть false если hasActive=>true и hasModerator=>false', () => {
      mockStore.state.hasActive.mockReturnValue(true);
      mockStore.state.hasModerator.mockReturnValue(false);

      expect(composer.getPropsView().hasEnabledModeratorActions()).toBe(false);
    });

    it('должен вернуть true если hasActive=>true и hasModerator=>true', () => {
      mockStore.state.hasActive.mockReturnValue(true);
      mockStore.state.hasModerator.mockReturnValue(true);

      expect(composer.getPropsView().hasEnabledModeratorActions()).toBe(true);
    });
  });

  it('создаёт композицию с ожидаемыми компонентами', () => {
    const composition = composer.getComposition();

    expect(typeof composition.ChatMessagesList).toBe('function');
    expect(typeof composition.CommonModeratorActions).toBe('function');
    expect(typeof composition.EnableChatAction).toBe('function');
    expect(composition.ChatNewMessageForm).toBeDefined();
    expect(typeof composition.ChatCountUnreadMessages).toBe('function');
  });

  describe('chatNewMessageForm composition', () => {
    it('должен прокидывать isPollsEnabled=false по умолчанию', () => {
      const internalComposer = composer as unknown as {
        isPollsEnabled: boolean;
      };

      expect(internalComposer.isPollsEnabled).toBe(false);
    });

    it('должен прокидывать isPollsEnabled=true из конструктора', () => {
      const composerWithPolls = new Composer(
        { store: mockStore as unknown as TStore, features: mockFeatures },
        { isPollsEnabled: true },
      );

      const internalComposer = composerWithPolls as unknown as {
        isPollsEnabled: boolean;
      };

      expect(internalComposer.isPollsEnabled).toBe(true);
    });
  });
});
