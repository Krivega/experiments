import Model from '../Model';

import type { TInstance } from '../Model';

describe('Model', () => {
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();
  });

  describe('инициализация', () => {
    it('должен создаваться с начальными значениями', () => {
      expect(instance.isEnableChatInProgress).toBe(false);
      expect(instance.isDisableChatInProgress).toBe(false);
      expect(instance.isClearChatInProgress).toBe(false);
    });
  });

  describe('управление включением чата', () => {
    it('startEnableChatAction должен устанавливать isEnableChatInProgress в true', () => {
      instance.startEnableChatAction();

      expect(instance.isEnableChatInProgress).toBe(true);
    });

    it('endEnableChatAction должен устанавливать isEnableChatInProgress в false', () => {
      instance.startEnableChatAction();
      instance.endEnableChatAction();

      expect(instance.isEnableChatInProgress).toBe(false);
    });
  });

  describe('управление выключением чата', () => {
    it('startDisableChatAction должен устанавливать isDisableChatInProgress в true', () => {
      instance.startDisableChatAction();

      expect(instance.isDisableChatInProgress).toBe(true);
    });

    it('endDisableChatAction должен устанавливать isDisableChatInProgress в false', () => {
      instance.startDisableChatAction();
      instance.endDisableChatAction();

      expect(instance.isDisableChatInProgress).toBe(false);
    });
  });

  describe('управление очисткой чата', () => {
    it('startClearChatAction должен устанавливать isClearChatInProgress в true', () => {
      instance.startClearChatAction();

      expect(instance.isClearChatInProgress).toBe(true);
    });

    it('endClearChatAction должен устанавливать isClearChatInProgress в false', () => {
      instance.startClearChatAction();
      instance.endClearChatAction();

      expect(instance.isClearChatInProgress).toBe(false);
    });
  });
});
