/// <reference types="jest" />
import { types as typesMST } from 'mobx-state-tree';

import withRememberState from '../withRememberState';

import type { TInstanceModel } from '@experiments/mst-tools';

// Простой мок базовой модели для тестирования withRememberState
const MockBaseModel = typesMST
  .model('MockBaseModel', {
    testField: typesMST.optional(typesMST.string, ''),
    isValid: typesMST.optional(typesMST.boolean, true),
  })
  .volatile(() => {
    return {
      depends: {
        isValid: ['testField'],
      },
    };
  })
  .views((self) => {
    return {
      get currentState() {
        return {
          testField: self.testField,
          isValid: self.isValid,
        };
      },
    };
  })
  .actions((self) => {
    return {
      setCurrentState: (data: { testField: string; isValid: boolean }) => {
        Object.assign(self, { testField: data.testField, isValid: data.isValid });
      },
    };
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ModelTemporary = withRememberState(MockBaseModel);

// Типы для тестирования - простая типизация для избежания конфликтов
type TTestInstance = TInstanceModel<typeof ModelTemporary>;

describe('withRememberState', () => {
  describe('базовое создание модели с remember state', () => {
    it('должен добавить volatile поля rememberedState и isFilledRecently', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      expect(instance.rememberedState).toBeUndefined();
      expect(instance.isFilledRecently).toBe(false);
    });

    it('должен добавить методы fill, rememberState, resetToRememberState', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      expect(typeof instance.fill).toBe('function');
      expect(typeof instance.rememberState).toBe('function');
      expect(typeof instance.resetToRememberState).toBe('function');
    });

    it('должен добавить views isFilledAndRemembered, hasEqualState, changedState и getRememberedValue', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      expect(typeof instance.isFilledAndRemembered).toBe('boolean');
      expect(typeof instance.hasEqualState).toBe('function');
      expect(typeof instance.changedState).toBe('object');
      expect(typeof instance.getRememberedValue).toBe('function');
    });

    it('должен сохранить оригинальные поля и методы базовой модели', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      expect(instance.testField).toBe('');
      expect(instance.isValid).toBe(true);
      expect(instance.depends).toEqual({
        isValid: ['testField'],
      });
      expect(typeof instance.setCurrentState).toBe('function');
      expect(typeof instance.currentState).toBe('object');
    });
  });

  describe('метод fill', () => {
    it('должен устанавливать состояние и устанавливать isFilledRecently в true', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: 'test value', isValid: false };

      instance.fill(testData);

      expect(instance.testField).toBe('test value');
      expect(instance.isValid).toBe(false);
      expect(instance.isFilledRecently).toBe(true);
    });

    it('должен автоматически вызывать rememberState после заполнения', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: 'remembered value', isValid: true };

      instance.fill(testData);

      expect(instance.rememberedState).toEqual(testData);
    });

    it('должен проксировать вызов к setCurrentState', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const setCurrentStateSpy = jest.spyOn(
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void },
        'setCurrentState',
      );
      const testData = { testField: 'proxy test', isValid: false };

      instance.fill(testData);

      expect(setCurrentStateSpy).toHaveBeenCalledWith(testData);
    });

    describe('работа с dependentData', () => {
      type TDependentData = { extraField: string };

      it('должен вызывать setDependentData если он определен в модели', () => {
        // Создаем модель с методом setDependentData
        const ModelWithDependentData = withRememberState(MockBaseModel).actions((self) => {
          return {
            setDependentData: (data: TDependentData) => {
              // eslint-disable-next-line no-param-reassign
              (self as unknown as { extraField: string }).extraField = data.extraField;
            },
          };
        });

        const instance = ModelWithDependentData.create({}) as TTestInstance & {
          setDependentData: (data: TDependentData) => void;
          extraField: string;
        };

        const setDependentDataSpy = jest.spyOn(instance, 'setDependentData');

        const testData = { testField: 'test', isValid: true };
        const dependentData: TDependentData = { extraField: 'dependent value' };

        // Используем type assertion для обхода проверки типов
        (
          instance as unknown as { fill: (state: typeof testData, data?: TDependentData) => void }
        ).fill(testData, dependentData);

        expect(setDependentDataSpy).toHaveBeenCalledWith(dependentData);
        expect(instance.extraField).toBe('dependent value');
      });

      it('не должен вызывать setDependentData если он не определен в модели', () => {
        const Model = withRememberState(MockBaseModel);
        const instance = Model.create({});

        const testData = { testField: 'test', isValid: true };
        const dependentData: TDependentData = { extraField: 'dependent value' };

        // Используем type assertion для обхода проверки типов
        expect(() => {
          (
            instance as unknown as { fill: (state: typeof testData, data?: TDependentData) => void }
          ).fill(testData, dependentData);
        }).not.toThrow();
      });

      it('не должен вызывать setDependentData если dependentData не передан', () => {
        const ModelWithDependentData = withRememberState(MockBaseModel).actions((self) => {
          return {
            setDependentData: (data: TDependentData) => {
              // eslint-disable-next-line no-param-reassign
              (self as unknown as { extraField: string }).extraField = data.extraField;
            },
          };
        });

        const instance = ModelWithDependentData.create({}) as TTestInstance & {
          setDependentData: (data: TDependentData) => void;
        };

        const setDependentDataSpy = jest.spyOn(instance, 'setDependentData');

        const testData = { testField: 'test', isValid: true };

        instance.fill(testData);

        expect(setDependentDataSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('метод rememberState', () => {
    it('должен сохранить текущее состояние в rememberedState', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'to remember', isValid: true });
      instance.rememberState();

      expect(instance.rememberedState).toEqual({
        testField: 'to remember',
        isValid: true,
      });
    });

    it('должен обновлять rememberedState при повторном вызове', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Первое запоминание
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'first', isValid: true });
      instance.rememberState();
      expect(instance.rememberedState?.testField).toBe('first');

      // Второе запоминание
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'second', isValid: false });
      instance.rememberState();
      expect(instance.rememberedState?.testField).toBe('second');
      expect(instance.rememberedState?.isValid).toBe(false);
    });
  });

  describe('метод resetToRememberState', () => {
    it('должен восстанавливать состояние из rememberedState', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({ testField: 'original', isValid: true });

      // Изменяем состояние
      instance.setCurrentState({ testField: 'changed', isValid: false });
      expect(instance.testField).toBe('changed');
      expect(instance.isValid).toBe(false);

      // Восстанавливаем
      instance.resetToRememberState();
      expect(instance.testField).toBe('original');
      expect(instance.isValid).toBe(true);
    });

    it('должен устанавливать isFilledRecently в false после сброса', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      instance.fill({
        testField: 'test',
        isValid: true,
      });
      expect(instance.isFilledRecently).toBe(true);

      instance.resetToRememberState();
      expect(instance.isFilledRecently).toBe(false);
    });

    it('должен ничего не делать если rememberedState undefined', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const originalState = {
        testField: instance.testField,
        isValid: instance.isValid,
      };

      // Пытаемся сбросить без сохраненного состояния
      instance.resetToRememberState();

      expect(instance.testField).toBe(originalState.testField);
      expect(instance.isValid).toBe(originalState.isValid);
      expect(instance.isFilledRecently).toBe(false);
    });

    it('должен проксировать вызов к setCurrentState', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const setCurrentStateSpy = jest.spyOn(
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void },
        'setCurrentState',
      );

      instance.fill({ testField: 'test', isValid: true });
      instance.resetToRememberState();

      expect(setCurrentStateSpy).toHaveBeenCalledWith({ testField: 'test', isValid: true });
    });
  });

  describe('view isFilledAndRemembered', () => {
    it('должен возвращать false когда модель не заполнена', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      expect(instance.isFilledAndRemembered).toBe(false);
    });

    it('должен возвращать true когда модель заполнена и состояние сохранено', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      instance.fill({
        testField: 'filled',
        isValid: true,
      });

      expect(instance.isFilledAndRemembered).toBe(true);
    });

    it('должен возвращать false когда isFilledRecently true но rememberedState undefined', () => {
      // Создаем модель с отдельными методами для тестирования крайних случаев
      const TestModel = withRememberState(MockBaseModel).actions((self) => {
        return {
          forceSetIsFilledRecently: (value: boolean) => {
            // eslint-disable-next-line no-param-reassign
            (self as unknown as { isFilledRecently: boolean }).isFilledRecently = value;
          },
        };
      });

      const instance = TestModel.create({}) as TTestInstance & {
        forceSetIsFilledRecently: (value: boolean) => void;
      };

      // Устанавливаем isFilledRecently без fill
      instance.forceSetIsFilledRecently(true);

      expect(instance.isFilledAndRemembered).toBe(false);
    });

    it('должен возвращать false когда rememberedState есть но isFilledRecently false', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и сбрасываем флаг
      instance.fill({
        testField: 'test',
        isValid: true,
      });
      instance.resetToRememberState();

      expect(instance.isFilledAndRemembered).toBe(false);
    });
  });

  describe('метод hasEqualState', () => {
    it('должен возвращать true когда rememberedState undefined', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      expect(instance.hasEqualState()).toBe(true);
    });

    it('должен возвращать true когда текущее состояние равно сохраненному', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: 'equal test', isValid: true };

      instance.fill(testData);
      expect(instance.hasEqualState()).toBe(true);
    });

    it('должен возвращать false когда текущее состояние отличается от сохраненного', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'original',
        isValid: true,
      });

      // Изменяем состояние
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'modified', isValid: false });

      expect(instance.hasEqualState()).toBe(false);
    });

    it('должен использовать глубокое сравнение объектов', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      instance.fill({
        testField: 'test',
        isValid: true,
      });

      // Устанавливаем те же значения через setCurrentState
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'test', isValid: true });

      expect(instance.hasEqualState()).toBe(true);
    });
  });

  describe('метод getRememberedValue', () => {
    it('должен возвращать undefined когда rememberedState undefined', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      expect(instance.getRememberedValue('testField')).toBeUndefined();
      expect(instance.getRememberedValue('isValid')).toBeUndefined();
    });

    it('должен возвращать значение по ключу из сохраненного состояния', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: 'remembered value', isValid: true };

      instance.fill(testData);

      expect(instance.getRememberedValue('testField')).toBe('remembered value');
      expect(instance.getRememberedValue('isValid')).toBe(true);
    });

    it('должен возвращать undefined для несуществующего ключа', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: 'test', isValid: true };

      instance.fill(testData);

      // TypeScript не позволит это скомпилировать, но для тестирования используем any
      // @ts-expect-error
      expect(instance.getRememberedValue('nonExistentKey')).toBeUndefined();
    });

    it('должен работать с различными типами данных', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: 'string value', isValid: false };

      instance.fill(testData);

      expect(typeof instance.getRememberedValue('testField')).toBe('string');
      expect(typeof instance.getRememberedValue('isValid')).toBe('boolean');
    });

    it('должен возвращать актуальные значения после обновления rememberedState', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Первое заполнение
      instance.fill({ testField: 'first', isValid: true });
      expect(instance.getRememberedValue('testField')).toBe('first');
      expect(instance.getRememberedValue('isValid')).toBe(true);

      // Второе заполнение - должно обновить rememberedState
      instance.fill({ testField: 'second', isValid: false });
      expect(instance.getRememberedValue('testField')).toBe('second');
      expect(instance.getRememberedValue('isValid')).toBe(false);
    });

    it('должен работать с пустыми значениями', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: '', isValid: true };

      instance.fill(testData);

      expect(instance.getRememberedValue('testField')).toBe('');
      expect(instance.getRememberedValue('isValid')).toBe(true);
    });

    it('должен работать с boolean значениями', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Тестируем false
      instance.fill({ testField: 'test', isValid: false });
      expect(instance.getRememberedValue('isValid')).toBe(false);

      // Тестируем true
      instance.fill({ testField: 'test', isValid: true });
      expect(instance.getRememberedValue('isValid')).toBe(true);
    });

    it('должен быть реактивным при изменении rememberedState', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Изначально undefined
      expect(instance.getRememberedValue('testField')).toBeUndefined();

      // После fill должно вернуть значение
      instance.fill({ testField: 'reactive test', isValid: true });
      expect(instance.getRememberedValue('testField')).toBe('reactive test');

      // После resetToRememberState должно остаться то же значение
      instance.setCurrentState({ testField: 'changed', isValid: false });
      instance.resetToRememberState();
      expect(instance.getRememberedValue('testField')).toBe('reactive test');
    });

    it('должен работать в связке с другими методами', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: 'integration test', isValid: true };

      instance.fill(testData);

      // Проверяем, что getRememberedValue возвращает то же, что и rememberedState
      expect(instance.getRememberedValue('testField')).toBe(instance.rememberedState?.testField);
      expect(instance.getRememberedValue('isValid')).toBe(instance.rememberedState?.isValid);

      // Проверяем связь с hasEqualState
      expect(instance.hasEqualState()).toBe(true);

      // Изменяем состояние
      instance.setCurrentState({ testField: 'modified', isValid: false });
      expect(instance.hasEqualState()).toBe(false);

      // getRememberedValue должен по-прежнему возвращать исходные значения
      expect(instance.getRememberedValue('testField')).toBe('integration test');
      expect(instance.getRememberedValue('isValid')).toBe(true);
    });
  });

  describe('view changedState', () => {
    it('должен возвращать пустой объект когда rememberedState undefined', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      expect(instance.changedState).toEqual({});
    });

    it('должен возвращать пустой объект когда состояние не изменилось', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: 'unchanged test', isValid: true };

      instance.fill(testData);
      expect(instance.changedState).toEqual({});
    });

    it('должен возвращать только измененные поля', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'original',
        isValid: true,
      });

      // Изменяем только одно поле
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'modified', isValid: true });

      expect(instance.changedState).toEqual({
        testField: 'modified',
      });
    });

    it('должен возвращать все измененные поля', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'original',
        isValid: true,
      });

      // Изменяем все поля
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'completely different', isValid: false });

      expect(instance.changedState).toEqual({
        testField: 'completely different',
        isValid: false,
      });
    });

    it('должен правильно обрабатывать изменения boolean значений', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'test',
        isValid: false,
      });

      // Изменяем только boolean поле
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'test', isValid: true });

      expect(instance.changedState).toEqual({
        isValid: true,
      });
    });

    it('должен правильно обрабатывать изменения на пустые значения', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'not empty',
        isValid: true,
      });

      // Изменяем на пустое значение
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: '', isValid: true });

      expect(instance.changedState).toEqual({
        testField: '',
      });
    });

    it('должен обновляться при изменении состояния', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'initial',
        isValid: true,
      });

      // Первое изменение
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'first change', isValid: true });
      expect(instance.changedState).toEqual({ testField: 'first change' });

      // Второе изменение
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'second change', isValid: false });
      expect(instance.changedState).toEqual({
        testField: 'second change',
        isValid: false,
      });
    });

    it('должен возвращать пустой объект после возврата к исходному состоянию', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const originalData = {
        testField: 'original',
        isValid: true,
      };

      // Заполняем и запоминаем
      instance.fill(originalData);

      // Изменяем состояние
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'changed', isValid: false });
      expect(instance.changedState).not.toEqual({});

      // Возвращаем к исходному состоянию
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState(originalData);
      expect(instance.changedState).toEqual({});
    });

    it('должен использовать глубокое сравнение значений', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'same value',
        isValid: true,
      });

      // Устанавливаем те же значения
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'same value', isValid: true });

      expect(instance.changedState).toEqual({});
    });

    it('должен работать в связке с hasEqualState', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'consistency test',
        isValid: true,
      });

      // Когда нет изменений
      expect(instance.changedState).toEqual({});
      expect(instance.hasEqualState()).toBe(true);

      // Когда есть изменения
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'modified', isValid: false });

      const hasChanges = Object.keys(instance.changedState).length > 0;

      expect(hasChanges).toBe(true);
      expect(instance.hasEqualState()).toBe(false);
    });

    it('при изменении поля с наличием зависимости, affectedFields возвращает множество зависимостей', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'same value',
        isValid: true,
      });

      expect(instance.affectedFields).toEqual(new Set([]));

      // Устанавливаем для isValid отличное значение
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'same value', isValid: false });

      expect(instance.isValid).toBe(false);

      expect(instance.affectedFields).toEqual(new Set(['testField']));
    });

    it('при изменении поля без зависимостей мы получаем пустое множество', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'same value',
        isValid: true,
      });

      // Устанавливаем для isValid отличное значение
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'other value', isValid: true });

      expect(instance.changedState).toEqual({ testField: 'other value' });

      expect(instance.affectedFields).toEqual(new Set([]));
    });

    it('должен возвращать пустое множество когда depends не определен', () => {
      // Создаем модель без depends
      const ModelWithoutDepends = typesMST
        .model('ModelWithoutDepends', {
          testField: typesMST.optional(typesMST.string, ''),
          isValid: typesMST.optional(typesMST.boolean, true),
        })
        .views((self) => {
          return {
            get currentState() {
              return {
                testField: self.testField,
                isValid: self.isValid,
              };
            },
          };
        })
        .actions((self) => {
          return {
            setCurrentState: (data: { testField: string; isValid: boolean }) => {
              Object.assign(self, { testField: data.testField, isValid: data.isValid });
            },
          };
        });

      const Model = withRememberState(ModelWithoutDepends);
      const instance = Model.create({});

      // Заполняем и запоминаем
      instance.fill({
        testField: 'initial',
        isValid: true,
      });

      // Изменяем состояние
      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'modified', isValid: false });

      expect(instance.affectedFields).toEqual(new Set([]));
    });
  });

  describe('интеграционные сценарии', () => {
    it('должен работать полный цикл: fill -> change -> reset', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем
      instance.fill({
        testField: 'initial',
        isValid: true,
      });
      expect(instance.testField).toBe('initial');
      expect(instance.isFilledAndRemembered).toBe(true);
      expect(instance.hasEqualState()).toBe(true);

      // Изменяем
      instance.setCurrentState({ testField: 'changed', isValid: false });
      expect(instance.testField).toBe('changed');
      expect(instance.hasEqualState()).toBe(false);

      // Сбрасываем
      instance.resetToRememberState();
      expect(instance.testField).toBe('initial');
      expect(instance.isValid).toBe(true);
      expect(instance.isFilledRecently).toBe(false);
      expect(instance.hasEqualState()).toBe(true);
    });

    it('должен правильно обрабатывать несколько циклов', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Первый цикл
      instance.fill({
        testField: 'first',
        isValid: true,
      });
      instance.setCurrentState({ testField: 'changed first', isValid: false });
      instance.resetToRememberState();
      expect(instance.testField).toBe('first');
      expect(instance.isValid).toBe(true);

      // Второй цикл
      instance.fill({
        testField: 'second',
        isValid: false,
      });
      instance.setCurrentState({ testField: 'changed second', isValid: true });
      instance.resetToRememberState();
      expect(instance.testField).toBe('second');
      expect(instance.isValid).toBe(false);
    });

    it('должен работать с пустыми состояниями', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Заполняем пустыми значениями
      instance.fill({
        testField: '',
        isValid: true,
      });

      expect(instance.testField).toBe('');
      expect(instance.isValid).toBe(true);
      expect(instance.isFilledAndRemembered).toBe(true);
      expect(instance.hasEqualState()).toBe(true);
    });

    it('должен обрабатывать повторные вызовы fill', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      // Первый fill
      instance.fill({
        testField: 'first fill',
        isValid: true,
      });
      expect(instance.rememberedState?.testField).toBe('first fill');

      // Второй fill должен перезаписать сохраненное состояние
      instance.fill({
        testField: 'second fill',
        isValid: false,
      });
      expect(instance.rememberedState?.testField).toBe('second fill');
      expect(instance.rememberedState?.isValid).toBe(false);
      expect(instance.hasEqualState()).toBe(true);
    });
  });

  describe('возможность расширения', () => {
    it('должен позволять добавлять дополнительные views', () => {
      const ExtendedModel = withRememberState(MockBaseModel).views((self) => {
        return {
          get formattedField() {
            return `Value: ${(self as { testField: string }).testField}`;
          },
          get hasChanges() {
            return !(self as { hasEqualState: () => boolean }).hasEqualState();
          },
        };
      });

      const instance = ExtendedModel.create({}) as TTestInstance & {
        formattedField: string;
        hasChanges: boolean;
      };

      instance.fill({ testField: 'extended test', isValid: true });

      expect(instance.formattedField).toBe('Value: extended test');
      expect(instance.hasChanges).toBe(false);

      instance.setCurrentState({ testField: 'modified', isValid: true });
      expect(instance.hasChanges).toBe(true);
    });

    it('должен позволять добавлять дополнительные actions', () => {
      const ExtendedModel = withRememberState(MockBaseModel).actions((self) => {
        return {
          customFillAndModify: (data: { testField: string; isValid: boolean }) => {
            const typedSelf = self as {
              fill: (data: { testField: string; isValid: boolean }) => void;
              setCurrentState: (data: { testField: string; isValid: boolean }) => void;
            };

            typedSelf.fill(data);
            typedSelf.setCurrentState({ ...data, testField: `${data.testField} modified` });
          },
        };
      });

      const instance = ExtendedModel.create({}) as TTestInstance & {
        customFillAndModify: (data: { testField: string; isValid: boolean }) => void;
      };

      instance.customFillAndModify({ testField: 'custom', isValid: true });

      expect((instance as unknown as { testField: string }).testField).toBe('custom modified');
      expect(
        (instance as unknown as { rememberedState: { testField: string; isValid: boolean } })
          .rememberedState.testField,
      ).toBe('custom');
      expect((instance as unknown as { hasEqualState: () => boolean }).hasEqualState()).toBe(false);
    });

    it('при переопределении rememberedState не должен сохранять текущее состояние', () => {
      const rememberedState = { rememberedState: 'new rememberedState' };
      const Model = withRememberState(MockBaseModel).views(() => {
        return {
          get rememberedState() {
            return rememberedState;
          },
        };
      });
      const instance = Model.create({});

      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'to remember', isValid: true });
      (instance as unknown as { rememberState: () => void }).rememberState();

      expect(instance.rememberedState).toEqual(rememberedState);
    });

    it('при переопределении rememberState не должен сохранить текущее состояние в rememberedState', () => {
      const rememberState = jest.fn();
      const Model = withRememberState(MockBaseModel).actions(() => {
        return {
          rememberState,
        };
      });
      const instance = Model.create({});

      (
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void }
      ).setCurrentState({ testField: 'to remember', isValid: true });
      instance.rememberState();

      expect(rememberState).toHaveBeenCalled();

      expect(
        (instance as unknown as { rememberedState: Record<string, unknown> }).rememberedState,
      ).toBeUndefined();
    });
  });

  describe('сохранение типизации', () => {
    it('должен сохранять типы при работе с состоянием', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const testData = { testField: 'typed test', isValid: false };

      instance.fill(testData);

      expect(instance.rememberedState).toEqual(testData);
      expect(typeof instance.rememberedState?.testField).toBe('string');
      expect(typeof instance.rememberedState?.isValid).toBe('boolean');
    });

    it('должен передавать правильную структуру данных в setCurrentState', () => {
      const Model = withRememberState(MockBaseModel);
      const instance = Model.create({});

      const setCurrentStateSpy = jest.spyOn(
        instance as { setCurrentState: (data: { testField: string; isValid: boolean }) => void },
        'setCurrentState',
      );
      const testData = { testField: 'type preservation test', isValid: true };

      instance.fill(testData);

      expect(setCurrentStateSpy).toHaveBeenCalledWith(testData);
      expect(
        (instance as { currentState: { testField: string; isValid: boolean } }).currentState,
      ).toEqual(testData);
    });
  });
});
