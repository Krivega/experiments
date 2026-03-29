/// <reference types="jest" />
/* eslint-disable max-classes-per-file */
import { resolveSetter } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';

import { BasePresenter } from '../BasePresenter';

import type { ReferenceIdentifier } from 'mobx-state-tree';
import type { IBaseStore, TErrorMessagesDefault } from '../types';

interface ITestStore extends IBaseStore {
  value: string;
}

type IPropsView = { testProp?: string };

type TActions = {
  testAction: () => void;
};

type TStateField<Value> = {
  getValue: () => Value;
  setValue: (value: Value) => void;
  hasDisabled: () => boolean;
};

type TFormField<Value> = TStateField<Value> & {
  getError: () => string | undefined;
  hasValid: () => boolean;
  hasDisabled: () => boolean;
};

type TEqual<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;

// Тестовый класс для доступа к protected методам
class TestPresenter extends BasePresenter<IPropsView, ITestStore, { testField: string }, TActions> {
  private createPropsViewCallCount = 0;

  private createFieldsCallCount = 0;

  private createActionsCallCount = 0;

  private trackCalls = false;

  // Методы для управления отслеживанием вызовов
  public enableCallTracking(): void {
    this.trackCalls = true;
  }

  public disableCallTracking(): void {
    this.trackCalls = false;
  }

  public getCreatePropsViewCallCount(): number {
    return this.createPropsViewCallCount;
  }

  public getCreateFieldsCallCount(): number {
    return this.createFieldsCallCount;
  }

  public getCreateActionsCallCount(): number {
    return this.createActionsCallCount;
  }

  public resetCallCounts(): void {
    this.createPropsViewCallCount = 0;
    this.createFieldsCallCount = 0;
    this.createActionsCallCount = 0;
  }

  // Для тестирования protected методов
  public testClearCache(): void {
    this.clearCache();
  }

  // Для тестирования protected методов
  public testParseStateFieldToPropsView<Value, TValueToView = Value>(
    field: TStateField<Value>,
    options?: {
      parseValueToView?: (value: Value) => TValueToView;
      parseValueToStore?: (value: TValueToView) => Value;
    },
  ) {
    return this.parseStateFieldToPropsView(field, options);
  }

  // Для тестирования protected методов
  public testParseFormFieldToPropsView<Value, TValueToView = Value>(
    field: TFormField<Value>,
    options?: {
      parseValueToView?: (value: Value) => TValueToView;
      parseValueToStore?: (value: TValueToView) => Value;
    },
  ) {
    return this.parseFormFieldToPropsView(field, options);
  }

  // Для тестирования protected методов
  public testParseReferenceFormFieldToPropsView<
    Value extends { id: ReferenceIdentifier } | undefined,
    TValueToView = NonNullable<Value>['id'],
  >(
    field: Omit<TFormField<Value>, 'setValue'> & {
      setValue: (value?: NonNullable<Value>['id']) => void;
    },
    options?: {
      parseValueToView?: (value?: ReferenceIdentifier) => TValueToView;
      parseValueToStore?: (value: TValueToView) => NonNullable<Value>['id'];
    },
  ) {
    return this.parseReferenceFormFieldToPropsView(field, options);
  }

  // Для тестирования protected методов
  public testGetFormattedError(error: string | undefined) {
    return this.getFormattedError(error);
  }

  // Для тестирования protected методов
  public testParseExecutableActionToPropsView<TExecuteArgs extends unknown[]>(executableAction: {
    execute: (...args: TExecuteArgs) => void;
    canExecute: (...args: TExecuteArgs) => boolean;
  }) {
    return this.parseExecutableActionToPropsView<TExecuteArgs>(executableAction);
  }

  // Для тестирования protected свойств
  public getStore(): ITestStore {
    return this.store;
  }

  // Для тестирования protected свойств
  public setErrorMessages(messages: TErrorMessagesDefault): void {
    this.errorMessages = messages;
  }

  public createPropsView(): IPropsView {
    if (this.trackCalls) {
      this.createPropsViewCallCount += 1;
    }

    return { testProp: 'test value' };
  }

  protected createFields(): { testField: string } {
    if (this.trackCalls) {
      this.createFieldsCallCount += 1;
    }

    return { testField: 'test field value' };
  }

  protected createActions(): TActions {
    if (this.trackCalls) {
      this.createActionsCallCount += 1;
    }

    return {
      testAction: () => {
        // пустая реализация для тестов
      },
    };
  }
}

class DefaultFieldsPresenter extends BasePresenter<IPropsView, ITestStore> {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public createPropsView() {
    return { testProp: 'test value' };
  }

  public testClearCache(): void {
    this.clearCache();
  }
}

describe('BasePresenter', () => {
  let store: ITestStore;
  let presenter: TestPresenter;
  let defaultFieldsPresenter: DefaultFieldsPresenter;
  const destroyMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    store = {
      value: 'test value',
      destroy: destroyMock,
    };

    presenter = new TestPresenter({ store });
    defaultFieldsPresenter = new DefaultFieldsPresenter({ store });
  });

  describe('constructor', () => {
    it('должен корректно инициализировать store', () => {
      expect(presenter.getStore()).toBe(store);
    });
  });

  describe('init', () => {
    it('должен возвращать функцию destroy', () => {
      const destroy = presenter.init();

      expect(typeof destroy).toBe('function');
    });

    it('должен вызывать destroy у store при вызове возвращаемой функции', () => {
      const destroy = presenter.init();

      destroy();

      expect(destroyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPropsView кеширование', () => {
    let cachePresenter: TestPresenter;

    beforeEach(() => {
      cachePresenter = new TestPresenter({ store });
      cachePresenter.enableCallTracking();
      cachePresenter.resetCallCounts();
    });

    it('должен кешировать результат getPropsView и не пересоздавать его при повторных вызовах', () => {
      const props1 = cachePresenter.getPropsView();
      const props2 = cachePresenter.getPropsView();
      const props3 = cachePresenter.getPropsView();

      expect(props1).toBe(props2);
      expect(props2).toBe(props3);
      expect(cachePresenter.getCreatePropsViewCallCount()).toBe(1);
    });

    it('должен возвращать корректные пропсы', () => {
      const props = cachePresenter.getPropsView();

      expect(props).toEqual({ testProp: 'test value' });
    });
  });

  describe('clearCache', () => {
    let cachePresenter: TestPresenter;

    beforeEach(() => {
      cachePresenter = new TestPresenter({ store });
      cachePresenter.enableCallTracking();
      cachePresenter.resetCallCounts();
    });

    it('должен очищать кеш propsView и заставлять пересоздавать его при следующем вызове', () => {
      // Первый вызов - создание и кеширование
      const props1 = cachePresenter.getPropsView();

      expect(cachePresenter.getCreatePropsViewCallCount()).toBe(1);

      // Повторный вызов - использование кеша
      const props2 = cachePresenter.getPropsView();

      expect(props1).toBe(props2);
      expect(cachePresenter.getCreatePropsViewCallCount()).toBe(1);

      // Очистка кеша
      cachePresenter.testClearCache();

      // После очистки должен создать новый объект
      const props3 = cachePresenter.getPropsView();

      expect(props1).not.toBe(props3);
      expect(cachePresenter.getCreatePropsViewCallCount()).toBe(2);
    });

    it('должен позволять повторную очистку кеша без ошибок', () => {
      // Создаем кеш
      cachePresenter.getPropsView();

      // Очищаем несколько раз подряд
      expect(() => {
        cachePresenter.testClearCache();
        cachePresenter.testClearCache();
        cachePresenter.testClearCache();
      }).not.toThrow();

      // Проверяем, что после множественной очистки все еще работает корректно
      cachePresenter.getPropsView();
      expect(cachePresenter.getCreatePropsViewCallCount()).toBe(2);
    });
  });

  describe('parseStateFieldToPropsView', () => {
    it('должен корректно преобразовывать поле в пропсы для представления', () => {
      const mockGetValue = jest.fn().mockReturnValue('test value');
      const mockSetValue = jest.fn();

      const field = {
        getValue: mockGetValue,
        setValue: mockSetValue,
        hasDisabled: () => {
          return false;
        },
      };

      const result = presenter.testParseStateFieldToPropsView(field);

      // Проверяем, что все методы корректно переданы
      expect(result.getValue).toBeDefined();
      expect(result.onChange).toBeDefined();

      // Проверяем, что методы работают корректно
      expect(result.getValue()).toBe('test value');

      // Проверяем, что onChange вызывает setValue
      result.onChange('new value');
      expect(mockSetValue).toHaveBeenCalledWith('new value');
    });

    it('должен корректно обрабатывать поле с undefined ошибкой', () => {
      const field = {
        getValue: () => {
          return 'test value';
        },
        setValue: jest.fn(),
        hasDisabled: () => {
          return false;
        },
      };

      const result = presenter.testParseStateFieldToPropsView(field);

      expect(result.getValue()).toBe('test value');
    });

    it('должен сохранять контекст this при вызове методов', () => {
      const context = {
        value: 'test value',
        getValue() {
          return this.value;
        },
        setValue(value: string) {
          this.value = value;
        },
        hasDisabled() {
          return false;
        },
      };

      const field = {
        getValue: context.getValue.bind(context),
        setValue: context.setValue.bind(context),
        hasDisabled: context.hasDisabled.bind(context),
      };

      const result = presenter.testParseStateFieldToPropsView(field);

      expect(result.getValue()).toBe('test value');
      result.onChange('new value');
      expect(context.value).toBe('new value');
    });

    it('должен корректно преобразовывать значения между store и view', () => {
      const field = {
        getValue: () => {
          return 42;
        },
        setValue: jest.fn(),
        hasDisabled: () => {
          return false;
        },
      };

      const result = presenter.testParseStateFieldToPropsView(field, {
        parseValueToView: (value) => {
          return `Value: ${value}`;
        },
        parseValueToStore: (value) => {
          return Number.parseInt(value.split(': ')[1], 10);
        },
      });

      expect(result.getValue()).toBe('Value: 42');
      result.onChange('Value: 100');
      expect(field.setValue).toHaveBeenCalledWith(100);
    });
  });

  describe('parseReferenceFormFieldToPropsView', () => {
    beforeEach(() => {
      presenter.setErrorMessages({
        'error message': { type: 'test' },
      });
    });

    it('должен корректно преобразовывать поле в пропсы для представления', () => {
      const mockGetValue = jest.fn().mockReturnValue({ id: 'test value' });
      const mockSetValue = jest.fn();
      const mockGetError = jest.fn().mockReturnValue('error message');
      const mockHasValid = jest.fn().mockReturnValue(true);
      const mockHasDisabled = jest.fn().mockReturnValue(false);
      const field = {
        getValue: mockGetValue,
        setValue: mockSetValue,
        getError: mockGetError,
        hasValid: mockHasValid,
        hasDisabled: mockHasDisabled,
      };

      const result = presenter.testParseReferenceFormFieldToPropsView(field);

      // Проверяем, что все методы корректно переданы
      expect(result.getValue).toBeDefined();
      expect(result.onChange).toBeDefined();
      expect(result.getError).toBeDefined();
      expect(result.hasValid).toBeDefined();

      // Проверяем, что методы работают корректно
      expect(result.getValue()).toBe('test value');
      expect(result.getError()).toEqual({ type: 'test' });
      expect(result.hasValid()).toBe(true);

      // Проверяем, что onChange вызывает setValue
      result.onChange('new value');
      expect(mockSetValue).toHaveBeenCalledWith('new value');
    });

    it('должен корректно обрабатывать поле с undefined ошибкой', () => {
      const field = {
        getValue: () => {
          return { id: 'test value' };
        },
        setValue: jest.fn(),
        getError: () => {
          return undefined;
        },
        hasValid: () => {
          return true;
        },
        hasDisabled: () => {
          return false;
        },
      };

      const result = presenter.testParseReferenceFormFieldToPropsView(field);

      expect(result.getError()).toBeUndefined();
    });

    it('должен корректно обрабатывать поле с невалидным состоянием', () => {
      const field = {
        getValue: () => {
          return { id: 'test value' };
        },
        setValue: jest.fn(),
        getError: () => {
          return 'error message';
        },
        hasValid: () => {
          return false;
        },
        hasDisabled: () => {
          return false;
        },
      };

      const result = presenter.testParseReferenceFormFieldToPropsView(field);

      expect(result.hasValid()).toBe(false);
    });

    it('должен сохранять контекст this при вызове методов', () => {
      const ReferenceModel = typesMST.model({ id: typesMST.identifier });

      const ContextModel = typesMST
        .model({
          values: typesMST.array(ReferenceModel),
          value: typesMST.safeReference(ReferenceModel),
        })
        .views((self) => {
          return {
            getValue() {
              return self.value;
            },
            getError() {
              return undefined;
            },
            hasValid() {
              return true;
            },
            hasDisabled() {
              return false;
            },
          };
        })
        .actions((self) => {
          const resolveSelfSetter = resolveSetter(self);
          const setValueInner = resolveSelfSetter('value');

          return {
            setValue(value?: string) {
              setValueInner(value);
            },
          };
        });

      const context = ContextModel.create({
        values: [{ id: 'test value' }, { id: 'new value' }],
        value: 'test value',
      });

      const field = {
        getValue: context.getValue.bind(context),
        setValue: context.setValue.bind(context),
        getError: context.getError.bind(context),
        hasValid: context.hasValid.bind(context),
        hasDisabled: context.hasDisabled.bind(context),
      };

      const result = presenter.testParseReferenceFormFieldToPropsView(field);

      expect(result.getValue()).toBe('test value');
      result.onChange('new value');
      expect(context.value).toEqual({ id: 'new value' });
    });

    it('должен корректно преобразовывать значения между store и view', () => {
      const field = {
        getValue: () => {
          return { id: 42 };
        },
        setValue: jest.fn(),
        getError: () => {
          return 'error';
        },
        hasValid: () => {
          return true;
        },
        hasDisabled: () => {
          return false;
        },
      };

      const result = presenter.testParseReferenceFormFieldToPropsView(field, {
        parseValueToView: (value) => {
          return `Value: ${value}`;
        },
        parseValueToStore: (value) => {
          return Number.parseInt(value.split(': ')[1], 10);
        },
      });

      expect(result.getValue()).toBe('Value: 42');
      result.onChange('Value: 100');
      expect(field.setValue).toHaveBeenCalledWith(100);
    });
  });

  describe('parseFormFieldToPropsView', () => {
    beforeEach(() => {
      presenter.setErrorMessages({
        'error message': { type: 'test' },
      });
    });

    it('должен корректно преобразовывать поле в пропсы для представления', () => {
      const mockGetValue = jest.fn().mockReturnValue('test value');
      const mockSetValue = jest.fn();
      const mockGetError = jest.fn().mockReturnValue('error message');
      const mockHasValid = jest.fn().mockReturnValue(true);
      const mockHasDisabled = jest.fn().mockReturnValue(false);
      const field = {
        getValue: mockGetValue,
        setValue: mockSetValue,
        getError: mockGetError,
        hasValid: mockHasValid,
        hasDisabled: mockHasDisabled,
      };

      const result = presenter.testParseFormFieldToPropsView(field);

      // Проверяем, что все методы корректно переданы
      expect(result.getValue).toBeDefined();
      expect(result.onChange).toBeDefined();
      expect(result.getError).toBeDefined();
      expect(result.hasValid).toBeDefined();

      // Проверяем, что методы работают корректно
      expect(result.getValue()).toBe('test value');
      expect(result.getError()).toEqual({ type: 'test' });
      expect(result.hasValid()).toBe(true);

      // Проверяем, что onChange вызывает setValue
      result.onChange('new value');
      expect(mockSetValue).toHaveBeenCalledWith('new value');
    });

    it('должен корректно обрабатывать поле с undefined ошибкой', () => {
      const field = {
        getValue: () => {
          return 'test value';
        },
        setValue: jest.fn(),
        getError: () => {
          return undefined;
        },
        hasValid: () => {
          return true;
        },
        hasDisabled: () => {
          return false;
        },
      };

      const result = presenter.testParseFormFieldToPropsView(field);

      expect(result.getError()).toBeUndefined();
    });

    it('должен корректно обрабатывать поле с невалидным состоянием', () => {
      const field = {
        getValue: () => {
          return 'test value';
        },
        setValue: jest.fn(),
        getError: () => {
          return 'error message';
        },
        hasValid: () => {
          return false;
        },
        hasDisabled: () => {
          return false;
        },
      };

      const result = presenter.testParseFormFieldToPropsView(field);

      expect(result.hasValid()).toBe(false);
    });

    it('должен сохранять контекст this при вызове методов', () => {
      const context = {
        value: 'test value',
        getValue() {
          return this.value;
        },
        setValue(value: string) {
          this.value = value;
        },
        getError() {
          return undefined;
        },
        hasValid() {
          return true;
        },
        hasDisabled() {
          return false;
        },
      };

      const field = {
        getValue: context.getValue.bind(context),
        setValue: context.setValue.bind(context),
        getError: context.getError.bind(context),
        hasValid: context.hasValid.bind(context),
        hasDisabled: context.hasDisabled.bind(context),
      };

      const result = presenter.testParseFormFieldToPropsView(field);

      expect(result.getValue()).toBe('test value');
      result.onChange('new value');
      expect(context.value).toBe('new value');
    });

    it('должен корректно преобразовывать значения между store и view', () => {
      const field = {
        getValue: () => {
          return 42;
        },
        setValue: jest.fn(),
        getError: () => {
          return 'error';
        },
        hasValid: () => {
          return true;
        },
        hasDisabled: () => {
          return false;
        },
      };

      const result = presenter.testParseFormFieldToPropsView(field, {
        parseValueToView: (value) => {
          return `Value: ${value}`;
        },
        parseValueToStore: (value) => {
          return Number.parseInt(value.split(': ')[1], 10);
        },
      });

      expect(result.getValue()).toBe('Value: 42');
      result.onChange('Value: 100');
      expect(field.setValue).toHaveBeenCalledWith(100);
    });
  });

  describe('getFormattedError', () => {
    it('должен возвращать undefined для неизвестной ошибки', () => {
      const error = 'unknown_error';

      expect(presenter.testGetFormattedError(error)).toBeUndefined();
    });

    it('должен возвращать форматированное сообщение об ошибке', () => {
      const error = 'test_error';
      const errorMessage = { type: 'test', values: { key: 'value' } };

      presenter.setErrorMessages({ [error]: errorMessage });

      expect(presenter.testGetFormattedError(error)).toEqual(errorMessage);
    });

    it('должен возвращать undefined для undefined ошибки', () => {
      expect(presenter.testGetFormattedError(undefined)).toBeUndefined();
    });
  });

  describe('parseExecutableActionToPropsView', () => {
    it('должен корректно преобразовывать executable action в action для представления', () => {
      const mockExecute = jest.fn();
      const mockCanExecute = jest.fn().mockReturnValue(true);

      const executableAction = {
        execute: mockExecute,
        canExecute: mockCanExecute,
      };

      const result = presenter.testParseExecutableActionToPropsView(executableAction);

      // Проверяем, что все методы корректно переданы
      expect(result.onClick).toBeDefined();
      expect(result.hasDisabled).toBeDefined();

      // Проверяем, что onClick вызывает execute
      result.onClick();
      expect(mockExecute).toHaveBeenCalledTimes(1);

      // Проверяем, что hasDisabled возвращает инвертированное значение canExecute
      expect(result.hasDisabled()).toBe(false);
      expect(mockCanExecute).toHaveBeenCalledTimes(1);
    });

    it('должен корректно обрабатывать случай, когда canExecute возвращает false', () => {
      const mockExecute = jest.fn();
      const mockCanExecute = jest.fn().mockReturnValue(false);

      const executableAction = {
        execute: mockExecute,
        canExecute: mockCanExecute,
      };

      const result = presenter.testParseExecutableActionToPropsView(executableAction);

      // Когда canExecute возвращает false, hasDisabled должен возвращать true
      expect(result.hasDisabled()).toBe(true);
      expect(mockCanExecute).toHaveBeenCalledTimes(1);
    });

    it('должен сохранять контекст this при вызове методов', () => {
      const context = {
        executed: false,
        canExecuteValue: true,
        execute() {
          this.executed = true;
        },
        canExecute() {
          return this.canExecuteValue;
        },
      };

      const executableAction = {
        execute: context.execute.bind(context),
        canExecute: context.canExecute.bind(context),
      };

      const result = presenter.testParseExecutableActionToPropsView(executableAction);

      // Проверяем, что onClick вызывает execute с правильным контекстом
      expect(context.executed).toBe(false);
      result.onClick();
      expect(context.executed).toBe(true);

      // Проверяем, что hasDisabled использует canExecute с правильным контекстом
      expect(result.hasDisabled()).toBe(false);
      context.canExecuteValue = false;
      expect(result.hasDisabled()).toBe(true);
    });

    it('должен сохранять контекст this без ручного bind', () => {
      const executableAction = {
        executed: false,
        canExecuteValue: true,
        execute() {
          this.executed = true;
        },
        canExecute() {
          return this.canExecuteValue;
        },
      };

      const result = presenter.testParseExecutableActionToPropsView(executableAction);

      expect(() => {
        result.onClick();
      }).not.toThrow();
      expect(executableAction.executed).toBe(true);

      executableAction.canExecuteValue = false;

      expect(result.hasDisabled()).toBe(true);
    });

    it('должен корректно работать при множественных вызовах', () => {
      const mockExecute = jest.fn();
      const mockCanExecute = jest.fn().mockReturnValue(true);

      const executableAction = {
        execute: mockExecute,
        canExecute: mockCanExecute,
      };

      const result = presenter.testParseExecutableActionToPropsView(executableAction);

      // Множественные вызовы onClick
      result.onClick();
      result.onClick();
      result.onClick();

      expect(mockExecute).toHaveBeenCalledTimes(3);

      // Множественные вызовы hasDisabled
      result.hasDisabled();
      result.hasDisabled();
      result.hasDisabled();

      expect(mockCanExecute).toHaveBeenCalledTimes(3);
    });

    it('должен корректно обрабатывать динамическое изменение canExecute', () => {
      let canExecuteValue = true;
      const mockExecute = jest.fn();
      const mockCanExecute = jest.fn(() => {
        return canExecuteValue;
      });

      const executableAction = {
        execute: mockExecute,
        canExecute: mockCanExecute,
      };

      const result = presenter.testParseExecutableActionToPropsView(executableAction);

      // Первоначально canExecute возвращает true, значит hasDisabled должен быть false
      expect(result.hasDisabled()).toBe(false);

      // Меняем значение canExecute
      canExecuteValue = false;

      // Теперь hasDisabled должен быть true
      expect(result.hasDisabled()).toBe(true);
    });

    it('должен прокидывать аргументы в execute и canExecute', () => {
      const testId = 'user-id';
      const mockExecute = jest.fn();
      const mockCanExecute = jest.fn().mockReturnValue(true);

      const executableAction = {
        execute: mockExecute,
        canExecute: mockCanExecute,
      };

      const result = presenter.testParseExecutableActionToPropsView(executableAction);

      result.onClick(testId);
      expect(mockExecute).toHaveBeenCalledWith(testId);

      expect(result.hasDisabled(testId)).toBe(false);
      expect(mockCanExecute).toHaveBeenCalledWith(testId);
    });

    it('тип аргументов в execute и onClick должен быть одинаковым', () => {
      type TTestParameter = ['1', 2, { a: 3 }];

      const executableAction = {
        execute: jest.fn() as (args: TTestParameter) => void,
        canExecute: jest.fn() as (args: TTestParameter) => boolean,
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = presenter.testParseExecutableActionToPropsView(executableAction);

      type TExecuteParameters = Parameters<typeof executableAction.execute>[0];

      type TOnClickParameters = Parameters<typeof result.onClick>[0];

      type TEqualParameters = TEqual<TExecuteParameters, TOnClickParameters>;

      const isCorrectType: TEqualParameters = true;

      expect(isCorrectType).toBe(true);
    });
  });

  describe('getFields кеширование', () => {
    let cachePresenter: TestPresenter;

    beforeEach(() => {
      cachePresenter = new TestPresenter({ store });
      cachePresenter.enableCallTracking();
      cachePresenter.resetCallCounts();
    });

    it('должен кешировать результат getFields и не пересоздавать его при повторных вызовах', () => {
      const fields1 = cachePresenter.getFields();
      const fields2 = cachePresenter.getFields();
      const fields3 = cachePresenter.getFields();

      expect(fields1).toBe(fields2);
      expect(fields2).toBe(fields3);
      expect(cachePresenter.getCreateFieldsCallCount()).toBe(1);
    });

    it('должен возвращать корректные поля', () => {
      const fields = cachePresenter.getFields();

      expect(fields).toEqual({ testField: 'test field value' });
    });
  });

  describe('clearCache для полей', () => {
    let cachePresenter: TestPresenter;

    beforeEach(() => {
      cachePresenter = new TestPresenter({ store });
      cachePresenter.enableCallTracking();
      cachePresenter.resetCallCounts();
    });

    it('должен очищать кеш fields и заставлять пересоздавать его при следующем вызове', () => {
      // Первый вызов - создание и кеширование
      const fields1 = cachePresenter.getFields();

      expect(cachePresenter.getCreateFieldsCallCount()).toBe(1);

      // Повторный вызов - использование кеша
      const fields2 = cachePresenter.getFields();

      expect(fields1).toBe(fields2);
      expect(cachePresenter.getCreateFieldsCallCount()).toBe(1);

      // Очистка кеша
      cachePresenter.testClearCache();

      // После очистки должен создать новый объект
      const fields3 = cachePresenter.getFields();

      expect(fields1).not.toBe(fields3);
      expect(cachePresenter.getCreateFieldsCallCount()).toBe(2);
    });

    it('должен позволять повторную очистку кеша без ошибок', () => {
      // Создаем кеш
      cachePresenter.getFields();

      // Очищаем несколько раз подряд
      expect(() => {
        cachePresenter.testClearCache();
        cachePresenter.testClearCache();
        cachePresenter.testClearCache();
      }).not.toThrow();

      // Проверяем, что после множественной очистки все еще работает корректно
      cachePresenter.getFields();
      expect(cachePresenter.getCreateFieldsCallCount()).toBe(2);
    });

    it('должен возвращать пустой объект и корректно работать с кешированием если не переопределен createFields', () => {
      // Первый вызов - создание и кеширование
      const fields1 = defaultFieldsPresenter.getFields();

      expect(fields1).toEqual({});

      // Повторный вызов - использование кеша
      const fields2 = defaultFieldsPresenter.getFields();

      expect(fields2).toBe(fields1);

      // Очистка кеша
      defaultFieldsPresenter.testClearCache();

      // После очистки должен создать новый объект
      const fields3 = defaultFieldsPresenter.getFields();

      expect(fields3).not.toBe(fields1);
      expect(fields3).toEqual({});
    });
  });

  describe('getActions кеширование', () => {
    let cachePresenter: TestPresenter;

    beforeEach(() => {
      cachePresenter = new TestPresenter({ store });
      cachePresenter.enableCallTracking();
      cachePresenter.resetCallCounts();
    });

    it('должен кешировать результат getActions и не пересоздавать его при повторных вызовах', () => {
      const actions1 = cachePresenter.getActions();
      const actions2 = cachePresenter.getActions();
      const actions3 = cachePresenter.getActions();

      expect(actions1).toBe(actions2);
      expect(actions2).toBe(actions3);
      expect(cachePresenter.getCreateActionsCallCount()).toBe(1);
    });

    it('должен возвращать корректные экшены', () => {
      const actions = cachePresenter.getActions();

      expect(typeof actions.testAction).toBe('function');
    });
  });

  describe('clearCache для экшенов', () => {
    let cachePresenter: TestPresenter;

    beforeEach(() => {
      cachePresenter = new TestPresenter({ store });
      cachePresenter.enableCallTracking();
      cachePresenter.resetCallCounts();
    });

    it('должен очищать кеш actions и заставлять пересоздавать его при следующем вызове', () => {
      const actions1 = cachePresenter.getActions();

      expect(cachePresenter.getCreateActionsCallCount()).toBe(1);

      const actions2 = cachePresenter.getActions();

      expect(actions1).toBe(actions2);
      expect(cachePresenter.getCreateActionsCallCount()).toBe(1);

      cachePresenter.testClearCache();

      const actions3 = cachePresenter.getActions();

      expect(actions1).not.toBe(actions3);
      expect(cachePresenter.getCreateActionsCallCount()).toBe(2);
    });

    it('должен позволять повторную очистку кеша экшенов без ошибок', () => {
      cachePresenter.getActions();

      expect(() => {
        cachePresenter.testClearCache();
        cachePresenter.testClearCache();
        cachePresenter.testClearCache();
      }).not.toThrow();

      cachePresenter.getActions();
      expect(cachePresenter.getCreateActionsCallCount()).toBe(2);
    });

    it('должен возвращать пустой объект и корректно работать с кешированием если не переопределен createActions', () => {
      const actions1 = defaultFieldsPresenter.getActions();

      expect(actions1).toEqual({});

      const actions2 = defaultFieldsPresenter.getActions();

      expect(actions2).toBe(actions1);

      defaultFieldsPresenter.testClearCache();

      const actions3 = defaultFieldsPresenter.getActions();

      expect(actions3).not.toBe(actions1);
      expect(actions3).toEqual({});
    });
  });
});
