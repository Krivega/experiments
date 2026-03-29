/// <reference types="jest" />
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import React from 'react';

import { BaseWidgetComposer } from '../BaseWidgetComposer';

import type { IBaseComposition, IBaseStore, IFeatureExport } from '../BaseWidgetComposer';

interface ITestStore extends IBaseStore {
  value: string;
  destroy: () => void;
}

interface ITestFeatureProps {
  text?: string;
  className?: string;
}

type IPropsView = { testProp?: string };

type ITestFeatures = {
  testFeature: IFeatureExport<ITestFeatureProps>;
};

// Мок компонента для тестов
const TestComponent: React.FC<ITestFeatureProps> = jest.fn(({ text = 'default', className }) => {
  return (
    <div className={className} data-testid="test-component">
      {text}
    </div>
  );
});

TestComponent.displayName = 'TestComponent';

// Тестовый класс для доступа к protected методам
class TestWidgetComposer extends BaseWidgetComposer<IPropsView, ITestStore, ITestFeatures> {
  private createCompositionCallCount = 0;

  private createPropsViewCallCount = 0;

  private trackCalls = false;

  public createPropsView(): IPropsView {
    if (this.trackCalls) {
      this.createPropsViewCallCount += 1;
    }

    return { testProp: 'test value' };
  }

  public createComposition() {
    if (this.trackCalls) {
      this.createCompositionCallCount += 1;
    }

    const baseProps = {
      text: this.store.value,
      className: 'base-class',
    };

    return {
      TestComponent: this.createFeatureWrapper(TestComponent, baseProps),
    };
  }

  // Для тестирования protected методов
  public testCreateFeatureWrapper<
    P extends IBaseComposition,
    S extends Record<string, unknown> | undefined = undefined,
  >(Component: React.ComponentType<Omit<P, keyof S> & S>, baseProps: Omit<P, keyof S>) {
    return this.createFeatureWrapper(Component, baseProps);
  }

  public testClearCache(): void {
    this.clearCache();
  }

  // Для тестирования protected свойств
  public getStore(): ITestStore {
    return this.store;
  }

  public getFeatures(): ITestFeatures {
    return this.features;
  }

  // Методы для управления отслеживанием вызовов
  public enableCallTracking(): void {
    this.trackCalls = true;
  }

  public disableCallTracking(): void {
    this.trackCalls = false;
  }

  public getCreateCompositionCallCount(): number {
    return this.createCompositionCallCount;
  }

  public getCreatePropsViewCallCount(): number {
    return this.createPropsViewCallCount;
  }

  public resetCallCounts(): void {
    this.createCompositionCallCount = 0;
    this.createPropsViewCallCount = 0;
  }
}

describe('BaseWidgetComposer', () => {
  let store: ITestStore;
  let features: ITestFeatures;
  let composer: TestWidgetComposer;
  let WrappedComponent: React.ComponentType<IBaseComposition & Record<string, unknown>>;
  const destroyMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    store = {
      value: 'test value',
      destroy: destroyMock,
    };

    features = {
      testFeature: {
        Component: TestComponent,
      },
    };

    composer = new TestWidgetComposer({ store, features });

    WrappedComponent = composer.getComposition().TestComponent;
  });

  describe('constructor', () => {
    it('должен корректно инициализировать store и features', () => {
      expect(composer.getStore()).toBe(store);
      expect(composer.getFeatures()).toBe(features);
    });
  });

  describe('init', () => {
    it('должен возвращать функцию destroy', () => {
      const destroy = composer.init();

      expect(typeof destroy).toBe('function');
    });

    it('должен вызывать destroy у store при вызове возвращаемой функции', () => {
      const destroy = composer.init();

      destroy();

      expect(destroyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('createFeatureWrapper', () => {
    it('должен создавать компонент-обертку с правильным displayName', () => {
      expect(WrappedComponent.displayName).toBe('FeatureWrapper(TestComponent)');
    });

    it('должен корректно объединять базовые и переданные пропсы', () => {
      render(<WrappedComponent text="override text" />);

      const element = screen.getByTestId('test-component');

      expect(element).toHaveTextContent('override text');
      expect(element).toHaveClass('base-class');
    });

    it('должен использовать базовые пропсы, если внешние не переданы', () => {
      render(<WrappedComponent />);

      const element = screen.getByTestId('test-component');

      expect(element).toHaveTextContent('test value');
      expect(element).toHaveClass('base-class');
    });

    it('должен корректно обрабатывать компоненты без displayName', () => {
      const NoNameComponent = () => {
        return <div>No Name</div>;
      };
      const baseProps = { className: 'test' };

      const WrappedTestComponent = composer.testCreateFeatureWrapper(NoNameComponent, baseProps);

      expect(WrappedTestComponent.displayName).toBe('FeatureWrapper(NoNameComponent)');
    });

    it('должен использовать пустой объект по умолчанию для additionalProps', () => {
      render(<WrappedComponent />);

      const element = screen.getByTestId('test-component');

      expect(element).toHaveTextContent('test value');
      expect(element).toHaveClass('base-class');
      expect(TestComponent).toHaveBeenCalledWith(
        { className: 'base-class', text: 'test value' },
        undefined,
      );
    });

    it('должен использовать переданные пропсы для additionalProps', () => {
      render(<WrappedComponent className="foo" />);

      const element = screen.getByTestId('test-component');

      expect(element).toHaveTextContent('test value');
      expect(element).toHaveClass('foo');
      expect(TestComponent).toHaveBeenCalledWith(
        { className: 'foo', text: 'test value' },
        undefined,
      );
    });
  });

  describe('getComposition и getPropsView кеширование', () => {
    let cacheComposer: TestWidgetComposer;

    beforeEach(() => {
      cacheComposer = new TestWidgetComposer({ store, features });
      cacheComposer.enableCallTracking();
      cacheComposer.resetCallCounts();
    });

    it('должен кешировать результат getComposition и не пересоздавать его при повторных вызовах', () => {
      const composition1 = cacheComposer.getComposition();
      const composition2 = cacheComposer.getComposition();
      const composition3 = cacheComposer.getComposition();

      expect(composition1).toBe(composition2);
      expect(composition2).toBe(composition3);
      expect(cacheComposer.getCreateCompositionCallCount()).toBe(1);
    });

    it('должен кешировать результат getPropsView и не пересоздавать его при повторных вызовах', () => {
      cacheComposer.getPropsView();
      cacheComposer.getPropsView();
      cacheComposer.getPropsView();

      expect(cacheComposer.getCreatePropsViewCallCount()).toBe(1);
    });

    it('должен кешировать и composition, и propsView независимо друг от друга', () => {
      const composition1 = cacheComposer.getComposition();

      cacheComposer.getPropsView();

      const composition2 = cacheComposer.getComposition();

      cacheComposer.getPropsView();

      expect(composition1).toBe(composition2);
      expect(cacheComposer.getCreateCompositionCallCount()).toBe(1);
      expect(cacheComposer.getCreatePropsViewCallCount()).toBe(1);
    });
  });

  describe('clearCache', () => {
    let cacheComposer: TestWidgetComposer;

    beforeEach(() => {
      cacheComposer = new TestWidgetComposer({ store, features });
      cacheComposer.enableCallTracking();
      cacheComposer.resetCallCounts();
    });

    it('должен очищать кеш composition и заставлять пересоздавать его при следующем вызове', () => {
      // Первый вызов - создание и кеширование
      const composition1 = cacheComposer.getComposition();

      expect(cacheComposer.getCreateCompositionCallCount()).toBe(1);

      // Повторный вызов - использование кеша
      const composition2 = cacheComposer.getComposition();

      expect(composition1).toBe(composition2);
      expect(cacheComposer.getCreateCompositionCallCount()).toBe(1);

      // Очистка кеша
      cacheComposer.testClearCache();

      // После очистки должен создать новый объект
      const composition3 = cacheComposer.getComposition();

      expect(composition1).not.toBe(composition3);
      expect(cacheComposer.getCreateCompositionCallCount()).toBe(2);
    });

    it('должен очищать кеш propsView и заставлять пересоздавать его при следующем вызове', () => {
      // Первый вызов - создание и кеширование
      cacheComposer.getPropsView();
      expect(cacheComposer.getCreatePropsViewCallCount()).toBe(1);

      // Повторный вызов - использование кеша
      cacheComposer.getPropsView();
      expect(cacheComposer.getCreatePropsViewCallCount()).toBe(1);

      // Очистка кеша
      cacheComposer.testClearCache();

      // После очистки должен создать новый объект
      cacheComposer.getPropsView();
      expect(cacheComposer.getCreatePropsViewCallCount()).toBe(2);
    });

    it('должен очищать оба кеша одновременно', () => {
      // Создаем и кешируем оба объекта
      const composition1 = cacheComposer.getComposition();

      cacheComposer.getPropsView();

      expect(cacheComposer.getCreateCompositionCallCount()).toBe(1);
      expect(cacheComposer.getCreatePropsViewCallCount()).toBe(1);

      // Проверяем, что кеш работает
      const composition2 = cacheComposer.getComposition();

      cacheComposer.getPropsView();

      expect(composition1).toBe(composition2);
      expect(cacheComposer.getCreateCompositionCallCount()).toBe(1);
      expect(cacheComposer.getCreatePropsViewCallCount()).toBe(1);

      // Очищаем кеш
      cacheComposer.testClearCache();

      // Проверяем, что оба объекта пересоздаются
      const composition3 = cacheComposer.getComposition();

      cacheComposer.getPropsView();

      expect(composition1).not.toBe(composition3);
      expect(cacheComposer.getCreateCompositionCallCount()).toBe(2);
      expect(cacheComposer.getCreatePropsViewCallCount()).toBe(2);
    });

    it('должен позволять повторную очистку кеша без ошибок', () => {
      // Создаем кеш
      cacheComposer.getComposition();
      cacheComposer.getPropsView();

      // Очищаем несколько раз подряд
      expect(() => {
        cacheComposer.testClearCache();
        cacheComposer.testClearCache();
        cacheComposer.testClearCache();
      }).not.toThrow();

      // Проверяем, что после множественной очистки все еще работает корректно
      cacheComposer.getComposition();
      cacheComposer.getPropsView();
      expect(cacheComposer.getCreateCompositionCallCount()).toBe(2);
      expect(cacheComposer.getCreatePropsViewCallCount()).toBe(2);
    });
  });
});
