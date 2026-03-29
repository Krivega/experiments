/// <reference types="jest" />

import type { TBaseExecutableAction, TBaseExecutableActions } from '../types';

const createMockExecutableAction = <TArgs extends unknown[]>(
  canExecuteImpl: (...args: TArgs) => boolean,
  executeImpl: (...args: TArgs) => void = jest.fn(),
): TBaseExecutableAction<TArgs> => {
  return {
    cancel: jest.fn(),
    canExecute: jest.fn(canExecuteImpl),
    execute: jest.fn(executeImpl),
  };
};

describe('TBaseExecutableAction: Совместимость типов', () => {
  describe('canExecute с параметрами', () => {
    it('должен принимать параметры для действий с параметрами', () => {
      const executableAction = createMockExecutableAction((messageId: string) => {
        return messageId.length > 0;
      });

      expect(executableAction.canExecute('test-message-id')).toBe(true);
      expect(executableAction.canExecute('')).toBe(false);
    });

    it('должен работать без параметров для действий без параметров', () => {
      const executableAction = createMockExecutableAction(() => {
        return true;
      });

      expect(executableAction.canExecute()).toBe(true);
    });

    it('должен работать с объектными параметрами', () => {
      type TParams = { id: string; name: string };

      const executableAction = createMockExecutableAction((params: TParams) => {
        return params.id.length > 0 && params.name.length > 0;
      });

      expect(executableAction.canExecute({ id: '123', name: 'Test' })).toBe(true);
      expect(executableAction.canExecute({ id: '', name: 'Test' })).toBe(false);
    });
  });

  describe('TBaseExecutableActions', () => {
    it('должен позволять создавать Record с действиями с разными параметрами', () => {
      const deleteMessageAction = createMockExecutableAction((messageId: string) => {
        return messageId.length > 0;
      });

      const clearChatAction = createMockExecutableAction(() => {
        return true;
      });

      const executableActions: TBaseExecutableActions = {
        deleteMessage: deleteMessageAction,
        clearChat: clearChatAction,
      };

      expect(executableActions.deleteMessage.canExecute('message-123')).toBe(true);
      expect(executableActions.clearChat.canExecute()).toBe(true);
    });
  });
});
